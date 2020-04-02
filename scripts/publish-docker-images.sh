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

# echo "Tagging with ${tag}..."
# git tag --annotate --message="${msg}" $tag 

# [ $? -eq 0 ] || die "Unable to create tag."

source ./scripts/production.env

userTag="${IMAGE_REPOSITORY}/besspin-base-user:${tag}"
latestTag="${IMAGE_REPOSITORY}/besspin-base-user:latest"

echo "Building base user image ${userTag}..."
docker build -f Dockerfile-besspin-base -t $userTag -t $latestTag .

[ $? -eq 0 ] || die "Unable to create ${userTag}"

echo "Pushing base user image ${userTag}..."
docker push $userTag

echo "Pushing base user image ${latestTag}..."
docker push $latestTag

[ $? -eq 0 ] || die "Unable to push ${userTag}"

toolsuiteTag="${IMAGE_REPOSITORY}/besspin-toolsuite:${tag}"
latestTag="${IMAGE_REPOSITORY}/besspin-toolsuite:latest"

echo "Building toolsuite image ${toolsuiteTag}..."
docker build \
    -f Dockerfile-toolsuite \
    -t $toolsuiteTag \
    -t $latestTag \
    --build-arg BINCACHE_LOGIN=$BINCACHE_LOGIN \
    --build-arg BINCACHE_APIKEY=$BINCACHE_APIKEY \
    --build-arg TOKEN_NAME=$TOKEN_NAME \
    --build-arg PRIVATE_TOKEN=$PRIVATE_TOKEN \
    .

[ $? -eq 0 ] || die "Unable to create ${toolsuiteTag}"

echo "Pushing toolsuite image ${toolsuiteTag}..."
docker push $toolsuiteTag

echo "Pushing toolsuite image ${latestTag}..."
docker push $latestTag

[ $? -eq 0 ] || die "Unable to push ${toolsuiteTag}"

uiTag="${IMAGE_REPOSITORY}/besspin-ui:${tag}"
latestTag="${IMAGE_REPOSITORY}/besspin-ui:latest"

echo "Building ui image ${uiTag}..."
docker build \
    -f Dockerfile-toolsuite-ui \
    -t $uiTag \
    -t $latestTag \
    --build-arg TOKEN_NAME=$TOKEN_NAME \
    --build-arg PRIVATE_TOKEN=$PRIVATE_TOKEN \
    .

[ $? -eq 0 ] || die "Unable to create ${uiTag}"

echo "Pushing ui image ${uiTag}..."
docker push $uiTag

echo "Pushing ui image ${latestTag}..."
docker push $latestTag

[ $? -eq 0 ] || die "Unable to push ${uiTag}"

echo "done!"

exit 0
