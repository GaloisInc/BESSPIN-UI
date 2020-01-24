from . import db
from .metadata_mixin import MetaDataColumnsMixin


class TestRunInput(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'testRunInputs'

    testRunId = db.Column(db.Integer, primary_key=True)
    sysConfigId = db.Column(
        db.Integer,
        db.ForeignKey('systemConfigurationInputs.sysConfigId', ondelete='SET NULL'),  # noqa E501
    )
    vulnConfigId = db.Column(
        db.Integer,
        db.ForeignKey('vulnerabilityConfigurationInputs.vulnConfigId', ondelete='SET NULL'),  # noqa E501
    )

    __table_args__ = (
        db.UniqueConstraint(
            'sysConfigId',
            'vulnConfigId',
            name='test_runs_uc',
        ),
    )

    def __repr__(self):
        return f'<TestRunInput id="{self.testRunId}" label="{self.label}">'
