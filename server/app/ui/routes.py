from config import Config

import os
import json
from flask import (
    request,
    abort,
    send_from_directory,
    render_template,
    Blueprint,
)
from app.lib.database import (
    list_models_from_db,
    insert_feature_model_db,
    update_configs_db,
    retrieve_feature_models_db,
    retrieve_model_from_db_by_uid
)
from app.lib.configurator_shim import (
    convert_model_to_json,
    selected_features_to_constraints,
    combine_featmodel_cfgs,
    configuration_algo,
)
# Legacy UI Routes

ui_routes = Blueprint('ui', __name__, template_folder='templates')

@ui_routes.route('/css/main')
def css_main():
    """
    Endpoint serving the main css
    """
    return render_template('main.css')


@ui_routes.route('/script/overview')
def script_overview():
    """
    Endpoint serving the overview script
    """
    return send_from_directory(
        os.path.join(Config.CODE_DIR, 'js'),
        'overview.js',
        mimetype='application/javascript'
    )


@ui_routes.route('/script/configurator')
def script_configurator():
    """
    Endpoint serving the configurator script
    """
    return send_from_directory(
        os.path.join(Config.CODE_DIR, 'js'),
        'configurator.js',
        mimetype='application/javascript'
    )


@ui_routes.route('/script/pipeline')
def script_pipeline():
    """
    Endpoint serving the configurator script
    """
    return send_from_directory(
        os.path.join(Config.CODE_DIR, 'js'),
        'pipeline.js',
        mimetype='application/javascript'
    )


@ui_routes.route('/')
def root_page():
    """
    Endpoint for root app.
    Currently set to the overview.
    """
    return render_template('overview.html')


@ui_routes.route('/sidebar/')
def sidebar():
    """
    endpoint for delivering the sidebar
    """
    return render_template('sidebar.html')


@ui_routes.route('/overview/')
def overview():
    """
    endpoint for the overview
    """
    return render_template('overview.html')


@ui_routes.route('/configurator/')
@ui_routes.route('/configurator/<path:subpath>')
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


@ui_routes.route('/pipeline/')
@ui_routes.route('/pipeline/<string:uid>')
def pipeline(uid=None):
    """
    endpoint for the pipeline
    """
    return render_template('pipeline.html', uid=uid)


@ui_routes.route('/dashboard/')
@ui_routes.route('/dashboard/<string:uid>')
def dashboard(uid=None):
    """
    endpoint for the configurator app
    """
    return render_template('dashboard.html', uid=uid)
