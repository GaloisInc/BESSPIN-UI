from helpers import (
    BesspinTestBaseClass,
    create_versionedResource
)
from sqlalchemy.exc import IntegrityError

from app.models import (
    db,
    VersionedResource,
    VersionedResourceType,
)


class VersionedResourceModelTestCase(BesspinTestBaseClass):

    def setUp(self):
        super(VersionedResourceModelTestCase, self).setUp()
        VersionedResourceType.load_allowed_types()

    def test_resource_types_loaded(self):
        types = VersionedResourceType().query.all()
        self.assertTrue(len(types) == len(VersionedResourceType.ALLOWED_TYPES))

    def test_unique_url_version_constraint(self):
        hdl_type_id = VersionedResourceType().query.filter_by(label='hdl').first().resourceTypeId
        test_url = 'https://github.com/fancy-pants/master.git'
        test_version = '1'

        db.session.add(
            VersionedResource(
                label='test resource 1',
                url=test_url,
                version=test_version,
                resourceTypeId=hdl_type_id
            )
        )
        db.session.add(
            VersionedResource(
                label='test resource 2',
                url=test_url,
                version=test_version,
                resourceTypeId=hdl_type_id
            )
        )

        with self.assertRaises(IntegrityError):
            db.session.commit()

    def test_allow_same_url_different_version(self):
        hdl_type_id = VersionedResourceType().query.filter_by(label='hdl').first().resourceTypeId
        test_url = 'https://github.com/fancy-pants/master.git'

        create_versionedResource(
            label='test resource 1',
            url=test_url,
            version='1',
            resourceTypeId=hdl_type_id
        )
        create_versionedResource(
            label='test resource 2',
            url=test_url,
            version='2',
            resourceTypeId=hdl_type_id
        )

        self.assertEqual(len(VersionedResource.query.all()), 2)

    def test_resource_type_access(self):
        hdl_type_id = VersionedResourceType().query.filter_by(label='hdl').first().resourceTypeId
        test_url = 'https://github.com/fancy-pants/master.git'

        create_versionedResource(
            label='test resource 1',
            url=test_url,
            version='1',
            resourceTypeId=hdl_type_id
        )

        versionedResource = VersionedResource.query.filter_by(url=test_url).first()

        self.assertIsNotNone(versionedResource)
        self.assertEqual(versionedResource.resourceType.label, 'hdl')
