"""
BESSPIN UI web app server
"""

import os
import logging
import json
from flask import Flask
from flask import (
    request,
    abort,
    send_from_directory,
    render_template,
)
from flask.logging import default_handler
from database import (
    list_models_from_db,
    insert_feature_model_db,
    update_configs_db,
    retrieve_feature_models_db,
    retrieve_model_from_db_by_uid
)
from configurator_shim import (
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

default_handler.setLevel(logging.DEBUG)

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


@app.route('/overview/get_db_models/', methods=['GET'])
def get_db_models():
    """
    list db models
    """
    app.logger.debug('list_db_models')
    models = list_models_from_db()
    return json.dumps(models)


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


@app.route('/configurator/upload/<path:subpath>', methods=['POST'])
def upload_file(subpath):
    """
    upload a clafer or fm.json file
    """
    name, cfg_type = subpath.split('/')
    app.logger.debug('name is: '+ name)
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
    return json.dumps({
        'uid': uid,
        'tree': json_feat_model,
        'configured_feature_model': combine_featmodel_cfgs(json_feat_model, []),
    })


@app.route('/configurator/configure/', methods=['POST'])
def configure_features():
    """
    process feature configurations
    """
    app.logger.debug('configure')

    data = json.loads(request.data)
    filename = data['filename']
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

    response = {
        'server_source': file_content,
        'server_constraints': constraints,
        'validated_features': validated_features,
        'configured_feature_model': combine_featmodel_cfgs(conftree, configs)
    }
    return json.dumps(response)


@app.route('/configurator/list_db_models/', methods=['GET'])
def list_db_models():
    """
    list db models
    """
    app.logger.debug('list_db_models')
    models = list_models_from_db()
    return json.dumps(models)


@app.route('/configurator/load_from_db/', methods=['POST'])
def load_model_from_db():
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
    return json.dumps({
        'uid': model['uid'],
        'source': model['source'],
        'filename': model['filename'],
        'date': model['date'],
        'conftree': conftree,
        'configs': configs,
        'configs_pp': selected_features_to_constraints(configs),
        'configured_feature_model': combine_featmodel_cfgs(conftree, configs)
    })


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


port = os.getenv('PORT', 3784)
debug = os.getenv('DEBUG', True)
host = os.getenv('HOST', '0.0.0.0')

app.run(host, port, debug)

