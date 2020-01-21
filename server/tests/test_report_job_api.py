import unittest
import json
from datetime import datetime
import logging

from app import create_app
from app.models import (
    db,
    JobStatus,
    ReportJob,
    SystemConfigurationInput,
)


class TestReportJobApi(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.app.logger.setLevel(logging.CRITICAL)
        db.create_all()
        JobStatus.load_allowed_statuses()
        s = SystemConfigurationInput(
            label='test sysconfig',
            nixConfigFilename='foo.nix',
            nixConfig='{ my: nix: config }',
            workflowId=1)
        db.session.add(s)
        db.session.commit()
        s = SystemConfigurationInput().query.filter_by(label='test sysconfig').first()
        self.sysConfigId = s.sysConfigId
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        self.app.logger.setLevel(logging.NOTSET)

    def test_create(self):
        r = ReportJob().query.all()
        t = JobStatus().query.filter_by(label='running').first()
        self.assertListEqual(r, [])
        self.assertIsNotNone(t)

        label = f'created report job {datetime.utcnow()}'
        response = self.client.post(
            '/api/report-job',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict(
                label=label,
                jobStatus=dict(statusId=t.statusId, label=t.label),
                sysConfigId=self.sysConfigId
            )))

        self.assertEqual(response.status_code, 200)
        created_report_job = ReportJob.query.filter_by(label=label).first()
        self.assertIsNotNone(created_report_job)

    def test_create_with_missing_data(self):
        r = ReportJob().query.all()
        self.assertListEqual(r, [])

        label = f'created report job {datetime.utcnow()}'
        response = self.client.post(
            '/api/report-job',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict(
                label=label,
                sysConfigId=self.sysConfigId
            )))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'jobStatus': "'jobStatus' is a required property"},
            'message': 'Input payload validation failed'})

    def test_update(self):
        r = ReportJob().query.all()
        t = JobStatus().query.filter_by(label='running').first()
        self.assertListEqual(r, [])
        r = ReportJob(label='r1', statusId=1, sysConfigId=self.sysConfigId)
        db.session.add(r)
        db.session.commit()

        self.assertEqual(len(ReportJob().query.all()), 1)

        label = f'{r.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/report-job/{r.jobId}',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict(
                jobId=r.jobId,
                label=label,
                jobStatus=dict(statusId=t.statusId, label=t.label),
                sysConfigId=self.sysConfigId
            )))

        self.assertEqual(response.status_code, 200)
        created_report_job = ReportJob.query.filter_by(label=label)
        self.assertIsNotNone(created_report_job)

    def test_update_with_missing_data(self):
        r = ReportJob().query.all()
        self.assertListEqual(r, [])
        r = ReportJob(label='r1', statusId=1, sysConfigId=self.sysConfigId)
        db.session.add(r)
        db.session.commit()

        self.assertEqual(len(ReportJob().query.all()), 1)

        label = f'{r.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/report-job/{r.jobId}',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict(
                jobId=r.jobId,
                label=label,
                sysConfigId=self.sysConfigId
            )))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'jobStatus': "'jobStatus' is a required property"},
            'message': 'Input payload validation failed'})

    def test_get(self):
        # add two report jobs
        r = ReportJob().query.all()
        self.assertListEqual(r, [])
        r1 = ReportJob(label='r1', statusId=1, sysConfigId=self.sysConfigId)
        r2 = ReportJob(label='r2', statusId=1, sysConfigId=self.sysConfigId)
        db.session.add_all([r1, r2])
        db.session.commit()
        r = ReportJob().query.all()
        self.assertEqual(len(r), 2)

        # get them individually
        response = self.client.get(f'/api/report-job/{r1.jobId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'r1')
        response = self.client.get(f'/api/report-job/{r2.jobId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'r2')

        # get them all
        response = self.client.get('/api/report-job')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(json_response), 2)
