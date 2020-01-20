from flask import current_app, request
import json
from flask_restplus import Resource, fields

from . import api
from app.models import db, VersionedResources, VersionedResourceTypes

"""
    Since all the routes here are for managing our VersionedResources
    we set up a root namespace that is the prefix for all routes
    defined below
"""
ns = api.namespace(
    'versioned-resource',
    description='Operations on versioned resources'
)

"""
    Define a swagger model that can be used for:
    - defining expected shape of inputs/outputs to the api
    - autogenerate swagger documentation for the structure of api data
"""
versioned_resource_type = api.model('VersionedResourceType', {
    'label': fields.String(
        required=True,
        description='Human-readable resource type label',
    ),
    'resourceTypeId': fields.Integer(
        required=True,
        description='Id of resource type',
    ),
})

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
    'resourceType': fields.Nested(
        versioned_resource_type,
        required=True,
        description='Label for the versioned resource type categorizing this resource'  # noqa E501
    )
})

"""
    since the only difference between a "new" resource and an existing one
    is the presence of a system-supplied ID, we inherit the "NewVersioendResource"
    for the definition of our "existing" one...
"""
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
class VersionedResourceList(Resource):
    # by declaring which swagger model we use to marshal data,
    # flask will automagically convert any returned data to be
    # limited to that shape. This means that can effectively be
    # hidden by not including them in the definition
    @ns.marshal_list_with(existing_versioned_resource)
    def get(self):
        current_app.logger.debug(f'fetching all versioned resources')
        return VersionedResources.query.all()

    # we can also declare the expected shape of input data to allow
    # for flask to validate that the correct data is supplied in a POST/PUT
    @ns.marshal_with(existing_versioned_resource)
    @ns.expect(new_versioned_resource)
    def post(self):
        resource_input = json.loads(request.data)
        current_app.logger.debug(resource_input['resourceType'])
        resource_type = VersionedResourceTypes.query.get(resource_input['resourceType']['resourceTypeId'])
        new_resource = VersionedResources(
            label=resource_input['label'],
            url=resource_input['url'],
            version=resource_input['version'],
            resourceTypeId=resource_type.resourceTypeId
        )
        db.session.add(new_resource)
        db.session.commit()

        return new_resource


@ns.route('/<int:resourceId>')
class VersionedResource(Resource):
    @ns.doc('update a versioned resource')
    @ns.marshal_list_with(existing_versioned_resource)
    @ns.expect(new_versioned_resource)
    def put(self, resourceId):
        current_app.logger.debug(f'updating resourceId: {resourceId}')
        resource_input = json.loads(request.data)
        resource_type = VersionedResourceTypes.query.get(resource_input['resourceType']['resourceTypeId'])
        existing_resource = VersionedResources.query.get_or_404(resourceId)
        existing_resource.label = resource_input['label']
        existing_resource.url = resource_input['url']
        existing_resource.version = resource_input['version']
        existing_resource.resourceTypeId = resource_type.resourceTypeId
        db.session.add(existing_resource)
        db.session.commit()

        return existing_resource

    @ns.doc('fetch a versioned resource')
    @ns.marshal_with(existing_versioned_resource)
    def get(self, resourceId):
        current_app.logger.debug(f'fetching resourceId: {resourceId}')
        return VersionedResources.query.get(resourceId)
