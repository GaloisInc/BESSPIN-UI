from helpers import (
    BesspinTestApiBaseClass,
    DEFAULT_HEADERS,
    create_reportJob,
    create_workflow
)
import json
from datetime import datetime

from app.models import (
    db,
    JobStatus,
    ReportJob,
    Workflow
)


class TestReportJobApi(BesspinTestApiBaseClass):

    def setUp(self):
        super(TestReportJobApi, self).setUp()

        JobStatus.load_allowed_statuses()

        w = Workflow(label='test workflow')

        db.session.add(w)
        db.session.commit()

        w = Workflow().query.filter_by(label='test workflow').first()

        self.workflowId = w.workflowId

    def test_create(self):
        r = ReportJob().query.all()
        t = JobStatus().query.filter_by(label='running').first()
        self.assertListEqual(r, [])
        self.assertIsNotNone(t)

        label = f'created report job {datetime.utcnow()}'
        response = self.client.post(
            '/api/report-job',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
                jobStatus=dict(statusId=t.statusId, label=t.label),
                workflowId=1
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
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
            )))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'jobStatus': "'jobStatus' is a required property", 'workflowId': "'workflowId' is a required property"},
            'message': 'Input payload validation failed'})

    def test_create_with_invalid_job_status_id(self):
        rj_test_label = f'test report job {datetime.now()}'
        wf_test_label = f'test workflow {datetime.now()}'
        wf = create_workflow(label=wf_test_label)

        response = self.client.post(
            '/api/report-job',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=rj_test_label,
                jobStatus=dict(statusId=1000, label='BAD STATUS'),
                workflowId=wf.workflowId
            ))
        )
        self.assertEqual(response.status_code, 200)
        created_report_job = ReportJob.query.filter_by(label=rj_test_label).first()
        self.assertIsNotNone(created_report_job)
        self.assertEqual(created_report_job.status.label, JobStatus.ALLOWED_STATUSES[0])

    def test_update(self):
        r = ReportJob().query.all()
        t = JobStatus().query.filter_by(label='running').first()
        self.assertListEqual(r, [])
        r = create_reportJob(
            label='r1',
            statusId=1,
            workflowId=self.workflowId
        )

        self.assertEqual(len(ReportJob().query.all()), 1)

        label = f'{r.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/report-job/{r.jobId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                jobId=r.jobId,
                label=label,
                jobStatus=dict(statusId=t.statusId, label=t.label),
                workflowId=self.workflowId
            )))

        self.assertEqual(response.status_code, 200)
        created_report_job = ReportJob.query.filter_by(label=label)
        self.assertIsNotNone(created_report_job)

    def test_update_with_missing_data(self):
        r = ReportJob().query.all()
        self.assertListEqual(r, [])
        r = create_reportJob(
            label='r1',
            statusId=1,
            workflowId=self.workflowId
        )

        self.assertEqual(len(ReportJob().query.all()), 1)

        label = f'{r.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/report-job/{r.jobId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                jobId=r.jobId,
                label=label
            )))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'jobStatus': "'jobStatus' is a required property", 'workflowId': "'workflowId' is a required property"},
            'message': 'Input payload validation failed'})

    def test_get(self):
        # add two report jobs
        r = ReportJob().query.all()
        self.assertListEqual(r, [])
        r1 = create_reportJob(label='r1', statusId=1, workflowId=self.workflowId)
        r2 = create_reportJob(label='r2', statusId=1, workflowId=self.workflowId)

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
