from helpers import (
    BesspinTestApiBaseClass,
    create_workflow,
    DEFAULT_HEADERS
)
import json
from datetime import datetime

from app.models import Workflow


class TestWorkflowApi(BesspinTestApiBaseClass):

    def test_create(self):
        r = Workflow().query.all()
        self.assertListEqual(r, [])

        label = f'created workflow {datetime.utcnow()}'
        response = self.client.post(
            '/api/workflow',
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
            '/api/workflow',
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
            f'/api/workflow/{w.workflowId}',
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
            f'/api/workflow/{w.workflowId}',
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
            f'/api/workflow/{w.workflowId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=w.label + '-NEW',
            )))

        self.assertEqual(response.status_code, 200)
        updated_workflow = Workflow.query.filter_by(label='w1-NEW').first()
        self.assertIsNotNone(updated_workflow)

    def test_get(self):
        # add workflows
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w1 = create_workflow(label='w1')
        w2 = create_workflow(label='w2')

        r = Workflow().query.all()
        self.assertEqual(len(r), 2)

        # get them individually
        response = self.client.get(f'/api/workflow/{w1.workflowId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'w1')
        response = self.client.get(f'/api/workflow/{w2.workflowId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'w2')

        # get them all
        response = self.client.get('/api/workflow')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(json_response), 2)

    def test_null_subobjects(self):
        wf = create_workflow(label='test workflow')
        response = self.client.get(f'/api/workflow/{wf.workflowId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertIsNone(json_response['systemConfigurationInput'])
        self.assertIsNone(json_response['vulnerabilityConfigurationInput'])
        self.assertIsNone(json_response['reportJob'])
