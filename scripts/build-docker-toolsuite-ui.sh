#! /bin/sh

# build the docker image for the toolsuite UI
# NOTE: This expects the following ENV vars to be exported via the "dev.env" file:
#         TOKEN_NAME - the name of the GitLab API token to use for fetching repositories
#         PRIVATE_TOKEN - the value of the GitLab API token
#         BINCACHE_LOGIN - username for the Artifactory account being used to pull images
#         BINCACHE_APIKEY - the API key for the given user

if [ ! -f ./scripts/dev.env ]; then
    echo 'No "dev.env" file defined to expose necessary environment variables' >&2
    exit 1
fi

source ./scripts/dev.env

docker-compose -f docker-compose-toolsuite.yaml build
