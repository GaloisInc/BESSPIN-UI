from . import db
from .metadata_mixin import MetaDataColumnsMixin


class FeatureModelInput(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'featureModelInputs'

    featModelId = db.Column(db.Integer, primary_key=True)
    hdlId = db.Column(
        db.Integer,
        db.ForeignKey('versionedResources.resourceId', ondelete='CASCADE'),
        nullable=False
    )

    def __repr__(self):
        return f'<FeatureModelInput id="{self.featModelId}" label="{self.label}" hdlId="{self.hdlId}">'  # noqa E501
