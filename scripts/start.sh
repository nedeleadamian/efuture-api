#!/bin/sh

# Exit the script on any command with non 0 return code
set -e

# Go to project root
cd "$(dirname "$0")"
cd ..

node node_modules/typeorm/cli.js migration:run -d dist/src/database/data-source.js

exec node dist/src/main.js
