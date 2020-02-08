from helpers import BesspinTestBaseClass

from app.models import (
    db,
    Job,
    JobStatus,
)


class ReportJobsModelTestCase(BesspinTestBaseClass):

    def setUp(self):
        super(ReportJobsModelTestCase, self).setUp()
        JobStatus.load_allowed_statuses()

    def test_basic_functionality(self):

        jobStatusId = JobStatus.query.filter_by(label='running').first().statusId

        self.assertIsNotNone(jobStatusId)

        testLabel = 'test job 1'

        db.session.add(
            Job(
                label=testLabel,
                statusId=jobStatusId
            )
        )

        db.session.commit()

        testJob = Job.query.filter_by(label=testLabel).first()

        self.assertIsNotNone(testJob)
        self.assertEqual(testJob.status.label, 'running')
        self.assertEqual(testJob.type, 'job')
