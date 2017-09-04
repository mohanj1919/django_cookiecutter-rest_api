#!/bin/bash
set -e
# This entrypoint is used to play nicely with the current cookiecutter configuration.
# Since docker-compose relies heavily on environment variables itself for configuration, we'd have to define multiple
# environment variables just to support cookiecutter out of the box. That makes no sense, so this little entrypoint
# does all this for us.

# the official postgres image uses 'postgres' as default user if not set explictly.
if [ -z "$POSTGRES_USER" ]; then
    export POSTGRES_USER=postgres
fi

export SKIP_DB_STATUS_CHECK=0

# Sleep when asked to, to allow the database time to start
# before OM1 tries to run /checkdb.py below.
sleep 100

# Setup database automatically if needed
if [ $SKIP_DB_STATUS_CHECK -eq 0 ]; then
  echo "Running database check"

  DB_CHECK_STATUS=1

  while [ "$DB_CHECK_STATUS" != 0 ]
  do
    echo "Database check"
    sleep 5
    python checkdb.py
    DB_CHECK_STATUS=$?
    echo "DB_CHECK_STATUS"
    echo $DB_CHECK_STATUS

    if [ $DB_CHECK_STATUS -eq 0 ]; then
      echo "Configuring initial database"
      python manage.py makemigrations --noinput
      python manage.py migrate --noinput
    fi
  done
fi
exec "$@"
