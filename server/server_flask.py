"""
BESSPIN UI web app server
"""

import os
import logging
import json
from flask import Flask, Blueprint
from flask import (
    request,
    abort,
    send_from_directory,
    render_template,
)
from flask.logging import default_handler
from flask_restplus import Api, Resource, fields
from lib.database import (
    list_models_from_db,
    insert_feature_model_db,
    update_configs_db,
    retrieve_feature_models_db,
    retrieve_model_from_db_by_uid
)
from lib.configurator_shim import (
    convert_model_to_json,
    selected_features_to_constraints,
    combine_featmodel_cfgs,
    configuration_algo,
)
# pylint: disable=invalid-name
# pylint: disable=no-member

CODE_DIR = os.path.dirname(__file__)
EXAMPLES_DIR = os.path.join(CODE_DIR, 'examples')

app = Flask(__name__)
blueprint = Blueprint('api', __name__, url_prefix='/api')
api = Api(blueprint, doc='/doc/')

app.register_blueprint(blueprint)

default_handler.setLevel(logging.DEBUG)

# Legacy UI Routes

@app.route('/css/main')
def css_main():
    """
    Endpoint serving the main css
    """
    return render_template('main.css')


@app.route('/script/overview')
def script_overview():
    """
    Endpoint serving the overview script
    """
    return send_from_directory(
        os.path.join(CODE_DIR, 'js'),
        'overview.js',
        mimetype='application/javascript'
    )


@app.route('/script/configurator')
def script_configurator():
    """
    Endpoint serving the configurator script
    """
    return send_from_directory(
        os.path.join(CODE_DIR, 'js'),
        'configurator.js',
        mimetype='application/javascript'
    )


@app.route('/script/pipeline')
def script_pipeline():
    """
    Endpoint serving the configurator script
    """
    return send_from_directory(
        os.path.join(CODE_DIR, 'js'),
        'pipeline.js',
        mimetype='application/javascript'
    )


@app.route('/')
def root_page():
    """
    Endpoint for root app.
    Currently set to the overview.
    """
    return render_template('overview.html')


@app.route('/sidebar/')
def sidebar():
    """
    endpoint for delivering the sidebar
    """
    return render_template('sidebar.html')


@app.route('/overview/')
def overview():
    """
    endpoint for the overview
    """
    return render_template('overview.html')


@app.route('/configurator/')
@app.route('/configurator/<path:subpath>')
def feature_configurator(subpath=None):
    """
    endpoint for the configurator app
    """
    if subpath is None:
        cfg_type, uid = 'cpu', None
    else:
        args = subpath.split('/')
        if len(args) == 1:
            cfg_type, uid = args[0], None
            uid = None
        else:
            cfg_type, uid = args[0], args[1]

    # The global variables are defined in the javascript code
    cfg_type = 'global_var_cpu' if cfg_type == 'cpu' else 'global_var_test'
    return render_template('configurator.html', uid=uid, cfg_type=cfg_type)


@app.route('/pipeline/')
@app.route('/pipeline/<string:uid>')
def pipeline(uid=None):
    """
    endpoint for the pipeline
    """
    return render_template('pipeline.html', uid=uid)


@app.route('/dashboard/')
@app.route('/dashboard/<string:uid>')
def dashboard(uid=None):
    """
    endpoint for the configurator app
    """
    return render_template('dashboard.html', uid=uid)


# API Models

overviewModel = api.model('Overview', {
    'uid': fields.String,
    'filename': fields.String,
    'date': fields.String,
    'last_update': fields.String,
    'nb_features_selected': fields.Integer
})

configContentModel = api.model('Config Content', {
    'mode': fields.String,
    'other': fields.String,
    'validated': fields.Boolean
})

configModel = api.model('Config', {
    'uid': fields.String,
    'content': fields.Nested(configContentModel)
})

featureModelVersion = api.model('Feature Model Version', {
    'version': fields.Integer,
})

featureModelConstraint = api.model('Feature Model Constraint', {
    'kind': fields.String,
    'name': fields.String
})

featureModelFeature = api.model('Feature Model Feature', {
    'gcard': fields.String,
    'card': fields.String,
    'name': fields.String,
    'children': fields.List(fields.String),
    'parent': fields.String
})

featureModelFeatureMap = api.model('Feature Model Feature Map', {
    fields.String: fields.Nested(featureModelFeature),
})

featureModel = api.model('Feature', {
    'constraints': fields.List(fields.Nested(featureModelConstraint)),
    'features': fields.Raw, # NOTE: would be better to use "Nested(featureModelFeatureMap)" but a feature model map is an open-ended project of arbitrary keys, so we cannot spec that ahead of time
    'roots': fields.List(fields.String),
    'version': fields.Nested(featureModelVersion)
})

configuratorModel = api.model('Configurator', {
    'uid': fields.String,
    'source': fields.String,
    'filename': fields.String,
    'date': fields.String,
    'conftree': fields.Nested(featureModel),
    'configs': fields.List(fields.Nested(configModel)),
    'configs_pp': fields.String,
    'configured_feature_model': fields.Raw
})


# API Routes

@api.route('/overview/get_db_models/')
class OverviewModels(Resource):
    @api.marshal_with(overviewModel)
    def get(self):
        """
        list db models
        """
        app.logger.debug('list_db_models')
        models = list_models_from_db()
        return models

@api.route('/configurator/upload/<path:subpath>')
class ConfiguratorUpload(Resource):
    def post(self, subpath):
        """
        upload a clafer or fm.json file
        """
        name, cfg_type = subpath.split('/')
        app.logger.debug('name is: '+ name +', cfg_type is: '+ cfg_type)
        if name.endswith('.cfr'):
            try:
                json_feat_model = convert_model_to_json(request.data)
            except RuntimeError as err:
                app.logger.info(str(err))
                return abort(500, str(err))
        elif name.endswith('.fm.json'):
            json_feat_model = json.loads(request.data)
        else:
            return abort(400, 'Unsupported file extension for filename: ' + name)
        uid = insert_feature_model_db(name, request.data.decode('utf8'), json_feat_model)
        return {
            'uid': uid,
            'tree': json_feat_model,
            'configured_feature_model': combine_featmodel_cfgs(json_feat_model, []),
        }


@api.route('/configurator/configure/')
class ConfiguratorConfigure(Resource):
    def post(self):
        """
        process feature configurations
        """
        app.logger.debug('configure')

        data = json.loads(request.data)
        # filename = data['filename']
        uid = data['uid']
        feature_selection = data['feature_selection']
        entry = retrieve_model_from_db_by_uid(uid)
        file_content = entry['source']
        conftree = entry['conftree']
        configs = feature_selection
        validated_features = configuration_algo(
            entry['conftree'],
            feature_selection,
        )
        update_configs_db(uid, validated_features)
        constraints = selected_features_to_constraints(feature_selection)

        # pylint: disable=line-too-long
        # cp = subprocess.run(['claferIG', filename_cfr, '--useuids', '--addtypes', '--ss=simple', '--maxint=31', '--json'])
        # app.logger.debug('\n sdfdsf\n')
        # app.logger.debug('ClaferIG output: ' + (str(cp.stdout)))
        # d = load_json(filename_json)

        return {
            'server_source': file_content,
            'server_constraints': constraints,
            'validated_features': validated_features,
            'configured_feature_model': combine_featmodel_cfgs(conftree, configs)
        }

@api.route('/configurator/list_db_models/')
class ConfiguratorList(Resource):
    def get(self):
        """
        list db models
        """
        app.logger.debug('list_db_models')
        models = list_models_from_db()
        return models


@api.route('/configurator/load_from_db/')
class ConfiguratorModel(Resource):
    @api.marshal_with(configuratorModel)
    def post(self):
        """
        Load model from db
        """
        app.logger.debug('load from db')

        data = json.loads(request.data)
        uid = data['model_uid']
        app.logger.debug('load from db with uid: ' + uid)
        model = retrieve_model_from_db_by_uid(uid)
        configs = model['configs']
        conftree = model['conftree']
        return {
            'uid': model['uid'],
            'source': model['source'],
            'filename': model['filename'],
            'date': model['date'],
            'conftree': conftree,
            'configs': configs,
            'configs_pp': selected_features_to_constraints(configs),
            'configured_feature_model': combine_featmodel_cfgs(conftree, configs)
        }


port = os.getenv('PORT', 3784)
debug = os.getenv('DEBUG', True)
host = os.getenv('HOST', '0.0.0.0')

app.run(host, port, debug)
