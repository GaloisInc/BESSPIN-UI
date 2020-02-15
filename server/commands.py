import os
import sys
import click
from flask import Blueprint
from app import create_app

test_cli_bp = Blueprint('test', __name__)

COV = None
if os.environ.get('FLASK_COVERAGE'):
    import coverage
    COV = coverage.coverage(branch=True, include='app/*')
    COV.start()


def setup_app():
    config_name = os.getenv('FLASK_CONFIG') or 'default'
    app = create_app(config_name)

    return app


@test_cli_bp.cli.command('unit')
@click.option('--coverage/--no-coverage', default=False,
              help='Run tests under code coverage.')
@click.option('--failfast/--no-failfast', default=False,
              help='Stop the test run on the first error or failure.')
@click.argument('test_names', nargs=-1)
def test(coverage, failfast, test_names):
    # setup_app()
    """Run the unit tests."""
    if coverage and not os.environ.get('FLASK_COVERAGE'):
        import subprocess
        os.environ['FLASK_COVERAGE'] = '1'
        sys.exit(subprocess.call(sys.argv))

    import unittest
    if test_names:
        tests = unittest.TestLoader().loadTestsFromNames(test_names)
    else:
        tests = unittest.TestLoader().discover('tests')
    unittest.TextTestRunner(verbosity=2, failfast=failfast).run(tests)
    if COV:
        COV.stop()
        COV.save()
        print('Coverage Summary:')
        COV.report()
        basedir = os.path.abspath(os.path.dirname(__file__))
        covdir = os.path.join(basedir, 'tmp/coverage')
        COV.html_report(directory=covdir)
        print('HTML version: file://%s/index.html' % covdir)
        COV.erase()


@test_cli_bp.cli.command('profile')
@click.option('--length', default=25,
              help='Number of functions to include in the profiler report.')
@click.option('--profile-dir', default=None,
              help='Directory where profiler data files are saved.')
def profile(length, profile_dir):
    """Start the application under the code profiler."""
    from werkzeug.contrib.profiler import ProfilerMiddleware
    app = setup_app()
    app.wsgi_app = ProfilerMiddleware(app.wsgi_app, restrictions=[length],
                                      profile_dir=profile_dir)
    app.run()
