#!/bin/sh
python /usr/src/app/curation-api/manage.py collectstatic --noinput

/usr/local/bin/gunicorn config.wsgi -w 4 -b 0.0.0.0:5000 --chdir=/usr/src/app/curation-api
