from helpers import BesspinTestBaseClass
from sqlalchemy.exc import IntegrityError

from app.models import (
    db,
    SystemConfigurationInput,
    Workflow,
)


class SystemConfigurationInputModelTestCase(BesspinTestBaseClass):

    def test_unique_constraint(self):
        wf = Workflow(label='wf')
        db.session.add(wf)
        db.session.commit()

        db.session.add(
            SystemConfigurationInput(
                label='test sysconfig 1',
                nixConfigFilename='foo.nix',
                nixConfig='{ some: config }',
                workflowId=wf.workflowId
            )
        )
        db.session.add(
            SystemConfigurationInput(
                label='test sysconfig 2',
                nixConfigFilename='bar.nix',
                nixConfig='{ some: config }',
                workflowId=wf.workflowId
            )
        )

        with self.assertRaises(IntegrityError):
            db.session.commit()

    def test_workflow_relationship(self):
        wf = Workflow(label='wf')
        db.session.add(wf)
        db.session.commit()

        test_label = 'test sysconfig'
        db.session.add(
            SystemConfigurationInput(
                label=test_label,
                nixConfigFilename='foo.nix',
                nixConfig='{ some: config }',
                workflowId=wf.workflowId
            )
        )

        db.session.commit()

        sc = SystemConfigurationInput.query.filter_by(label=test_label).first()

        self.assertIsNotNone(sc)
        self.assertIsNotNone(sc.workflow)
        self.assertEqual(sc.workflow.label, 'wf')
