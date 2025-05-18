git clone https://github.com/ats1999/file-metadata-service.git
cd file-metadata-service
cp ./api-server/.env.sample ./api-server/.env
cp ./file-processor/.env.sample ./file-processor/.env
docker compose up