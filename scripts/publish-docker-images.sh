#! /bin/bash

usage="$(basename "$0") [-h] [-p] [-t] [-m MSG]

where:
    -h          show help
    -p          docker push images
    -t          git tag the repo with msg
    -m MSG      message used to annotate git tag
"

IMAGE_REPOSITORY=artifactory.galois.com:5008

die () {
    echo >&2 "$@"
    exit 1
}


# load the variables from .env
if [ -f .env ]
then
    export $(cat .env | sed 's/#.*//g' | xargs)
fi

# Loop through the environment variables that are expected
declare -a arr=("TOOLSUITE_BRANCH" "TESTGEN_BRANCH" "BESSPIN_BASE_VERSION" "BESSPIN_TOOLSUITE_VERSION" "BESSPIN_UI_VERSION")
for i in "${arr[@]}"
do
    if [ -z "${!i}" ]
    then
        echo "Error: $i must be set"
        exit 1
    else
        echo "$i=${!i}"
    fi
done


while getopts hptm: option
do
    case "${option}"
    in
        h)  echo "$usage" >&2
            exit 1
            ;;
        p)  DOCKER_PUSH="True" ;;  # -p           : docker push
        t)  DO_TAG="True" ;;       # -t           : git tag
        m)  msg=${OPTARG} ;;       # -m MSG       : message annotating git tag
        :)  printf "illegal option: -%s\n" "$OPTARG" >&2
            echo "$usage" >&2
            exit 1
            ;;
        ?)  printf "illegal option: -%s\n" "$OPTARG" >&2
            echo "$usage" >&2
            exit 1
            ;;
    esac
done


if [ ! -z "$DOCKER_PUSH" ]
then
    echo "Going to log in to artifactory docker repository (this will require your password)"
    docker login $IMAGE_REPOSITORY
fi


source ./scripts/production.env


userTag="${IMAGE_REPOSITORY}/besspin-base-user:${BESSPIN_BASE_VERSION}"
latestTag="${IMAGE_REPOSITORY}/besspin-base-user:latest"

echo "Building base user image ${userTag}..."
docker build -t $userTag -t $latestTag - < Dockerfile-besspin-base

[ $? -eq 0 ] || die "Unable to create ${userTag}"

if [ ! -z "$DOCKER_PUSH" ]
then
    echo "Pushing base user image ${userTag}..."
    docker push $userTag

    [ $? -eq 0 ] || die "Unable to push ${userTag}"
else
    echo "Skipping docker push besspin-base-user"
fi


toolsuiteTag="${IMAGE_REPOSITORY}/besspin-toolsuite:${BESSPIN_TOOLSUITE_VERSION}"
toolsuiteLatestTag="${IMAGE_REPOSITORY}/besspin-toolsuite:latest"

echo "Building toolsuite image ${toolsuiteTag}..."
docker build \
    -f Dockerfile-toolsuite \
    -t $toolsuiteTag \
    -t $toolsuiteLatestTag \
    --build-arg TOOLSUITE_BRANCH=$TOOLSUITE_BRANCH \
    --build-arg TESTGEN_BRANCH=$TESTGEN_BRANCH \
    --build-arg BESSPIN_BASE_VERSION=$BESSPIN_BASE_VERSION \
    --build-arg BINCACHE_LOGIN=$BINCACHE_LOGIN \
    --build-arg BINCACHE_APIKEY=$BINCACHE_APIKEY \
    --build-arg TOKEN_NAME=$TOKEN_NAME \
    --build-arg PRIVATE_TOKEN=$PRIVATE_TOKEN \
    .

[ $? -eq 0 ] || die "Unable to create ${toolsuiteTag}"

if [ ! -z "$DOCKER_PUSH" ]
then
    echo "Pushing toolsuite image ${toolsuiteTag}..."
    docker push $toolsuiteTag

    [ $? -eq 0 ] || die "Unable to push ${toolsuiteTag}"
else
    echo "Skipping docker push besspin-toolsuite"
fi


uiTag="${IMAGE_REPOSITORY}/besspin-ui:${BESSPIN_UI_VERSION}"
uiLatestTag="${IMAGE_REPOSITORY}/besspin-ui:latest"

echo "Building ui image ${uiTag}..."
docker build \
    -f Dockerfile-toolsuite-ui \
    -t $uiTag \
    -t $uiLatestTag \
    --build-arg BESSPIN_TOOLSUITE_VERSION=$BESSPIN_TOOLSUITE_VERSION \
    --build-arg TOKEN_NAME=$TOKEN_NAME \
    --build-arg PRIVATE_TOKEN=$PRIVATE_TOKEN \
    .

[ $? -eq 0 ] || die "Unable to create ${uiTag}"

if [ ! -z "$DOCKER_PUSH" ]
then
    echo "Pushing ui image ${uiTag}..."
    docker push $uiTag

    [ $? -eq 0 ] || die "Unable to push ${uiTag}"
else
    echo "Skipping docker push besspin-ui"
fi

if [ ! -z "$DO_TAG" ]
then
    echo "Tagging with ${BESSPIN_UI_VERSION}..."
    git tag --annotate --message="${msg}" $BESSPIN_UI_VERSION

    [ $? -eq 0 ] || die "Unable to create tag."
fi

echo "done!"

exit 0
