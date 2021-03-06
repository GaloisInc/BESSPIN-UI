""" initial db setup

Revision ID: 12b5476aac79
Revises:
Create Date: 2019-12-20 14:29:39.176940

"""

from alembic import op
import sqlalchemy as sa

from app.models import JobStatus

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
        'vulnerabilityConfigurationInputs',
        sa.Column('vulnConfigId', sa.Integer(), nullable=False),
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('workflowId', sa.Integer(), nullable=False),
        sa.Column('vulnClass', sa.String(32), nullable=False),
        sa.Column('featureModelUid', sa.String(64), nullable=False),
        sa.PrimaryKeyConstraint('vulnConfigId'),
        sa.ForeignKeyConstraint(['workflowId'], ['workflows.workflowId'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['featureModelUid'], ['feature_models.uid']),
    )
    op.create_table(
        'cweScores',
        sa.Column('scoreId', sa.Integer(), nullable=False),
        sa.Column('cwe', sa.Integer(), nullable=False, comment='CWE number'),
        sa.Column('score', sa.String(length=23), nullable=False, comment='string value of CWE test score'),
        sa.Column('notes', sa.String(length=256), nullable=True, comment='notes for test score'),
        sa.Column('reportJobId', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('scoreId'),
        sa.ForeignKeyConstraint(['reportJobId'], ['reportJobs.jobId'], ondelete='CASCADE')
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
        'reportJobs',
        sa.Column('jobId', sa.Integer(), nullable=False),
        sa.Column('workflowId', sa.Integer(), nullable=False),
        sa.Column('log', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['jobId'], ['jobs.jobId'], ),
        sa.ForeignKeyConstraint(['workflowId'], ['workflows.workflowId'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('jobId')
    )
    op.create_table(
        'workflows',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('workflowId', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('workflowId'),
    )
    op.create_table(
        'systemConfigurationInputs',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('workflowId', sa.Integer(), nullable=False),
        sa.Column(
            'nixConfigFilename',
            sa.String(length=256),
            nullable=True,
            comment='Along with "nixConfig", this is a temporary column until we get full support for versioned resources'),
        sa.Column(
            'nixConfig',
            sa.Text(),
            nullable=True,
            comment='This column is our temporary one for the initial UI sys-config screen where we will simply provide a way to upload a nix config'
        ),
        sa.Column('sysConfigId', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('sysConfigId'),
        sa.ForeignKeyConstraint(['workflowId'], ['workflows.workflowId'], ondelete='CASCADE'),
    )
    op.create_table(
        'testgenConfigInputs',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('workflowId', sa.Integer(), nullable=False),
        sa.Column(
            'configInput',
            sa.Text(),
            nullable=True,
            comment='This column is the config.init text'
        ),
        sa.Column('testgenConfigId', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('testgenConfigId'),
        sa.ForeignKeyConstraint(['workflowId'], ['workflows.workflowId'], ondelete='CASCADE'),
    )
    op.create_table(
        'feature_models',
        sa.Column('uid', sa.Text(), unique=True),
        sa.Column('filename', sa.Text(), nullable=True),
        sa.Column('source', sa.Text(), nullable=True),
        sa.Column('conftree', sa.Text(), nullable=True),
        sa.Column('hash', sa.Text(), nullable=True),
        sa.Column('configs', sa.Text(), nullable=True),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('updatedAt', sa.DateTime(), nullable=True)
    )
    op.create_table(
        'arch_extract',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('archExtractId', sa.Integer(), unique=True),
        sa.Column('archExtractInput', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('archExtractId')
    )
    op.create_table(
        'arch_extract_output',
        sa.Column('archExtractOutputId', sa.Integer(), unique=True),
        sa.Column('archExtractOutputFilename', sa.Text(), nullable=True),
        sa.Column('archExtractOutputContent', sa.Text(), nullable=True),
        sa.Column('archExtractId', sa.Integer()),
        sa.PrimaryKeyConstraint('archExtractOutputId'),
        sa.ForeignKeyConstraint(['archExtractId'], ['arch_extract.archExtractId'], ondelete='CASCADE'),
    )
    op.create_table(
        'feat_extract',
        sa.Column('label', sa.String(length=128), nullable=True, comment='user-defined label for usability'),
        sa.Column('createdAt', sa.DateTime(), nullable=False),
        sa.Column('updatedAt', sa.DateTime(), nullable=True),
        sa.Column('featExtractId', sa.Integer(), unique=True),
        sa.Column('featExtractInput', sa.Text(), nullable=True),
        sa.Column('featExtractOutputFilename', sa.Text(), nullable=True),
        sa.Column('featExtractOutputContent', sa.Text(), nullable=True),
        sa.Column('featExtractOutputContentClafer', sa.Text(), nullable=True),
        sa.Column('featExtractOutputFilenameSimplified', sa.Text(), nullable=True),
        sa.Column('featExtractOutputContentSimplified', sa.Text(), nullable=True),
        sa.Column('featExtractOutputContentClaferSimplified', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('featExtractId')
    )
    # ### end Alembic commands ###

    # add our initial resource types and job statuses
    bind = op.get_bind()
    session = sa.orm.Session(bind=bind)

    # Not needed yet...
    # VersionedResourceType.load_allowed_types(session)
    JobStatus.load_allowed_statuses(session)

    session.commit()


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('feature_models')
    op.drop_table('testRunInputs')
    op.drop_table('systemConfigurationInputs')
    op.drop_table('testgenConfigInputs')
    op.drop_table('workflows')
    op.drop_table('reportJobs')
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
