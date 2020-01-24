import unittest
from sqlalchemy.exc import IntegrityError

from app import create_app
from app.models import (
    db,
    SystemConfigurationInput,
)


class SystemConfigurationInputModelTestCase(unittest.TestCase):

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
            SystemConfigurationInput(
                label='test sysconfig 1',
                nixConfigFilename='foo.nix',
                nixConfig='{ some: config }',
                workflowId=1
            )
        )
        db.session.add(
            SystemConfigurationInput(
                label='test sysconfig 2',
                nixConfigFilename='bar.nix',
                nixConfig='{ some: config }',
                workflowId=1
            )
        )

        with self.assertRaises(IntegrityError):
            db.session.commit()
