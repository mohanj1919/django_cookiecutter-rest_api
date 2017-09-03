import os
import sys

import psycopg2

POSTGRES_USER = os.getenv('POSTGRES_USER')
POSTGRES_DB = os.getenv('POSTGRES_DB')
POSTGRES_HOST = os.getenv('POSTGRES_HOST')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD')

conn_string = (
    "dbname='" + POSTGRES_DB +
    "' user='" + POSTGRES_USER +
    "' host='" + POSTGRES_HOST +
    "' password='" + POSTGRES_PASSWORD + "'")

# print("Connecting to database:\n" + conn_string)

conn = psycopg2.connect(conn_string)
cur = conn.cursor()

cur.execute("select 1")
exists = bool(cur.rowcount)

if exists is False:
    print("Database does not appear to be setup.")
    sys.exit(2)
