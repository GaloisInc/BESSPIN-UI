import unittest
from sqlalchemy.exc import IntegrityError

from app import create_app
from app.models import (
    db,
    Workflow,
)


class WorkFlowModelTestCase(unittest.TestCase):

    def setUp(self):
        self.app = create_app('test')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_unique_constraint(self):

        db.session.add(
            Workflow(
                label='test workflow 1',
                sysConfigId=1,
                testRunId=1,
                reportJobId=1,
            )
        )
        db.session.add(
            Workflow(
                label='test workflow 2',
                sysConfigId=1,
                testRunId=1,
                reportJobId=1,
            )
        )

        with self.assertRaises(IntegrityError):
            db.session.commit()
