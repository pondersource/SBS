#!/bin/sh
set -e

IMAGE_NAME=surfscz/sbs-server

if [ -n "$1" ]
then
    # version was specified on command line
    IMAGE_VERSION=$1
else
    # if no IMAGE_VERSION is specified, use the current commit
    IMAGE_VERSION=git-$(git rev-parse HEAD)
fi

IMAGE_TAG=${IMAGE_NAME}:${IMAGE_VERSION}

# build
docker build -t ${IMAGE_TAG} .

if [ -n "$TRAVIS_PULL_REQUEST" ] # tag image with PR number
then
    VERSION=$( echo -n "PR__$TRAVIS_PULL_REQUEST" | tr -c '[:alnum:]-_.' '_' )
if

if [ -n "$TRAVIS_BRANCH" ] # tag this image with the current branch name if we're autobuilding in travis
then
    # only alnum and -_. allowed in tags; replace everything else by _
    VERSION=$( echo -n "$TRAVIS_BRANCH" | tr -c '[:alnum:]-_.' '_' )
    docker tag ${IMAGE_TAG} "${IMAGE_NAME}:${VERSION}"
fi

exit 0
