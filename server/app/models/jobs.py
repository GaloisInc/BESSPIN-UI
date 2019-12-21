from . import db
from .metadata_mixin import MetaDataColumnsMixin


class JobStatuses(db.Model):
    __tablename__ = 'jobStatuses'

    statusId = db.Column(db.Integer, primary_key=True)
    label = db.Column(
        db.String(64),
        nullable=False,
    )

    def __repr__(self):
        return '<JobStatuses "{}" {}>'.format(self.statusId, self.label)

    ALLOWED_STATUSES = ['running', 'failed', 'succeeded']


class Jobs(db.Model, MetaDataColumnsMixin):
    __tablename__ = 'jobs'

    jobId = db.Column(db.Integer, primary_key=True)
    derivationFilePath = db.Column(
        db.String(256),
        comment='path to *.drv file generated via "nix instantiate" for a given job',  # noqa E501
    )
    statusId = db.Column(
        db.Integer,
        db.ForeignKey('jobStatuses.statusId'),
        nullable=False,
    )
    nixStorePath = db.Column(
        db.String(256),
        comment='output of nix-build should be a path to the results in nix',
    )
    logFilePath = db.Column(
        db.String(256),
        unique=True,
        comment='output of command run',
    )
    type = db.Column(
        db.String(23),
        nullable=False,
        comment='internal polymorphic type-tracking',
    )

    __mapper_args__ = {
        'polymorphic_identity': 'job',
        'polymorphic_on': type,
    }

    def __repr__(self):
        return f'<Jobs id="{self.jobId}" label="{self.label}">'


class FeatureExtractionJobs(Jobs):
    __tablename__ = 'featureExtractionJobs'

    jobId = db.Column(db.Integer, db.ForeignKey('jobs.jobId'), primary_key=True)  # noqa E501
    featModelId = db.Column(
        db.Integer,
        db.ForeignKey('featureModelInputs.featModelId', ondelete='CASCADE'),  # noqa E501
        nullable=False
    )

    __mapper_args__ = {
        'polymorphic_identity': 'feature-extraction',
    }
