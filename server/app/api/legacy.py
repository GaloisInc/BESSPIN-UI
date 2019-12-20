from flask import current_app
from flask_restplus import Resource, fields
from flask import (
    abort,
    current_app,
    json,
    request,
)

from . import api
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


# API Models

overviewModel = api.model('Overview', {
    'uid': fields.String,
    'filename': fields.String,
    'date': fields.String,
    'last_update': fields.String,
    'nb_features_selected': fields.Integer
})

configModel = api.model('Config', {
    'uid': fields.String,
    'mode': fields.String,
    'other': fields.String,
    'validated': fields.Boolean
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
        current_app.logger.debug('list_db_models')
        models = list_models_from_db()
        return models

@api.route('/configurator/upload/<path:subpath>')
class ConfiguratorUpload(Resource):
    def post(self, subpath):
        """
        upload a clafer or fm.json file
        """
        name, cfg_type = subpath.split('/')
        current_app.logger.debug('name is: '+ name +', cfg_type is: '+ cfg_type)
        if name.endswith('.cfr'):
            try:
                json_feat_model = convert_model_to_json(request.data)
            except RuntimeError as err:
                current_app.logger.info(str(err))
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
        current_app.logger.debug('configure')

        data = json.loads(request.data)
        # filename = data['filename']
        uid = data['uid']
        feature_selection = data['feature_selection']
        entry = retrieve_model_from_db_by_uid(uid)
        file_content = entry.get('source', '')
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
        current_app.logger.debug('list_db_models')
        models = list_models_from_db()
        return models


@api.route('/configurator/load_from_db/')
class ConfiguratorModel(Resource):
    @api.marshal_with(configuratorModel)
    def post(self):
        """
        Load model from db
        """
        current_app.logger.debug('load from db')

        data = json.loads(request.data)
        uid = data['model_uid']
        current_app.logger.debug('load from db with uid: ' + uid)
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
