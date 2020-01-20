from flask import current_app
from flask_restplus import Resource, fields

from . import api
from app.models import db, JobStatuses, FeatureExtractionJobs


ns = api.namespace(
    'feature-extraction-job',
    description='Operations on feature extraction jobsd'
)

new_feature_extraction_job = api.model('NewFeatureExtracitonJob', {
    'featModelId': fields.Integer(
        required=True,
        description='Id for the feature model inputs'),
})

existing_feature_extraction_job = api.inherit(
    'ExistingFeatureExtractionJob',
    new_feature_extraction_job,
    {
        'jobId': fields.Integer(
            required=True,
            description='Id of feature extraction job'
        ),
    }
)


@ns.route('')
@ns.route('/<int:jobId>')
class FeatureExtractionJob(Resource):
    @ns.doc('create feature extraction job')
    @ns.marshal_list_with(existing_feature_extraction_job)
    @ns.expect(new_feature_extraction_job)
    def post(self):
        new_job_data = api.payload
        # ...assume we are creating an actual job here and
        # that it succeeds in starting, but has not completed...
        running_status = JobStatuses.query.filter_by(label='running').first()
        new_feat_extraction_job = FeatureExtractionJobs(
            label=new_job_data['label'],
            featModelId=new_job_data['featModelId'],
            statusId=running_status.statusId,
        )
        db.session.add(new_feat_extraction_job)
        db.session.commit()

        return new_feat_extraction_job

    @ns.doc('fetch a feature model input')
    @ns.marshal_with(existing_feature_extraction_job)
    def get(self, jobId):
        current_app.logger.debug(f'jobId: {jobId}')
        return FeatureExtractionJobs.query.filter_by(jobId=jobId).first()  # noqa E501
