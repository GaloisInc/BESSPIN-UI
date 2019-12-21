"""initial db setup

Revision ID: 12b5476aac79
Revises: 
Create Date: 2019-12-20 14:29:39.176940

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

from app.models import JobStatuses, VersionedResourceTypes

# revision identifiers, used by Alembic.
revision = '12b5476aac79'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'jobStatuses',
        sa.Column('statusId', sa.Integer(), nullable=False),
        sa.Column('label', sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint('statusId')
    )
    op.create_table(
        'versionedResourceTypes',
        sa.Column('resourceTypeId', sa.Integer(), nullable=False),
        sa.Column('label', sa.String(length=64), nullable=False),
        sa.PrimaryKeyConstraint('resourceTypeId')
    )
    op.create_index(op.f('ix_versionedResourceTypes_label'), 'versionedResourceTypes', ['label'], unique=True)
    op.create_table(
        'vulnerabilityConfigurationInputs',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('vulnConfigId', sa.Integer(), nullable=False),
        sa.Column(
            'configuration',
            sa.TEXT(),
            nullable=True,
            comment='text to contain actual configuration (NOTE: this may change to point to a file upload path if the text is too large)'
        ),
        sa.PrimaryKeyConstraint('vulnConfigId'),
        sa.UniqueConstraint('configuration')
    )
    op.create_table(
        'jobs',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('jobId', sa.Integer(), nullable=False),
        sa.Column('derivationFilePath', sa.String(length=256), nullable=True, comment='path to *.drv file generated via "nix instantiate" for a given job'),
        sa.Column('statusId', sa.Integer(), nullable=False),
        sa.Column('nixStorePath', sa.String(length=256), nullable=True, comment='output of nix-build should be a path to the results in nix'),
        sa.Column('logFilePath', sa.String(length=256), nullable=True, comment='output of command run'),
        sa.Column('type', sa.String(length=23), nullable=False, comment='internal polymorphic type-tracking'),
        sa.ForeignKeyConstraint(['statusId'], ['jobStatuses.statusId'], ),
        sa.PrimaryKeyConstraint('jobId'),
        sa.UniqueConstraint('logFilePath')
    )
    op.create_table(
        'versionedResources',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('resourceId', sa.Integer(), nullable=False),
        sa.Column('resourceTypeId', sa.Integer(), nullable=False),
        sa.Column('url', sa.String(length=256), nullable=False),
        sa.Column('version', sa.String(length=256), nullable=False),
        sa.ForeignKeyConstraint(['resourceTypeId'], ['versionedResourceTypes.resourceTypeId'], ),
        sa.PrimaryKeyConstraint('resourceId'),
        sa.UniqueConstraint('url', 'version', name='versioned_resources_uc')
    )
    op.create_index(op.f('ix_versionedResources_url'), 'versionedResources', ['url'], unique=True)
    op.create_index(op.f('ix_versionedResources_version'), 'versionedResources', ['version'], unique=False)
    op.create_table(
        'featureModelInputs',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('featModelId', sa.Integer(), nullable=False),
        sa.Column('hdlId', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['hdlId'], ['versionedResources.resourceId'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('featModelId')
    )
    op.create_table(
        'featureConfigurationInputs',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('featConfigId', sa.Integer(), nullable=False),
        sa.Column('configurationJson', sa.Text(), nullable=True, comment='JSON generated during feature configuration'),
        sa.Column('featModelId', sa.Integer(), nullable=False, comment='can have many configurations for a model'),
        sa.ForeignKeyConstraint(['featModelId'], ['featureModelInputs.featModelId'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('featConfigId'),
        sa.UniqueConstraint('featModelId', 'configurationJson', name='feat_config_inputs_uc')
    )
    op.create_table(
        'featureExtractionJobs',
        sa.Column('jobId', sa.Integer(), nullable=False),
        sa.Column('featModelId', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['featModelId'], ['featureModelInputs.featModelId'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['jobId'], ['jobs.jobId'], ),
        sa.PrimaryKeyConstraint('jobId')
    )
    op.create_table(
        'systemConfigurationInputs',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('sysConfigId', sa.Integer(), nullable=False),
        sa.Column('featConfigId', sa.Integer(), nullable=False, comment='if null, it implies they are using the configuration implicit in the HDL'),
        sa.Column('hdlId', sa.Integer(), nullable=True),
        sa.Column('osId', sa.Integer(), nullable=True),
        sa.Column('toolChainId', sa.Integer(), nullable=True),
        sa.Column(
            'nixConfig',
            sa.Text(),
            nullable=True,
            comment='This column is our temporary one for the initial UI sys-config screen where we will simply provide a way to upload a nix config'
        ),
        sa.ForeignKeyConstraint(['featConfigId'], ['featureConfigurationInputs.featConfigId'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['hdlId'], ['versionedResources.resourceId'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['osId'], ['versionedResources.resourceId'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['toolChainId'], ['versionedResources.resourceId'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('sysConfigId'),
        sa.UniqueConstraint('featConfigId', 'hdlId', 'osId', 'toolChainId', 'nixConfig', name='system_config_inputs_uc')
    )
    op.create_table(
        'testRunInputs',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('testRunId', sa.Integer(), nullable=False),
        sa.Column('sysConfigId', sa.Integer(), nullable=True),
        sa.Column('vulnConfigId', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['sysConfigId'], ['systemConfigurationInputs.sysConfigId'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['vulnConfigId'], ['vulnerabilityConfigurationInputs.vulnConfigId'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('testRunId'),
        sa.UniqueConstraint('sysConfigId', 'vulnConfigId', name='test_runs_uc')
    )
    op.create_table(
        'feature_models',
        sa.Column('uid', sa.Text(), unique=True),
        sa.Column('filename', sa.Text()),
        sa.Column('source', sa.Text()),
        sa.Column('conftree', sa.Text()),
        sa.Column('date', sa.DateTime(), nullable=False, default=datetime.utcnow),
        sa.Column('hash', sa.Text()),
        sa.Column('configs', sa.Text()),
        sa.Column('last_update', sa.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow),
    )
    # ### end Alembic commands ###

    # add our initial resource types and job statuses
    bind = op.get_bind()
    session = sa.orm.Session(bind=bind)

    resource_types = [
        VersionedResourceTypes(label=l) for l in VersionedResourceTypes.ALLOWED_TYPES
    ]
    session.add_all(resource_types)

    job_statuses = [
        JobStatuses(label=l) for l in JobStatuses.ALLOWED_STATUSES
    ]
    session.add_all(job_statuses)
    
    session.commit()


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('feature_models')
    op.drop_table('testRunInputs')
    op.drop_table('systemConfigurationInputs')
    op.drop_table('featureExtractionJobs')
    op.drop_table('featureConfigurationInputs')
    op.drop_table('featureModelInputs')
    op.drop_index(op.f('ix_versionedResources_version'), table_name='versionedResources')
    op.drop_index(op.f('ix_versionedResources_url'), table_name='versionedResources')
    op.drop_table('versionedResources')
    op.drop_table('jobs')
    op.drop_table('vulnerabilityConfigurationInputs')
    op.drop_index(op.f('ix_versionedResourceTypes_label'), table_name='versionedResourceTypes')
    op.drop_table('versionedResourceTypes')
    op.drop_table('jobStatuses')
    # ### end Alembic commands ###
