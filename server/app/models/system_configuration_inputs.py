from . import db
from .metadata_mixin import MetaDataColumnsMixin


class SystemConfigurationInput(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'systemConfigurationInputs'

    sysConfigId = db.Column(db.Integer, primary_key=True)
    # NOTE: disabling columns that are not going to be used initially
    #       keeping them here as the assumption is that we'll need them
    #       post 1/27/2020 release...
    # featConfigId = db.Column(
    #     db.Integer,
    #     db.ForeignKey('featureConfigurationInputs.featConfigId', ondelete='SET NULL'),  # noqa E501
    #     comment='if null, it implies they are using the configuration implicit in the HDL',  # noqa E501
    #     nullable=False
    # )
    # hdlId = db.Column(
    #     db.Integer,
    #     db.ForeignKey('versionedResources.resourceId', ondelete='SET NULL'),
    # )
    # osId = db.Column(
    #     db.Integer,
    #     db.ForeignKey('versionedResources.resourceId', ondelete='SET NULL'),
    # )
    # toolChainId = db.Column(
    #     db.Integer,
    #     db.ForeignKey('versionedResources.resourceId', ondelete='SET NULL'),
    # )
    nixConfigFilename = db.Column(
        db.String(256),
        comment='Along with "nixConfig", this is a temporary column until we get full support for versioned resources',
    )
    nixConfig = db.Column(
        db.Text,
        comment='This column is our temporary one for the initial UI sys-config screen where we will simply provide a way to upload a nix config',  # noqa E501
    )
    workflowId = db.Column(
        db.Integer,
        db.ForeignKey('workflows.workflowId', ondelete='CASCADE'),  # noqa E501
        nullable=False,
        comment='a system configuration input should always be associated with a workflow'
    )

    __table_args__ = (
        db.UniqueConstraint(
            # 'featConfigId',
            # 'hdlId',
            # 'osId',
            # 'toolChainId',
            'nixConfig',
            name='system_config_inputs_uc'
        ),
    )

    def __repr__(self):
        return f'<SystemConfigurationInput id="{self.sysConfigId}" workflow="{self.workflowId}" label="{self.label}">'  # noqa E501
