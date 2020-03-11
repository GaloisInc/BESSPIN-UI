from . import db
from .metadata_mixin import MetaDataColumnsMixin


class FeatureConfigurationInput(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'featureConfigurationInputs'

    featConfigId = db.Column(db.Integer, primary_key=True)
    configurationJson = db.Column(
        db.Text,
        comment='JSON generated during feature configuration'
    )
    featModelId = db.Column(
        db.Integer,
        db.ForeignKey('featureModelInputs.featModelId', ondelete='CASCADE'),
        nullable=False,
        comment='can have many configurations for a model'
    )

    __table_args__ = (
        db.UniqueConstraint(
            'featModelId',
            'configurationJson',
            name='feat_config_inputs_uc'
        ),
    )

    def __repr__(self):
        return f'<FeatureConfigurationInput id="{self.featConfigId}" label="{self.label}" featModelId="{self.featModelId}">'  # noqa E501
