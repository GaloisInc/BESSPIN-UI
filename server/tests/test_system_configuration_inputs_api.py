from helpers import (
    BesspinTestApiBaseClass,
    create_sysConfig,
    create_workflow,
    DEFAULT_HEADERS,
)
import json
from datetime import datetime

from app.models import (
    db,
    SystemConfigurationInput,
    Workflow,
)


class TestSystemConfigurationInputApi(BesspinTestApiBaseClass):
    BASE_ENDPOINT = '/api/system-config-input'

    def test_create(self):
        test_workflow_label = 'TEST WORKFLOW'
        wf = create_workflow(label=test_workflow_label)

        self.assertIsNotNone(wf.workflowId)
        self.assertIsNone(wf.updatedAt)

        r = SystemConfigurationInput().query.all()
        self.assertListEqual(r, [])

        label = f'created system-config-input {datetime.utcnow()}'
        response = self.client.post(
            self.BASE_ENDPOINT,
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
                nixConfigFilename='foo.nix',
                nixConfig='{ nix: config }',
                workflowId=1
            )))

        self.assertEqual(response.status_code, 200)
        created_sysconfig = SystemConfigurationInput.query.filter_by(label=label).first()
        self.assertIsNotNone(created_sysconfig)

        updated_wf = Workflow.query.filter_by(workflowId=wf.workflowId).first()
        self.assertIsNotNone(updated_wf.updatedAt)

    def test_create_with_missing_data(self):
        r = SystemConfigurationInput().query.all()
        self.assertListEqual(r, [])

        response = self.client.post(
            self.BASE_ENDPOINT,
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict()))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {
                'label': "'label' is a required property",
                'nixConfig': "'nixConfig' is a required property",
                'nixConfigFilename': "'nixConfigFilename' is a required property",
                'workflowId': "'workflowId' is a required property",
            },
            'message': 'Input payload validation failed'})

    def test_create_with_nonexistent_workflow(self):
        self.assertIsNone(Workflow.query.get(1))
        response = self.client.post(
            self.BASE_ENDPOINT,
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                workflowId=1,
                label='SYSCONFIG WITH NONEXISTENT WORKFLOW',
                nixConfigFilename='test.nix',
                nixConfig='{ nix: "Config" }',
            ))
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'message': 'Unable to find given workflow',
            'workflowId': 1,
        })

    def test_update(self):
        test_workflow_label = 'TEST WORKFLOW'
        wf = create_workflow(label=test_workflow_label)

        self.assertIsNotNone(wf.workflowId)
        self.assertIsNone(wf.updatedAt)

        sc = SystemConfigurationInput().query.all()
        self.assertListEqual(sc, [])
        sc = create_sysConfig(label='sc1', nixConfigFilename='foo.nix', nixConfig='{ config: nix }', workflowId=wf.workflowId)

        self.assertEqual(len(SystemConfigurationInput().query.all()), 1)

        label = f'{sc.label}-{datetime.now()}'
        config = f'{sc.nixConfig}-{datetime.now()}'
        filename = f'new-{sc.nixConfigFilename}'
        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{sc.sysConfigId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                sysConfigId=sc.sysConfigId,
                label=label,
                nixConfigFilename=filename,
                nixConfig=config,
                workflowId=sc.workflowId
            )))

        self.assertEqual(response.status_code, 200)
        updated_sysconfig = SystemConfigurationInput.query.filter_by(label=label).first()
        self.assertIsNotNone(updated_sysconfig)
        self.assertEqual(updated_sysconfig.label, label)
        self.assertEqual(updated_sysconfig.nixConfig, config)
        self.assertEqual(updated_sysconfig.nixConfigFilename, filename)
        self.assertNotEqual(updated_sysconfig.updatedAt, db.null())

        updated_wf = Workflow.query.filter_by(workflowId=wf.workflowId).first()
        self.assertIsNotNone(updated_wf.updatedAt)

    def test_update_with_missing_data(self):
        sc = SystemConfigurationInput().query.all()
        self.assertListEqual(sc, [])
        sc = create_sysConfig(label='sc1', nixConfigFilename='foo.nix', nixConfig='{ config: nix }', workflowId=1)

        self.assertEqual(len(SystemConfigurationInput().query.all()), 1)

        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{sc.sysConfigId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict()))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {
                'label': "'label' is a required property",
                'nixConfig': "'nixConfig' is a required property",
                'nixConfigFilename': "'nixConfigFilename' is a required property",
                'workflowId': "'workflowId' is a required property",
            },
            'message': 'Input payload validation failed'})

    def test_update_label(self):
        wf = create_workflow(label='test-wf')

        sc = SystemConfigurationInput().query.all()
        self.assertListEqual(sc, [])
        sc = create_sysConfig(label='sc1', nixConfigFilename='foo.nix', nixConfig='{ config: nix }', workflowId=wf.workflowId)

        self.assertEqual(len(SystemConfigurationInput().query.all()), 1)

        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{sc.sysConfigId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                sysConfigId=sc.sysConfigId,
                label=sc.label + '-NEW',
                nixConfigFilename=sc.nixConfigFilename,
                nixConfig=sc.nixConfig,
                workflowId=sc.workflowId
            )))

        self.assertEqual(response.status_code, 200)
        updated_sysconfig = SystemConfigurationInput.query.filter_by(label='sc1-NEW').first()
        self.assertIsNotNone(updated_sysconfig)

    def test_update_nonexistent_sysconfig(self):
        self.assertIsNone(SystemConfigurationInput.query.get(1))
        response = self.client.put(
            f'{self.BASE_ENDPOINT}/1',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                sysConfigId=1,
                label='NONEXISTENT SYSCONFIG',
                nixConfigFilename='config.nix',
                nixConfig='{ nix: "config" }',
                workflowId=1
            ))
        )
        self.assertEqual(response.status_code, 404)

    def test_attempt_to_change_workflow(self):
        wf = create_workflow(label='INITIAL WORKFLOW')
        self.assertIsNotNone(wf)
        sc = create_sysConfig(
            workflowId=wf.workflowId,
            label='TEST sysconfig',
            nixConfigFilename='test.nix',
            nixConfig='{ nix: "config" }',
        )
        self.assertIsNotNone(sc)

        response = self.client.put(
            f'{self.BASE_ENDPOINT}/{sc.sysConfigId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                workflowId=sc.workflowId + 1,
                sysConfigId=sc.sysConfigId,
                label=sc.label,
                nixConfigFilename='test.nix',
                nixConfig='{ config: "nix" }'
            ))
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'message': 'Cannot change workflow association',
        })

    def test_get(self):
        # add system-config-inputs
        sc = SystemConfigurationInput().query.all()
        self.assertListEqual(sc, [])
        sc1 = create_sysConfig(label='sc1', nixConfigFilename='foo.nix', nixConfig='{ config: nix }', workflowId=1)
        sc2 = create_sysConfig(label='sc2', nixConfigFilename='bar.nix', nixConfig='{ nix: config }', workflowId=2)

        r = SystemConfigurationInput().query.all()
        self.assertEqual(len(r), 2)

        # get them individually
        response = self.client.get(f'{self.BASE_ENDPOINT}/{sc1.sysConfigId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'sc1')
        response = self.client.get(f'{self.BASE_ENDPOINT}/{sc2.sysConfigId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'sc2')

        # get them all
        response = self.client.get(self.BASE_ENDPOINT)
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(json_response), 2)

    def test_get_nonexistent_sysconfig(self):
        self.assertIsNone(SystemConfigurationInput.query.get(1))
        response = self.client.get(f'{self.BASE_ENDPOINT}/1')
        self.assertEqual(response.status_code, 404)
