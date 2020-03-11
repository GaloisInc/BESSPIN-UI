from helpers import BesspinTestBaseClass

from flask import current_app


class BasicsTestCase(BesspinTestBaseClass):

    def test_app_exists(self):
        self.assertFalse(current_app is None)

    def test_app_is_testing(self):
        self.assertTrue(current_app.config['TESTING'])
