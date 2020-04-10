from flask import Blueprint
from flask_restplus import Api

"""
    Setup Blueprints (https://flask.palletsprojects.com/en/1.1.x/blueprints/)
    for our api endpoints so we can have a file per REST model managed
"""
blueprint = Blueprint('api', __name__)
api = Api(blueprint, doc='/doc/')

from app.api import arch_extract  # noqa: E402, F401
from app.api import versioned_resource  # noqa: E402, F401
from app.api import feature_model_input  # noqa: E402, F401
from app.api import feature_extraction_job  # noqa: E402, F401
from app.api import feature_model  # noqa E402, F401
from app.api import report_job  # noqa E402, F401
from app.api import workflow  # noqa E402, F401
from app.api import system_configuration_inputs  # noqa E402, F401
from app.api import testgen_config_input  # noqa E402, F401
from app.api import vulnerability_configuration_inputs  # noqa E402, F401
