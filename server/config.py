import os
import tempfile

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    # allow developers to specify a custom path to the directory for besspin data,
    # falling back to XDG_DATA_HOME (or a hard-coded version of what that normally would be)
    DB_PATH = os.path.abspath(
        os.environ.get(
            'DB_PATH',
            os.path.join(
                os.environ.get(
                    'XDG_DATA_HOME',
                    os.path.expanduser('~/.local/share')
                ),
                'besspin',
            )
        ),
    )
    DATABASE = os.path.join(DB_PATH, 'besspin.db')
    # SCHEMA_PATH = os.path.abspath(os.path.join(__file__, '..', '..', 'db', 'schema.sql'))
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///' + DATABASE)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CODE_DIR = os.path.join(os.path.dirname(__file__), 'app', 'ui')
    EXAMPLES_DIR = os.path.join(CODE_DIR, 'examples')
    PORT = os.getenv('PORT', 3784)
    DEBUG = False
    TESTING = False
    HOST = os.getenv('HOST', '0.0.0.0')
    VALID_VULN_CLASSES = {
        'BufferErrors': 'BufferErrors.cfr',
        'PPAC': 'PPAC.cfr',
        'NumericErrors': 'NumericErrors.cfr',
        'InformationLeakage': 'InformationLeakage.cfr',
        'ResourceManagement': 'ResourceManagement.cfr',
    }
    TESTGEN_PATH = os.path.abspath(os.path.expanduser('~/testgen'))
    TESTGEN_VULN_DIR_MAP = {
        'BufferErrors': '1_BufferErrors',
        'PPAC': '2_PPAC',
        'ResourceManagement': '3_ResourceManagement',
        'InformationLeakage': '5_InformationLeakage',
        'NumericErrors': '7_NumericErrors'
    }
    USE_TOOLSUITE = True if os.getenv('USE_TOOLSUITE', 'False') == 'True' else False
    USE_TOOLSUITE_CONFIGURATOR = True if os.getenv('USE_TOOLSUITE_CONFIGURATOR', 'False') == 'True' else False


class ProductionConfig(Config):
    DEBUG = False


class DevelopmentConfig(Config):
    DEBUG = True


class TestConfig(Config):
    db_fd, DATABASE = tempfile.mkstemp()
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///' + DATABASE)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = True


config = {
    'development': DevelopmentConfig,
    'test': TestConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
