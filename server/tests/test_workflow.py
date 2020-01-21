import unittest

from app import create_app
from app.models import (
    db,
    SystemConfigurationInput,
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

    def test_sysconfig_input(self):

        db.session.add(
            Workflow(
                label='test workflow',
            )
        )
        db.session.commit()
        test_workflow = Workflow.query.first()
        self.assertIsNotNone(test_workflow.workflowId)
        db.session.add(
            SystemConfigurationInput(
                label='test sysconfig',
                nixConfigFilename='test.nix',
                nixConfig='{ nix: config }',
                workflowId=test_workflow.workflowId
            )
        )
        db.session.commit()
        test_workflow = Workflow.query.first()
        self.assertEqual(test_workflow.sysconfig.label, 'test sysconfig')
