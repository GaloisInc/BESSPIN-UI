from flask import current_app
from flask_restplus import Resource, fields
from flask import (
    abort,
    json,
    request,
)
from uuid import uuid4
from hashlib import sha3_256

from . import api
from app.lib.configurator_shim import (
    convert_model_to_json,
    fmjson_to_clafer,
    selected_features_to_constraints,
    combine_featmodel_cfgs,
    validate_all_features,
    configuration_algo,
)
from app.models import (
    db,
    FeatureModel,
)


# API Models

overviewModel = api.model('Overview', {
    'uid': fields.String,
    'filename': fields.String,
    'createdAt': fields.String,
    'updatedAt': fields.String,
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
    # NOTE: would be better to use "Nested(featureModelFeatureMap)" but a
    #       feature model map is an open-ended project of arbitrary keys,
    #       so we cannot spec that ahead of time
    'features': fields.Raw,
    'roots': fields.List(fields.String),
    'version': fields.Nested(featureModelVersion)
})

configuratorModel = api.model('Configurator', {
    'uid': fields.String,
    'source': fields.String,
    'filename': fields.String,
    'createdAt': fields.String,
    'conftree': fields.Nested(featureModel),
    'configs': fields.List(fields.Nested(configModel)),
    'configs_pp': fields.String,
    'configured_feature_model': fields.Raw
})

configuratorModelFetch = api.model('ConfiguratorFetch', {
    'model_uid': fields.String(
        required=True,
        description='UID for the configurator you are requesting'
    )
})


def record_to_info(record):
    """
    Transform a record into a dict with useful information
    """
    current_app.logger.debug(record)
    return {
        'filename': record.filename,
        'createdAt': record.createdAt.strftime('%Y-%m-%d %H:%M:%S'),
        'uid': record.uid,
        'updatedAt': record.updatedAt.strftime('%Y-%m-%d %H:%M:%S') if record.updatedAt else '',
        'nb_features_selected': len(decode_json_db(record.configs)),
    }


def encode_json_db(content) -> str:
    return json.dumps(content)


def decode_json_db(content) -> dict:
    return json.loads(content)


# API Routes

@api.route('/overview/get_db_models/')
class OverviewModels(Resource):
    @api.marshal_with(overviewModel)
    def get(self):
        current_app.logger.debug(f'fetching all feature models')
        return FeatureModel.query.all()


@api.route('/configurator/upload/<path:subpath>')
class ConfiguratorUpload(Resource):
    @api.doc('upload a clafer or fm.json file to create a feature model')
    def post(self, subpath):
        name, cfg_type = subpath.split('/')

        current_app.logger.debug('name is: ' + name + ', cfg_type is: ' + cfg_type)

        if name.endswith('.cfr'):
            try:
                json_feat_model = convert_model_to_json(request.data)
                cfr_feature_model_source = request.data.decode('utf8')
            except RuntimeError as err:
                current_app.logger.error(str(err))
                return abort(500, str(err))
        elif name.endswith('.fm.json'):
            try:
                json_feat_model = json.loads(request.data)
                cfr_feature_model_source = (
                    fmjson_to_clafer(request.data)
                )
            except RuntimeError as err:
                current_app.logger.error(str(err))
                return abort(500, str(err))
        else:
            return abort(400, 'Unsupported file extension for filename: ' + name)

        uid = str(uuid4())
        the_hash = str(sha3_256(bytes(cfr_feature_model_source, 'utf8')))

        current_app.logger.debug(f'going to store {name} with uid({uid}) and hash({the_hash})')

        try:
            new_feature_model = FeatureModel(
                uid=uid,
                label=name,
                filename=name,
                hash=the_hash,
                conftree=encode_json_db(json_feat_model),
                configs=encode_json_db([]),
            )
            db.session.add(new_feature_model)
            db.session.commit()

            current_app.logger.debug(f'created feature model ({new_feature_model})')

            return {
                'uid': new_feature_model.uid,
                'tree': json_feat_model,
                'configured_feature_model': combine_featmodel_cfgs(json_feat_model, []),
                'source': cfr_feature_model_source,
            }
        except Exception as err:
            current_app.logger.error(err)
            return abort(500, str(err))


@api.route('/configurator/configure/')
class ConfiguratorConfigure(Resource):
    def post(self):
        """
        process feature configurations
        """
        current_app.logger.debug('configure')

        data = json.loads(request.data)
        uid = data['uid']
        feature_selection = data['feature_selection']

        entry = FeatureModel.query.filter_by(uid=uid).first()

        file_content = entry.source
        conftree = decode_json_db(entry.conftree)
        old_feature_selection = decode_json_db(entry.configs)

        try:
            is_selection_valid = configuration_algo(
                entry.source,
                feature_selection,
            )
        except RuntimeError as err:
            current_app.logger.info(str(err))
            return abort(500, str(err))

        validated_features = (
            validate_all_features(feature_selection)
            if is_selection_valid
            else old_feature_selection
        )
        enc_cfgs = encode_json_db(validated_features)

        try:
            entry.configs = enc_cfgs
            current_app.logger.debug(f'updating feature_model({entry})')
            db.session.commit()

            constraints = selected_features_to_constraints(validated_features)

            # pylint: disable=line-too-long
            # cp = subprocess.run(['claferIG', filename_cfr, '--useuids', '--addtypes', '--ss=simple', '--maxint=31', '--json'])
            # app.logger.debug('ClaferIG output: ' + (str(cp.stdout)))
            # d = load_json(filename_json)

            return {
                'server_source': file_content,
                'server_constraints': constraints,
                'validated_features': validated_features,
                'configured_feature_model': combine_featmodel_cfgs(conftree, validated_features)
            }
        except Exception as err:
            current_app.logger.error(err)
            return abort(500, str(err))


@api.route('/configurator/list_db_models/')
class ConfiguratorList(Resource):
    def get(self):
        """
        list db models
        """
        current_app.logger.debug('list_db_models')

        entries = FeatureModel.query.all()
        list_models = [record_to_info(record) for record in entries]
        list_models.reverse()

        return list_models


@api.route('/configurator/load_from_db/')
class ConfiguratorModel(Resource):
    @api.marshal_with(configuratorModel)
    @api.expect(configuratorModelFetch)
    def post(self):
        current_app.logger.debug('load from db')

        data = json.loads(request.data)
        uid = data['model_uid']

        current_app.logger.debug(f'going to fetch feature_model({uid})')

        model = FeatureModel.query.filter_by(uid=uid).first()

        current_app.logger.debug(f'fetched feature_model({model})')

        configs = decode_json_db(model.configs)
        conftree = decode_json_db(model.conftree)

        return {
            'uid': model.uid,
            'source': model.source,
            'filename': model.filename,
            'createdAt': model.createdAt,
            'conftree': conftree,
            'configs': configs,
            'configs_pp': selected_features_to_constraints(configs),
            'configured_feature_model': combine_featmodel_cfgs(conftree, configs)
        }
