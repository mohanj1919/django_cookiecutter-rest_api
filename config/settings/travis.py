
from .common import *  # noqa

SECURE_SSL_REDIRECT = False

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': env('DB_NAME', default='profile'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASS', default=''),
        'HOST': env('DB_HOST', default='127.0.0.1'),
        'PORT': env('DB_PORT', default='5432')
    }
}
