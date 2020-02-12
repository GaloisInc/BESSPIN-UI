import os
from flask_restplus import Resource, fields
from flask import (
    abort,
    current_app,
    json,
    jsonify,
    request,
)
from werkzeug.http import HTTP_STATUS_CODES
from uuid import uuid4
from hashlib import sha3_256

from config import config
from . import api
from app.lib.configurator_shim import (
    convert_model_to_json,
    fmjson_to_clafer,
    validate_all_features,
    configuration_algo,
)
from app.models import (
    db,
    FeatureModel,
)


"""
    Since all the routes here are for managing our Feature Models
    we set up a root namespace that is the prefix for all routes
    defined below
"""
ns = api.namespace(
    'feature-model',
    description='Operations on feature models'
)

# API Models

uid_desc = 'UID for the feature-model record'
filename_desc = 'name of source-file used to generate feature-model'
created_at_desc = 'datetime feature-model record was created'
updated_at_desc = 'datetime feature-model record was last updated'
nb_features_selected_desc = 'number of selected features'
source_desc = 'original source used to create the "conftree"'
configured_feat_model_desc = 'TODO: describe what this field is'
constraints_desc = 'TODO: describe what this field is'

overviewModel = api.model('Overview', {
    'uid': fields.String(description=uid_desc),
    'filename': fields.String(description=filename_desc),
    'createdAt': fields.String(description=created_at_desc),
    'updatedAt': fields.String(description=updated_at_desc),
    'nb_features_selected': fields.Integer(description=nb_features_selected_desc)
})

configModel = api.model('Config', {
    'uid': fields.String(description=uid_desc),
    'mode': fields.String,  # TODO: describe what this field is for
    'other': fields.String,  # TODO: describe what this field is for
    'validated': fields.Boolean  # TODO: describe what this field is for
})

featureModelVersion = api.model('Feature Model Version', {
    'base': fields.Integer(description='base version number for fmjson format used'),
})

featureModelConstraint = api.model('Feature Model Constraint', {
    'kind': fields.String,  # TODO: describe what this field is for
    'name': fields.String  # TODO: describe what this fiels is for
})

featureModel = api.model('Feature', {
    'constraints': fields.List(fields.Nested(featureModelConstraint)),  # TODO: describe what this field is for
    # NOTE: a feature model map is an open-ended project of arbitrary keys,
    #       so we cannot spec that ahead of time
    'features': fields.Raw,  # TODO: describe what this field is for
    'roots': fields.List(fields.String),  # TODO: describe what this field is for
    'version': fields.Nested(featureModelVersion, descrption='Version data for the fmjson format used')
})

featureModelSwagger = api.model('FeatureModel', {
    'uid': fields.String(description=uid_desc),
    'source': fields.String(descrption=source_desc),
    'filename': fields.String(description=filename_desc),
    'createdAt': fields.String(description=created_at_desc),
    'conftree': fields.Nested(featureModel, description='fmjson representation of the feature model'),
    'configs': fields.List(fields.Nested(configModel)),  # TODO: document what this field is for
    'configs_pp': fields.String,  # TODO: document what this field is for
    'configured_feature_model': fields.Raw(description=configured_feat_model_desc)
})

featureModelFetch = api.model('FeatureModelFetchParams', {
    'model_uid': fields.String(
        required=True,
        description='UID for the configurator you are requesting'
    )
})

uploadResponse = api.model('FeatureModelUploadResponse', {
    'uid': fields.String(description=uid_desc),
    'tree': fields.Raw(description='fmjson representation of the uploaded feature-model'),
    'configured_feature_model': fields.Raw,  # TODO: describe what this is for
    'source': fields.String(description='original uploaded source')
})

configureParams = api.model('FeatureModelConfigureParams', {
    'uid': fields.String(description=uid_desc),
    'feature_selection': fields.List(fields.Nested(configModel))  # TODO: describe what this is
})

configureResponse = api.model('FeatureModelConfigureResponse', {
    'server_source': fields.String(description=source_desc),
    'server_constraints': fields.String(description=constraints_desc),
    'validated_features': fields.Raw,  # TODO: what is this really supposed to be?
    'configured_feature_model': fields.Raw(description=configured_feat_model_desc)
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
        'nb_features_selected': len(record.configs),
    }


def missing_record_response(message=None):
    payload = {'error': HTTP_STATUS_CODES.get(404, 'Unknown error')}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    response.status_code = 404
    return abort(response)


# API Routes

@ns.route('/overview')
class OverviewModels(Resource):
    @ns.marshal_with(overviewModel)
    def get(self):
        """
            fetch all feature-models for display on the version 1 "overview" page
        """
        return FeatureModel.query.all()


@ns.route('/upload/<path:subpath>')
class ConfiguratorUpload(Resource):
    # NOTE: we cannot use "expect" here because we are using file-upload
    @ns.marshal_with(uploadResponse)
    def post(self, subpath):
        """
        upload a clafer or fm.json file to create a feature model
        """
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
                conftree=json_feat_model,
                configs=[],
                source=cfr_feature_model_source
            )
            db.session.add(new_feature_model)
            db.session.commit()

            current_app.logger.debug(f'created feature model ({new_feature_model})')

            return new_feature_model
        except Exception as err:
            current_app.logger.error(err)
            return abort(500, str(err))

@ns.route('/create-test/<path:subpath>')
class ConfiguratorUpload(Resource):
    # NOTE: we cannot use "expect" here because we are using file-upload
    @ns.marshal_with(uploadResponse)
    def post(self, subpath):
        """
        create a test-configuration, given a vulnerability class
        """
        workflowId, vuln_name = subpath.split('/')

        current_app.logger.debug('workflowId: ' + workflowId + 'Vuln: ' + vuln_name)

        if vuln_name not in config['default'].VALID_VULN_CLASSES.keys():
            return abort(500, "Invalid vulnerability class name: " + vuln_name)

        name = os.path.join('../../testgen_fm/', config['default'].VALID_VULN_CLASSES[vuln_name])
        current_app.logger.debug('sdfsdfsdfs: '+ name)
        os.chdir(os.path.dirname(__file__))
        current_app.logger.debug('FGSDFDSF: ' + os.getcwd())
        if name.endswith('.cfr'):
            try:
                with open(name, 'r') as f:
                    cfr_feature_model_source = f.read()
                cfr_source_bytes = cfr_feature_model_source.encode('utf8')
                json_feat_model = convert_model_to_json(cfr_source_bytes)
                # cfr_feature_model_source = request.data.decode('utf8')
            except RuntimeError as err:
                current_app.logger.error(str(err))
                return abort(500, str(err))
        else:
            return abort(400, 'Unsupported file extension for filename: ' + name)

        uid = str(uuid4())
        the_hash = str(sha3_256(cfr_source_bytes))

        current_app.logger.debug(f'going to store {name} with uid({uid}) and hash({the_hash})')

        try:
            new_feature_model = FeatureModel(
                uid=uid,
                label=name,
                filename=name,
                hash=the_hash,
                conftree=json_feat_model,
                configs=[],
                source=cfr_source_bytes
            )
            db.session.add(new_feature_model)
            db.session.commit()

            current_app.logger.debug(f'created feature model ({new_feature_model})')

            return new_feature_model
        except Exception as err:
            current_app.logger.error(err)
            return abort(500, str(err))


@ns.route('/configure')
class ConfiguratorConfigure(Resource):
    @ns.marshal_with(configureResponse)
    @ns.expect(configureParams)
    def post(self):
        """
        validates a given configuration for a feature-model
        """
        current_app.logger.debug('configure')

        data = json.loads(request.data)
        uid = data['uid']
        feature_selection = data['feature_selection']

        entry = FeatureModel.query.filter_by(uid=uid).first()

        old_feature_selection = entry.configs

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

        try:
            entry.configs = validated_features
            current_app.logger.debug(f'updating feature_model({entry})')
            db.session.commit()

            # pylint: disable=line-too-long
            # cp = subprocess.run(['claferIG', filename_cfr, '--useuids', '--addtypes', '--ss=simple', '--maxint=31', '--json'])
            # app.logger.debug('ClaferIG output: ' + (str(cp.stdout)))
            # d = load_json(filename_json)

            return entry
        except Exception as err:
            current_app.logger.error(err)
            return abort(500, str(err))


@ns.route('')
class ConfiguratorList(Resource):
    @ns.marshal_with(featureModelSwagger)
    def get(self):
        """
        fetch list of feature models ordered by creation date in descending order
        """
        current_app.logger.debug('fetching feature-models sorted by creation-date in descending order')

        entries = FeatureModel.query.all()
        list_models = [record_to_info(record) for record in entries]
        list_models.reverse()

        return list_models


@ns.route('/fetch-by-uid')
class ConfiguratorModel(Resource):
    @ns.marshal_with(featureModelSwagger)
    @ns.expect(featureModelFetch)
    def post(self):
        """
        fetch a single feature-model by the UID passed in the POST body
        """
        current_app.logger.debug('load from db')

        data = json.loads(request.data)
        uid = data['model_uid']

        current_app.logger.debug(f'going to fetch feature_model({uid})')

        model = FeatureModel.query.get(uid)

        if model is None:
            current_app.logger.debug(f'Unable to find feature-model{uid}')
            return missing_record_response('Unable to find given feature-model')

        return model
