from . import db
from .metadata_mixin import MetaDataColumnsMixin


class TestgenConfigInput(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'testgenConfigInputs'

    testgenConfigId = db.Column(db.Integer, primary_key=True)
    configInput = db.Column(
        db.Text,
        comment='This column is for the config.ini file',  # noqa E501
    )
    workflowId = db.Column(
        db.Integer,
        db.ForeignKey('workflows.workflowId', ondelete='CASCADE'),  # noqa E501
        nullable=False,
        comment='a testgen configuration input should always be associated with a workflow'
    )

    def __repr__(self):
        return f'<TestgenConfigInput id="{self.testgenConfigId}" workflow="{self.workflowId}">'  # noqa E501
