import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    # allow developers to specify a custom path to the directory for besspin data,
    # falling back to XDG_DATA_HOME (or a hard-coded version of what that normally would be)
    DB_PATH = os.path.abspath(
        os.path.join(
            os.environ.get(
                'DB_PATH',
                os.environ.get(
                    'XDG_DATA_HOME',
                    os.path.expanduser('~/.local/share')
                )
            ),
            'besspin'
        )
    )
    DATABASE = os.path.join(DB_PATH, 'configurator.db')
    SCHEMA_PATH = os.path.abspath(os.path.join(__file__, '..', '..', 'db', 'schema.sql'))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///' + DATABASE)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CODE_DIR = os.path.join(os.path.dirname(__file__), 'app')
    EXAMPLES_DIR = os.path.join(CODE_DIR, 'examples')
    PORT = os.getenv('PORT', 3784)
    DEBUG = os.getenv('DEBUG', True)
    HOST = os.getenv('HOST', '0.0.0.0')
