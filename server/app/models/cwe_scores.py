from . import db


class CweScore(db.Model):
    __tablename__ = 'cweScores'

    scoreId = db.Column(db.Integer, primary_key=True)
    cwe = db.Column(
        db.Integer(),
        nullable=False,
        comment='CWE number',
    )
    score = db.Column(
        db.String(length=23),
        nullable=False,
        comment='string value of CWE test score'
    )
    notes = db.Column(
        db.String(length=256),
        nullable=True,
        comment='notes for test score'
    )
    reportJobId = db.Column(
        db.Integer(),
        db.ForeignKey('reportJobs.jobId', ondelete='CASCADE'),  # noqa E501
        nullable=False,
    )

    report = db.relationship('ReportJob', back_populates='scores')

    def __repr__(self):
        return f'<CweScore scoreId="{self.scoreId}" reportJobId="{self.reportJobId}" cwe="{self.cwe}" score="{self.score}" notes="{self.notes}">'  # noqa E501
