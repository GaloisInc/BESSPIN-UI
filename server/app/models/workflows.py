from . import db
from .metadata_mixin import MetaDataColumnsMixin


class Workflow(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'workflows'

    workflowId = db.Column(db.Integer, primary_key=True)
    sysConfigId = db.Column(db.Integer, db.ForeignKey('systemConfigurationInputs.sysConfigId'))
    testRunId = db.Column(db.Integer, db.ForeignKey('testRunInputs.testRunId'))
    reportJobId = db.Column(db.Integer, db.ForeignKey('reportJobs.jobId'))

    def __repr__(self):
        return f'<Workflow id="{self.workflowId}" label="{self.label}" sysConfig="{self.sysConfigId}" testConfig="{self.testConfigId}" reportJob="{self.reportJobId}">'  # noqa E501

    __table_args__ = (
        db.UniqueConstraint(
            'sysConfigId',
            'testRunId',
            'reportJobId',
            name='workflow_uc',
        ),
    )
