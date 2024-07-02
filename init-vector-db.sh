#!/bin/bash
set -e

# Wait for PostgreSQL to become available.
echo "Waiting for PostgreSQL to start..."
until psql -d postgres -c '\q' -U "$POSTGRES_USER" ; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

# Create the 'langfuse' user and database if they do not exist
USER_EXISTS=$(psql -d postgres -U "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_roles WHERE rolname='langfuse'")
if [ "$USER_EXISTS" != "1" ]; then
    psql -d postgres -U "$POSTGRES_USER" -c "CREATE USER langfuse WITH PASSWORD 'langfuse';"
fi

EXISTS=$(psql -d postgres -U "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='langfuse'")
if [ "$EXISTS" != "1" ]; then
    psql -d postgres -U "$POSTGRES_USER" -c "CREATE DATABASE langfuse WITH OWNER = langfuse;"
fi

# Create the PGVector extension
psql -d langfuse -U "$POSTGRES_USER" -c "CREATE EXTENSION IF NOT EXISTS vector;"

echo "User and database 'langfuse' created (if they didn't exist), and PGVector extension installed."
