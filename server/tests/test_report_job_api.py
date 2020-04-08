from helpers import (
    BesspinTestApiBaseClass,
    DEFAULT_HEADERS,
    create_featureModel,
    create_reportJob,
    create_vulnerabilityConfig,
    create_workflow
)
import json
from datetime import datetime

from app.models import (
    JobStatus,
    ReportJob,
    Workflow
)


class TestReportJobApi(BesspinTestApiBaseClass):
    BASE_ENDPOINT = '/api/report-job'

    def setUp(self):
        super(TestReportJobApi, self).setUp()

        JobStatus.load_allowed_statuses()

        w = create_workflow(label='test workflow')

        self.workflowId = w.workflowId
        self.status = JobStatus().query.filter_by(label='running').first()

    def test_create(self):
        r = ReportJob().query.all()
        self.assertListEqual(r, [])

        fm = create_featureModel(
            uid=f'uid-{datetime.utcnow()}',
            label=f'feat model {datetime.utcnow()}',
        )
        create_vulnerabilityConfig(
            label=f'vuln config {datetime.utcnow()}',
            workflowId=1,
            vulnClass='BufferErrors',
            featureModelUid=fm.uid
        )

        label = f'created report job {datetime.utcnow()}'
        response = self.client.post(
            self.BASE_ENDPOINT,
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
                status=dict(statusId=self.status.statusId, label=self.status.label),
                workflowId=1
            )))

        self.assertEqual(response.status_code, 200)
        created_report_job = ReportJob.query.filter_by(label=label).first()
        self.assertIsNotNone(created_report_job)

    def test_create_with_nonexistent_workflow(self):
        nonexistent_workflow_id = 2
        self.assertIsNone(Workflow.query.get(nonexistent_workflow_id))
        response = self.client.post(
            self.BASE_ENDPOINT,
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                workflowId=nonexistent_workflow_id,
                label='REPORT JOB w/ NONEXISTENT WORKFLOW'
            ))
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'message': 'Unable to find given workflow',
            'workflowId': nonexistent_workflow_id,
        })

    def test_create_with_missing_data(self):
        r = ReportJob().query.all()
        self.assertListEqual(r, [])

        label = f'created report job {datetime.utcnow()}'
        response = self.client.post(
            self.BASE_ENDPOINT,
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
            )))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'workflowId': "'workflowId' is a required property"},
            'message': 'Input payload validation failed'})

    def test_update(self):
        r = ReportJob().query.all()
        self.assertListEqual(r, [])
        r = create_reportJob(
            label='r1',
            statusId=self.status.statusId,
            workflowId=self.workflowId
        )

        self.assertEqual(len(ReportJob().query.all()), 1)

        label = f'{r.label}-{datetime.now()}'
        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{r.jobId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                jobId=r.jobId,
                label=label,
                status=dict(statusId=self.status.statusId, label=self.status.label),
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
            f'{self.BASE_ENDPOINT}/{r.jobId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                jobId=r.jobId,
                label=label
            )))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'status': "'status' is a required property", 'workflowId': "'workflowId' is a required property"},
            'message': 'Input payload validation failed'})

    def test_update_with_invalid_status(self):
        nonexistent_status_id = 10
        self.assertIsNone(JobStatus.query.get(nonexistent_status_id))
        rj = create_reportJob(
            workflowId=self.workflowId,
            label='REPORT w/ NONEXISTENT STATUS',
            statusId=self.status.statusId,
        )
        self.assertIsNotNone(rj)
        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{rj.jobId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                workflowId=rj.workflowId,
                jobId=rj.jobId,
                label=rj.label,
                status=dict(statusId=nonexistent_status_id, label='NONEXISTENT STATUS')
            ))
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'message': 'Unable to find specified job status',
            'status': {
                'statusId': nonexistent_status_id,
                'label': 'NONEXISTENT STATUS'
            }
        })

    def test_attempt_to_change_workflow(self):
        rj = create_reportJob(
            workflowId=self.workflowId,
            label='TEST REPORT',
            statusId=self.status.statusId,
        )
        self.assertIsNotNone(rj)

        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{rj.jobId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                workflowId=rj.workflowId + 1,
                jobId=rj.jobId,
                label=rj.label,
                status=dict(statusId=rj.status.statusId, label=rj.status.label)
            ))
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'message': 'Cannot change workflow association',
        })

    def test_get(self):
        # add two report jobs
        r = ReportJob().query.all()
        self.assertListEqual(r, [])
        r1 = create_reportJob(label='r1', statusId=1, workflowId=self.workflowId)
        r2 = create_reportJob(label='r2', statusId=1, workflowId=self.workflowId)

        r = ReportJob().query.all()
        self.assertEqual(len(r), 2)

        # get them individually
        response = self.client.get(f'{self.BASE_ENDPOINT}/{r1.jobId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'r1')
        response = self.client.get(f'{self.BASE_ENDPOINT}/{r2.jobId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'r2')

        # get them all
        response = self.client.get(self.BASE_ENDPOINT)
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(json_response), 2)

    def get_nonexistent_report(self):
        self.assertIsNone(ReportJob.query.get(1))
        response = self.get(f'{self.BASE_ENDPOINT}/1')
        self.assertEqual(response.status_code, 404)
