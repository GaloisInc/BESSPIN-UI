from helpers import (
    BesspinTestApiBaseClass,
    create_versionedResource,
    DEFAULT_HEADERS
)
import json
from datetime import datetime

from app.models import (
    VersionedResourceType,
    VersionedResource,
)


class TestVersionedResourcesApi(BesspinTestApiBaseClass):

    def setUp(self):
        super(TestVersionedResourcesApi, self).setUp()
        VersionedResourceType.load_allowed_types()

    def test_create(self):
        r = VersionedResource().query.all()
        t = VersionedResourceType().query.filter_by(label='hdl').first()
        self.assertListEqual(r, [])

        label = f'created resource {datetime.utcnow()}'
        response = self.client.post(
            '/api/versioned-resource',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
                url='https://github.com/test/repo.git',
                version='1',
                resourceType=dict(resourceTypeId=t.resourceTypeId, label=t.label)
            )))

        self.assertEqual(response.status_code, 200)
        created_resource = VersionedResource.query.filter_by(label=label).first()
        self.assertIsNotNone(created_resource)

    def test_create_with_missing_data(self):
        r = VersionedResource().query.all()
        self.assertListEqual(r, [])

        label = f'created resource {datetime.utcnow()}'
        response = self.client.post(
            '/api/versioned-resource',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
                url='https://github.com/test/repo.git',
                version='1'
            )))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'resourceType': "'resourceType' is a required property"},
            'message': 'Input payload validation failed'})

    def test_update(self):
        r = VersionedResource().query.all()
        t = VersionedResourceType().query.filter_by(label='hdl').first()
        self.assertListEqual(r, [])
        r = create_versionedResource(label='r1', url='https://test.url.one', version='1', resourceTypeId=1)

        self.assertEqual(len(VersionedResource().query.all()), 1)

        label = f'{r.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/versioned-resource/{r.resourceId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
                url=r.url,
                version=r.version,
                resourceType=dict(resourceTypeId=t.resourceTypeId, label=t.label)
            )))

        self.assertEqual(response.status_code, 200)
        created_resource = VersionedResource.query.filter_by(label=label)
        self.assertIsNotNone(created_resource)

    def test_update_with_missing_data(self):
        r = VersionedResource().query.all()
        self.assertListEqual(r, [])
        r = create_versionedResource(label='r1', url='https://test.url.one', version='1', resourceTypeId=1)

        self.assertEqual(len(VersionedResource().query.all()), 1)

        label = f'{r.label}-{datetime.now()}'
        response = self.client.put(
            f'/api/versioned-resource/{r.resourceId}',
            headers=DEFAULT_HEADERS,
            data=json.dumps(dict(
                label=label,
                url=r.url,
                version=r.version,
            )))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'errors': {'resourceType': "'resourceType' is a required property"},
            'message': 'Input payload validation failed'})

    def test_get(self):
        # add two resources
        r = VersionedResource().query.all()
        self.assertListEqual(r, [])
        r1 = create_versionedResource(label='r1', url='https://test.url.one', version='1', resourceTypeId=1)
        r2 = create_versionedResource(label='r2', url='https://test.url.two', version='1', resourceTypeId=1)

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
