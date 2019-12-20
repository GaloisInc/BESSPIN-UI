from flask import Blueprint
from flask_restplus import Api

blueprint = Blueprint('api', __name__)
api = Api(blueprint, doc='/doc/')


from app.api import legacy  # noqa E402, F401
