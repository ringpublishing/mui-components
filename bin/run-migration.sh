#!/usr/bin/env bash
set -e

if [ -z "$1" ]; then
  echo "Error: Please provide a migration name"
  echo "Usage: npx @ringpublishing/mui-components run-migration <migration-name> [args]"
  exit 1
fi

MIGRATION_NAME=$1
shift

# Handle the case when the script is invoked via npx with "run-migration" as an argument
if [ "$MIGRATION_NAME" = "run-migration" ]; then
    if [ -z "$1" ]; then
        echo "Error: Please provide a migration name"
        echo "Usage: npx @ringpublishing/mui-components run-migration <migration-name> [args]"
        exit 1
    fi
    MIGRATION_NAME=$1
    shift
fi

SCRIPT_PATH="$(dirname "$(readlink -f "$0")")/../scripts/migrations/${MIGRATION_NAME}.ts"

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Error: Migration script not found: ${SCRIPT_PATH}"
  exit 1
fi

echo "Running migration: ${MIGRATION_NAME}"
echo "Script path: ${SCRIPT_PATH}"

npx tsx "$SCRIPT_PATH" "$@"
