import unittest
from sqlalchemy.exc import IntegrityError

from app import create_app
from app.models import (
    db,
    VersionedResources,
    VersionedResourceTypes,
)


class VersionedResourceModelTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        VersionedResourceTypes.load_allowed_types()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_resource_types_loaded(self):
        types = VersionedResourceTypes().query.all()
        self.assertTrue(len(types) == len(VersionedResourceTypes.ALLOWED_TYPES))

    def test_unique_url_version_constraint(self):
        hdl_type_id = VersionedResourceTypes().query.filter_by(label='hdl').first().resourceTypeId
        test_url = 'https://github.com/fancy-pants/master.git'
        test_version = '1'

        db.session.add(
            VersionedResources(
                label='test resource 1',
                url=test_url,
                version=test_version,
                resourceTypeId=hdl_type_id
            )
        )
        db.session.add(
            VersionedResources(
                label='test resource 2',
                url=test_url,
                version=test_version,
                resourceTypeId=hdl_type_id
            )
        )

        with self.assertRaises(IntegrityError):
            db.session.commit()

    def test_allow_same_url_different_version(self):
        hdl_type_id = VersionedResourceTypes().query.filter_by(label='hdl').first().resourceTypeId
        test_url = 'https://github.com/fancy-pants/master.git'

        db.session.add(
            VersionedResources(
                label='test resource 1',
                url=test_url,
                version='1',
                resourceTypeId=hdl_type_id
            )
        )
        db.session.add(
            VersionedResources(
                label='test resource 2',
                url=test_url,
                version='2',
                resourceTypeId=hdl_type_id
            )
        )

        db.session.commit()

        self.assertEqual(len(VersionedResources.query.all()), 2)
