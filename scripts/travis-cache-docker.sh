#!/bin/sh
set -e

# simple script that stores and restores relevant docker images to ~/docker,
# which can then be easily cached by travis

CACHEDIR=$HOME/docker

if [ "$1" = "load" ]
then
    echo "Loading docker cache..."
    # load docker images from cache
    if [ -d $CACHEDIR ]; then
        for f in $CACHEDIR/*.tar.gz;
        do
            echo "Loading '$f' into docker";
            zcat "$f" | docker load || true;
        done;
    else
        echo "Docker cache dir $CACHEDIR not found"
    fi
fi

if [ "$1" = "save" ]
then
    echo "Saving docker cache"
    docker image prune -f
    mkdir -p $CACHEDIR

    # check which images to remove from the cache
    CACHED=$( find $CACHEDIR -type f -name '*.tar.gz' | xargs -I '{}' -n1 basename '{}' .tar.gz )
    for i in ${CACHED}
    do
        # check if this image is still in use
        if ! docker image inspect $i > /dev/null
        then
            rm -vf $CACHEDIR/$i.tar.gz
        fi
    done

    # check which images to add to the cache
    IMAGES=$( docker image list --no-trunc -q )
    for img in ${IMAGES}
    do
        # check if this image is already cached
        if ! [ -e $CACHEDIR/$img.tar.gz ]
        then
            echo "adding $img.tar.gz"
            docker save $img | gzip -c6 > $CACHEDIR/$img.tar.gz
        fi
    done
fi

exit 0

