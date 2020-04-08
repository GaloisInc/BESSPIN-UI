from helpers import (
    BesspinTestBaseClass,
    create_reportJob,
    create_cwe_score,
)

from app.models import (
    CweScore,
)


class ReportJobsModelTestCase(BesspinTestBaseClass):

    def test_basic_functionality(self):

        rj = create_reportJob(workflowId=1, label='test reportJob', statusId=1)

        create_cwe_score(
            reportJobId=rj.jobId,
            cwe=1234,
            score='FAIL',
            notes='2/2 error'
        )

        testCweScore = CweScore.query.filter_by(reportJobId=rj.jobId).first()

        self.assertIsNotNone(testCweScore)
        self.assertEqual(testCweScore.report, rj)
