#! /bin/bash

IMAGE_REPOSITORY=artifactory.galois.com:5008

die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 2 ] || die "Usage: publish-docker-images.sh tag message (Only received ${#} arguments)"

tag=$1
msg=$2

echo "Going to log in to artifactory docker repository (this will require your password)"
docker login $IMAGE_REPOSITORY

echo "Tagging with ${tag}..."
git tag --annotate --message="${msg}" $tag 

[ $? -eq 0 ] || die "Unable to create tag."

source ./scripts/production.env

userTag="${IMAGE_REPOSITORY}/besspin-base-user:${tag}"

echo "Building base user image ${userTag}..."
docker build -f Dockerfile-besspin-base -t $userTag .

[ $? -eq 0 ] || die "Unable to create ${userTag}"

toolsuiteTag="${IMAGE_REPOSITORY}/besspin-toolsuite:${tag}"

echo "Building toolsuite image ${toolsuiteTag}..."
docker build \
    -f Dockerfile-toolsuite \
    -t $toolsuiteTag \
    --build-arg BINCACHE_LOGIN=$BINCACHE_LOGIN \
    --build-arg BINCACHE_APIKEY=$BINCACHE_APIKEY \
    --build-arg TOKEN_NAME=$TOKEN_NAME \
    --build-arg PRIVATE_TOKEN=$PRIVATE_TOKEN \
    .

[ $? -eq 0 ] || die "Unable to create ${toolsuiteTag}"

uiTag="${IMAGE_REPOSITORY}/besspin-ui:${tag}"

echo "Building ui image ${uiTag}..."
docker build \
    -f Dockerfile-toolsuite-ui \
    -t $uiTag \
    --build-arg TOKEN_NAME=$TOKEN_NAME \
    --build-arg PRIVATE_TOKEN=$PRIVATE_TOKEN \
    .

[ $? -eq 0 ] || die "Unable to create ${uiTag}"

echo "Pushing base user image ${userTag}..."
docker push $userTag

[ $? -eq 0 ] || die "Unable to push ${userTag}"

echo "Pushing toolsuite image ${toolsuiteTag}..."
docker push $toolsuiteTag

[ $? -eq 0 ] || die "Unable to push ${toolsuiteTag}"

echo "Pushing ui image ${uiTag}..."
docker push $uiTag

[ $? -eq 0 ] || die "Unable to push ${uiTag}"

echo "done!"

exit 0
