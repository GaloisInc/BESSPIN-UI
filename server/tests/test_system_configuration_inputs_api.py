import unittest
import json
from datetime import datetime
import logging

from app import create_app
from app.models import (
    db,
    SystemConfigurationInput,
)


class TestSystemConfigurationInputApi(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.app.logger.setLevel(logging.CRITICAL)
        db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        self.app.logger.setLevel(logging.NOTSET)

    def test_create(self):
        r = SystemConfigurationInput().query.all()
        self.assertListEqual(r, [])

        label = f'created system-config-input {datetime.utcnow()}'
        response = self.client.post(
            '/api/system-config-input',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict(
                label=label,
                nixConfigFilename='foo.nix',
                nixConfig='{ nix: config }',
                workflowId=1
            )))

        self.assertEqual(response.status_code, 200)
        created_sysconfig = SystemConfigurationInput.query.filter_by(label=label).first()
        self.assertIsNotNone(created_sysconfig)

    def test_create_with_missing_data(self):
        r = SystemConfigurationInput().query.all()
        self.assertListEqual(r, [])

        response = self.client.post(
            '/api/system-config-input',
            headers={'Content-type': 'application/json'},
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

    def test_update(self):
        sc = SystemConfigurationInput().query.all()
        self.assertListEqual(sc, [])
        sc = SystemConfigurationInput(label='sc1', nixConfigFilename='foo.nix', nixConfig='{ config: nix }', workflowId=1)
        db.session.add(sc)
        db.session.commit()

        self.assertEqual(len(SystemConfigurationInput().query.all()), 1)

        label = f'{sc.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/system-config-input/{sc.sysConfigId}',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict(
                label=label,
                nixConfigFilename=sc.nixConfigFilename,
                nixConfig=sc.nixConfig,
                workflowId=sc.workflowId
            )))

        self.assertEqual(response.status_code, 200)
        updated_sysconfig = SystemConfigurationInput.query.filter_by(label=label)
        self.assertIsNotNone(updated_sysconfig)

    def test_update_with_missing_data(self):
        sc = SystemConfigurationInput().query.all()
        self.assertListEqual(sc, [])
        sc = SystemConfigurationInput(label='sc1', nixConfigFilename='foo.nix', nixConfig='{ config: nix }', workflowId=1)
        db.session.add(sc)
        db.session.commit()

        self.assertEqual(len(SystemConfigurationInput().query.all()), 1)

        response = self.client.put(
            f'/api/system-config-input/{sc.sysConfigId}',
            headers={'Content-type': 'application/json'},
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
        sc = SystemConfigurationInput().query.all()
        self.assertListEqual(sc, [])
        sc = SystemConfigurationInput(label='sc1', nixConfigFilename='foo.nix', nixConfig='{ config: nix }', workflowId=1)
        db.session.add(sc)
        db.session.commit()

        self.assertEqual(len(SystemConfigurationInput().query.all()), 1)

        response = self.client.put(
            f'/api/system-config-input/{sc.sysConfigId}',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict(
                label=sc.label + '-NEW',
                nixConfigFilename=sc.nixConfigFilename,
                nixConfig=sc.nixConfig,
                workflowId=sc.workflowId
            )))

        self.assertEqual(response.status_code, 200)
        updated_sysconfig = SystemConfigurationInput.query.filter_by(label='sc1-NEW').first()
        self.assertIsNotNone(updated_sysconfig)

    def test_get(self):
        # add system-config-inputs
        sc = SystemConfigurationInput().query.all()
        self.assertListEqual(sc, [])
        sc1 = SystemConfigurationInput(label='sc1', nixConfigFilename='foo.nix', nixConfig='{ config: nix }', workflowId=1)
        sc2 = SystemConfigurationInput(label='sc2', nixConfigFilename='bar.nix', nixConfig='{ nix: config }', workflowId=2)
        db.session.add_all([sc1, sc2])
        db.session.commit()
        r = SystemConfigurationInput().query.all()
        self.assertEqual(len(r), 2)

        # get them individually
        response = self.client.get(f'/api/system-config-input/{sc1.sysConfigId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'sc1')
        response = self.client.get(f'/api/system-config-input/{sc2.sysConfigId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'sc2')

        # get them all
        response = self.client.get('/api/system-config-input')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(json_response), 2)
