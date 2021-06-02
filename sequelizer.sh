#!/usr/bin/env bash

env=`echo "$@" | sed -n 's/.*--env=\([a-zA-Z0-9][a-zA-Z0-9]*\).*/\1/p'`

if [ -z "${env}" ]
then
    env="LCL"
    added="--env=${env}"
fi

set -a
source ./env/${env}.env
./node_modules/.bin/sequelize --config=src/models/config.js --models-path=src/models/schema --migrations-path=src/models/migration --seeders-path=src/models/seeds $added $@
set +a
