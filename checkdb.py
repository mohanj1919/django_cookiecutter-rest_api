import os, sys, psycopg2

DB_NAME = os.getenv('POSTGRES_USER')
DB_HOST = os.getenv('POSTGRES_HOST')
DB_USER = os.getenv('POSTGRES_USER')
DB_PASS = os.getenv('POSTGRES_PASSWORD')

conn_string = (
    "dbname='" + DB_NAME +
    "' user='" + DB_USER +
    "' host='" + DB_HOST +
    "' password='" + DB_PASS + "'")
print("Connecting to database:\n" + conn_string)
conn = psycopg2.connect(conn_string)
cur = conn.cursor()

cur.execute("select 1")
exists = bool(cur.rowcount)

if exists is False:
    print("Database does not appear to be setup.")
    sys.exit(2)
