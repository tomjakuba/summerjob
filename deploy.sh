# Checking system predispositions
source .env
mkdir -p web-storage
mkdir -p backup

# Make database dump/backup
echo "📚 Creating database backup"
filename=/dump_$(date +"%Y-%m-%d_%H_%M_%S").gz
docker exec -t summerjob-db echo "summerjob-db:5432:$POSTGRES_DB:$POSTGRES_USER:$POSTGRES_PASSWORD" > ~/.pgpass
docker exec -t summerjob-db bash -c "pg_dumpall -c -U $POSTGRES_USER | gzip > $filename"
docker cp summerjob-db:/$filename backup/$filename

# Download new docker manifest
echo "🔖 Downloading new docker compose manifest"
curl https://raw.githubusercontent.com/ladal1/summerjob/main/docker-compose.yaml -O -s

# Download updated containers
echo "🎉 Pulling containers"
docker compose pull

# Start containers
echo "🚀 Starting containers"
docker compose up -d