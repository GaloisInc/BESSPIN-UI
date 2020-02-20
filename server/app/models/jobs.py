from . import db
from .metadata_mixin import MetaDataColumnsMixin


class JobStatus(db.Model):
    __tablename__ = 'jobStatuses'

    statusId = db.Column(db.Integer, primary_key=True)
    label = db.Column(
        db.String(64),
        nullable=False,
    )

    def __repr__(self):
        return '<JobStatus id="{}" label="{}">'.format(self.statusId, self.label)

    INITIAL_STATUS = 'running'
    ALLOWED_STATUSES = [INITIAL_STATUS, 'failed', 'succeeded']

    @staticmethod
    def load_allowed_statuses(db_conn=db.session):
        for t in JobStatus.ALLOWED_STATUSES:
            job_status = JobStatus.query.filter_by(label=t).first()
            if job_status is None:
                job_status = JobStatus(label=t)
            db_conn.add(job_status)
        db_conn.commit()


class Job(db.Model, MetaDataColumnsMixin):
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
    status = db.relationship('JobStatus')

    __mapper_args__ = {
        'polymorphic_identity': 'job',
        'polymorphic_on': type,
    }

    def __repr__(self):
        return f'<Job id="{self.jobId}" label="{self.label}" status="{self.status.label}">'


class FeatureExtractionJob(Job):
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


class ReportJob(Job):
    __tablename__ = 'reportJobs'

    jobId = db.Column(db.Integer, db.ForeignKey('jobs.jobId'), primary_key=True)  # noqa E501
    workflowId = db.Column(
        db.Integer,
        db.ForeignKey('workflows.workflowId', ondelete='CASCADE'),
        nullable=False
    )

    __mapper_args__ = {
        'polymorphic_identity': 'report',
    }
