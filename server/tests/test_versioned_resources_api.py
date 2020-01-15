import unittest
import json
from datetime import datetime
import logging

from app import create_app
from app.models import (
    db,
    VersionedResourceType,
    VersionedResource,
)


class TestVersionedResourcesApi(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.app.logger.setLevel(logging.CRITICAL)
        db.create_all()
        VersionedResourceType.load_allowed_types()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        self.app.logger.setLevel(logging.NOTSET)

    def test_create(self):
        r = VersionedResource().query.all()
        t = VersionedResourceType().query.filter_by(label='hdl').first()
        self.assertListEqual(r, [])

        label = f'created resource {datetime.utcnow()}'
        response = self.client.post(
            '/api/versioned-resource',
            data=json.dumps(dict(
                label=label,
                url='https://github.com/test/repo.git',
                version='1',
                resourceType=dict(resourceTypeId=t.resourceTypeId, label=t.label)
            )))

        self.assertEqual(response.status_code, 200)
        created_resource = VersionedResource.query.filter_by(label=label).first()
        self.assertIsNotNone(created_resource)

    def test_update(self):
        r = VersionedResource().query.all()
        t = VersionedResourceType().query.filter_by(label='hdl').first()
        self.assertListEqual(r, [])
        r = VersionedResource(label='r1', url='https://test.url.one', version='1', resourceTypeId=1)
        db.session.add(r)
        db.session.commit()

        self.assertEqual(len(VersionedResource().query.all()), 1)

        label = f'{r.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/versioned-resource/{r.resourceId}',
            data=json.dumps(dict(
                label=label,
                url=r.url,
                version=r.version,
                resourceType=dict(resourceTypeId=t.resourceTypeId, label=t.label)
            )))

        self.assertEqual(response.status_code, 200)
        created_resource = VersionedResource.query.filter_by(label=label)
        self.assertIsNotNone(created_resource)

    def test_get(self):
        # add two resources
        r = VersionedResource().query.all()
        self.assertListEqual(r, [])
        r1 = VersionedResource(label='r1', url='https://test.url.one', version='1', resourceTypeId=1)
        r2 = VersionedResource(label='r2', url='https://test.url.two', version='1', resourceTypeId=1)
        db.session.add_all([r1, r2])
        db.session.commit()
        r = VersionedResource().query.all()
        self.assertEqual(len(r), 2)

        # get them individually
        response = self.client.get(f'/api/versioned-resource/{r1.resourceId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'r1')
        response = self.client.get(f'/api/versioned-resource/{r2.resourceId}')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['label'], 'r2')

        # get them all
        response = self.client.get('/api/versioned-resource')
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(len(json_response), 2)
