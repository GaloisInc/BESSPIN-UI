from . import db
from .metadata_mixin import MetaDataColumnsMixin


class VersionedResourceTypes(db.Model):
    __tablename__ = 'versionedResourceTypes'
    resourceTypeId = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(64), index=True, unique=True, nullable=False)

    def __repr__(self):
        return '<VersionedResourceTypes {}>'.format(self.label)

    ALLOWED_TYPES = ['hdl', 'os', 'toolchain']


class VersionedResources(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'versionedResources'

    resourceId = db.Column(db.Integer, primary_key=True)
    resourceTypeId = db.Column(
        db.Integer,
        db.ForeignKey('versionedResourceTypes.resourceTypeId'),
        nullable=False
    )
    url = db.Column(db.String(256), index=True, unique=True, nullable=False)
    version = db.Column(db.String(256), index=True, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('url', 'version', name='versioned_resources_uc'),
    )

    def __repr__(self):
        return f'<VersionedResources id="{self.resourceId}" label="{self.label}" url="{self.url}" version="{self.version}">'  # noqa E501
