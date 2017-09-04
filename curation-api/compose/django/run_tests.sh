
docker ps -a

docker exec -it postgres_travis_1 env

echo "Running django tests"
python /usr/src/app/curation-api/manage.py test
