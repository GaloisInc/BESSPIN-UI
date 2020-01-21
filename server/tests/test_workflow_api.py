import unittest
import json
from datetime import datetime
import logging

from app import create_app
from app.models import (
    db,
    Workflow,
)


class TestWorkflowApi(unittest.TestCase):

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
        r = Workflow().query.all()
        self.assertListEqual(r, [])

        label = f'created workflow {datetime.utcnow()}'
        response = self.client.post(
            '/api/workflow',
            headers={'Content-type': 'application/json'},
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
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict()))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'label': "'label' is a required property"},
            'message': 'Input payload validation failed'})

    def test_update(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = Workflow(label='w1')
        db.session.add(w)
        db.session.commit()

        self.assertEqual(len(Workflow().query.all()), 1)

        label = f'{w.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/workflow/{w.workflowId}',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict(
                label=label,
            )))

        self.assertEqual(response.status_code, 200)
        updated_workflow = Workflow.query.filter_by(label=label)
        self.assertIsNotNone(updated_workflow)

    def test_update_with_missing_data(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = Workflow(label='w1')
        db.session.add(w)
        db.session.commit()

        self.assertEqual(len(Workflow().query.all()), 1)

        response = self.client.put(
            f'/api/workflow/{w.workflowId}',
            headers={'Content-type': 'application/json'},
            data=json.dumps(dict()))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'label': "'label' is a required property"},
            'message': 'Input payload validation failed'})

    def test_update_label(self):
        w = Workflow().query.all()
        self.assertListEqual(w, [])
        w = Workflow(label='w1')
        db.session.add(w)
        db.session.commit()

        self.assertEqual(len(Workflow().query.all()), 1)

        response = self.client.put(
            f'/api/workflow/{w.workflowId}',
            headers={'Content-type': 'application/json'},
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
        w1 = Workflow(label='w1')
        w2 = Workflow(label='w2')
        db.session.add_all([w1, w2])
        db.session.commit()
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
