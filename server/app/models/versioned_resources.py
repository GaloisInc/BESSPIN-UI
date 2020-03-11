from . import db
from .metadata_mixin import MetaDataColumnsMixin


class VersionedResourceType(db.Model):
    __tablename__ = 'versionedResourceTypes'
    resourceTypeId = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(64), index=True, unique=True, nullable=False)

    def __repr__(self):
        return f'<VersionedResourceType {self.label}>'

    ALLOWED_TYPES = ['hdl', 'os', 'toolchain']

    @staticmethod
    def load_allowed_types(db_conn=db.session):
        for t in VersionedResourceType.ALLOWED_TYPES:
            resource_type = VersionedResourceType.query.filter_by(label=t).first()
            if resource_type is None:
                resource_type = VersionedResourceType(label=t)
            db_conn.add(resource_type)
        db_conn.commit()


class VersionedResource(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'versionedResources'

    resourceId = db.Column(db.Integer, primary_key=True)
    resourceTypeId = db.Column(
        db.Integer,
        db.ForeignKey('versionedResourceTypes.resourceTypeId'),
        nullable=False
    )
    url = db.Column(db.String(256), index=True, nullable=False)
    version = db.Column(db.String(256), index=True, nullable=False)

    resourceType = db.relationship('VersionedResourceType')

    __table_args__ = (
        db.UniqueConstraint('url', 'version', name='versioned_resources_uc'),
    )

    def __repr__(self):
        return f'<VersionedResource id="{self.resourceId}" label="{self.label}" url="{self.url}" version="{self.version}">'  # noqa E501
