from flask import current_app
from flask_restplus import Resource, fields

from . import api
from app.models import db, FeatureModelInput


ns = api.namespace(
    'feature-model-inputs',
    description='Operations on feature model inputs'
)

new_feature_model_inputs = api.model('NewFeatureModelInputs', {
    'label': fields.String(
        required=True,
        description='Human-readable label'),
    'hdlId': fields.Integer(
        required=True,
        description='Id for the HDL resource'),
})

existing_feature_model_inputs = api.inherit(
    'ExistingFeatureModelInputs',
    new_feature_model_inputs,
    {
        'featModelId': fields.Integer(
            required=True,
            description='Id of feature model inputs'
        ),
    }
)


@ns.route('')
@ns.route('/<int:featModelId>')
class FeatureModelInputApi(Resource):
    @ns.doc('create feature model inputs')
    @ns.marshal_list_with(existing_feature_model_inputs)
    @ns.expect(new_feature_model_inputs)
    def post(self):
        new_feat_model_data = api.payload
        new_feat_model_input = FeatureModelInput(label=new_feat_model_data['label'], hdlId=new_feat_model_data['hdlId'])  # noqa E501
        db.session.add(new_feat_model_input)
        db.session.commit()

        return new_feat_model_input

    @ns.doc('fetch a feature model input')
    @ns.marshal_with(existing_feature_model_inputs)
    def get(self, featModelId):
        current_app.logger.debug(f'featModelId: {featModelId}')
        return FeatureModelInput.query.filter_by(featModelId=featModelId).first()  # noqa E501
