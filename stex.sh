#!/bin/sh

if [ ! -f dist/bin/cli.js ]; then
    npm run build
fi

node dist/bin/cli.js "$@"
