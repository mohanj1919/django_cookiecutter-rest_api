import os
import sys
import urllib.parse as urlparse

import psycopg2

DATABASE_URL = os.getenv('DATABASE_URL')

result = urlparse.urlparse(DATABASE_URL)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
connection = psycopg2.connect(
    database=database,
    user=username,
    password=password,
    host=hostname
)

print('&&&&&&&&&&&&&&&&&&&&&&&&')
print(connection)
print('&&&&&&&&&&&&&&&&&&&&&&&&')

POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_DB = os.getenv('POSTGRES_DB')
POSTGRES_HOST = os.getenv('POSTGRES_HOST')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')

conn_string = (
    "dbname='" + POSTGRES_DB +
    "' user='" + POSTGRES_USER +
    "' host='" + POSTGRES_HOST +
    "' password='" + POSTGRES_PASSWORD + "'")

print("Connecting to database:\n" + conn_string)

conn = psycopg2.connect(conn_string)
cur = conn.cursor()

cur.execute("select 1")
exists = bool(cur.rowcount)

if exists is False:
    print("Database does not appear to be setup.")
    sys.exit(2)
