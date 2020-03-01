from helpers import (
    BesspinTestApiBaseClass,
    create_reportJob,
    create_sysConfig,
    create_vulnerabilityConfig,
    create_workflow,
    DEFAULT_HEADERS
)
import json
from datetime import datetime

from app.models import (
    JobStatus,
    SystemConfigurationInput,
    VulnerabilityConfigurationInput,
    Workflow
)


class TestWorkflowApi(BesspinTestApiBaseClass):
    BASE_ENDPOINT = '/api/workflow'

    def setUp(self):
        super(TestWorkflowApi, self).setUp()

        JobStatus.load_allowed_statuses()

    def test_create(self):
        r = Workflow().query.all()
        self.assertListEqual(r, [])

        label = f'created workflow {datetime.utcnow()}'
        response = self.client.post(
            self.BASE_ENDPOINT,
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
            )))

        self.assertEqual(response.status_code, 200)
        created_workflow = Workflow.query.filter_by(label=label).first()
        self.assertIsNotNone(created_workflow)

    def test_create_with_missing_data(self):
        r = Workflow().query.all()
        self.assertListEqual(r, [])

        response = self.client.post(
            self.BASE_ENDPOINT,
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict()))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'label': "'label' is a required property"},
            'message': 'Input payload validation failed'})

    def test_update(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = create_workflow(label='w1')

        self.assertEqual(len(Workflow().query.all()), 1)

        label = f'{w.label}-{datetime.now()}'
        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{w.workflowId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
            )))

        self.assertEqual(response.status_code, 200)
        updated_workflow = Workflow.query.filter_by(label=label)
        self.assertIsNotNone(updated_workflow)

    def test_update_with_missing_data(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = create_workflow(label='w1')

        self.assertEqual(len(Workflow().query.all()), 1)

        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{w.workflowId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict()))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'label': "'label' is a required property"},
            'message': 'Input payload validation failed'})

    def test_update_label(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = create_workflow(label='w1')

        self.assertEqual(len(Workflow().query.all()), 1)

        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{w.workflowId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=w.label + '-NEW',
            )))

        self.assertEqual(response.status_code, 200)
        updated_workflow = Workflow.query.filter_by(label='w1-NEW').first()
        self.assertIsNotNone(updated_workflow)

    def test_update_nonexistent_workflow(self):
        self.assertIsNone(Workflow.query.get(1))
        response = self.client.put(
            f'{self.BASE_ENDPOINT}/1',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(label='TEST WORKFLOW UPDATE')),
        )
        self.assertEqual(response.status_code, 404)

    def test_get(self):
        # add workflows
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w1 = create_workflow(label='w1')
        w2 = create_workflow(label='w2')

        r = Workflow().query.all()
        self.assertEqual(len(r), 2)

        # get them individually
        response = self.client.get(f'{self.BASE_ENDPOINT}/{w1.workflowId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'w1')
        response = self.client.get(f'{self.BASE_ENDPOINT}/{w2.workflowId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'w2')

        # get them all
        response = self.client.get(self.BASE_ENDPOINT)
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(json_response), 2)

    def test_get_without_log_data(self):
        wf = create_workflow(label='TEST WORKFLOW')
        self.assertIsNotNone(wf)
        succeeded_job_status = JobStatus.query.filter_by(label='running').first()
        self.assertIsNotNone(succeeded_job_status)
        rj = create_reportJob(
            workflowId=wf.workflowId,
            label='TEST REPORT JOB',
            statusId=succeeded_job_status.statusId
        )
        self.assertIsNotNone(rj)

        response = self.client.get(f'{self.BASE_ENDPOINT}/{rj.jobId}')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.get_json()['reportJob']['log'])

    def test_get_with_log_data(self):
        wf = create_workflow(label='TEST WORKFLOW')
        self.assertIsNotNone(wf)
        succeeded_job_status = JobStatus.query.filter_by(label='succeeded').first()
        self.assertIsNotNone(succeeded_job_status)
        rj = create_reportJob(
            workflowId=wf.workflowId,
            label='TEST REPORT JOB',
            statusId=succeeded_job_status.statusId
        )
        self.assertIsNotNone(rj)

        response = self.client.get(f'{self.BASE_ENDPOINT}/{rj.jobId}')
        self.assertEqual(response.status_code, 200)
        self.assertIsNotNone(response.get_json()['reportJob']['log'])

    def test_null_subobjects(self):
        wf = create_workflow(label='test workflow')
        response = self.client.get(f'{self.BASE_ENDPOINT}/{wf.workflowId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertIsNone(json_response['systemConfigurationInput'])
        self.assertIsNone(json_response['vulnerabilityConfigurationInput'])
        self.assertIsNone(json_response['reportJob'])

    def test_get_nonexistent_workflow(self):
        self.assertIsNone(Workflow.query.get(1))
        response = self.client.get(f'{self.BASE_ENDPOINT}/1')
        self.assertEqual(response.status_code, 404)

    def test_duplicate_just_workflow(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = create_workflow(label='w1')

        self.assertEqual(len(Workflow().query.all()), 1)

        response = self.client.get(f'api/workflow/duplicate/{w.workflowId}')

        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        created_workflow = Workflow.query.get(json_response['workflowId'])
        self.assertIsNotNone(created_workflow)

    def test_duplicate_workflow_with_only_sysconfig(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = create_workflow(label='w1')
        sc = create_sysConfig(
            label='sc1',
            workflowId=w.workflowId,
            nixConfigFilename='test.nix',
            nixConfig='{ config: "nix" }')

        self.assertEqual(len(Workflow().query.all()), 1)
        self.assertEqual(len(SystemConfigurationInput().query.all()), 1)

        response = self.client.get(f'api/workflow/duplicate/{w.workflowId}')

        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        created_workflow = Workflow.query.get(json_response['workflowId'])
        self.assertIsNotNone(created_workflow)
        self.assertNotEqual(created_workflow.workflowId, w.workflowId)
        json_sysconfig = json_response['systemConfigurationInput']
        created_sysconfig = SystemConfigurationInput.query.get(json_sysconfig['sysConfigId'])
        self.assertIsNotNone(created_sysconfig)
        self.assertNotEqual(created_sysconfig.sysConfigId, sc.sysConfigId)

    def test_duplicate_workflow_sysconfig_and_vulnconfig(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = create_workflow(label='w1')
        sc = create_sysConfig(
            label='sc1',
            workflowId=w.workflowId,
            nixConfigFilename='test.nix',
            nixConfig='{ config: "nix" }')
        vc = create_vulnerabilityConfig(
            label='vc1',
            workflowId=w.workflowId,
            vulnClass='TEST VULNCLASS',
            featureModelUid='TEST-UID`'
        )

        self.assertEqual(len(Workflow().query.all()), 1)
        self.assertEqual(len(SystemConfigurationInput().query.all()), 1)
        self.assertEqual(len(VulnerabilityConfigurationInput().query.all()), 1)

        response = self.client.get(f'api/workflow/duplicate/{w.workflowId}')

        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        created_workflow = Workflow.query.get(json_response['workflowId'])
        self.assertIsNotNone(created_workflow)
        self.assertNotEqual(created_workflow.workflowId, w.workflowId)
        json_sysconfig = json_response['systemConfigurationInput']
        created_sysconfig = SystemConfigurationInput.query.get(json_sysconfig['sysConfigId'])
        self.assertIsNotNone(created_sysconfig)
        self.assertNotEqual(created_sysconfig.sysConfigId, sc.sysConfigId)
        json_vulnConfig = json_response['vulnerabilityConfigurationInput']
        created_vulnconfig = VulnerabilityConfigurationInput.query.get(json_vulnConfig['vulnConfigId'])
        self.assertIsNotNone(created_vulnconfig)
        self.assertNotEqual(created_vulnconfig.vulnConfigId, vc.vulnConfigId)
