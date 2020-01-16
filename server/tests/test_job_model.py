import unittest

from app import create_app
from app.models import (
    db,
    Job,
    JobStatus,
)


class ReportJobsModelTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        JobStatus.load_allowed_statuses()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

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
