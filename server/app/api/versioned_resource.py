from flask import current_app
from flask_restplus import Resource, fields

from . import api
from app.models import db, VersionedResources, VersionedResourceTypes


ns = api.namespace(
    'versioned-resource',
    description='Operations on versioned resources'
)

new_versioned_resource = api.model('NewVersionedResource', {
    'label': fields.String(
        required=True,
        description='Human-readable resource label'),
    'url': fields.String(
        required=True,
        description='URL for resource repository'),
    'version': fields.String(
        required=True,
        description='Revision of resource'),
    'type': fields.String(
        required=True,
        description='Label for the versioned resource type categorizing this resource'  # noqa E501
    )
})

existing_versioned_resource = api.inherit(
    'ExistingVersionedResource',
    new_versioned_resource,
    {
        'resourceId': fields.Integer(
            required=True,
            description='Resource identifier'
        ),
    }
)


@ns.route('')
@ns.route('/<int:resourceId>')
class VersionedResource(Resource):
    @ns.doc('create a versioned resource')
    @ns.marshal_list_with(existing_versioned_resource)
    @ns.expect(new_versioned_resource)
    def post(self):
        resource_input = api.payload
        resource_type = VersionedResourceTypes.query.filter_by(label=resource_input['type']).first()  # noqa E501
        new_resource = VersionedResources(
            label=resource_input['label'],
            url=resource_input['url'],
            version=resource_input['version'],
            resourceTypeId=resource_type.resourceTypeId
        )
        db.session.add(new_resource)
        db.session.commit()

        return new_resource

    @ns.doc('fetch a versioned resource')
    @ns.marshal_with(existing_versioned_resource)
    def get(self, resourceId):
        current_app.logger.debug(f'resourceId: {resourceId}')
        return VersionedResources.query.filter_by(resourceId=resourceId).first()  # noqa E501
