#!/bin/bash

# Проверка наличия аргумента для комментария
if [ -z "$1" ]
then
  echo "Использование: ./deploy.sh \"комментарий для коммита\""
  exit 1
fi

COMMENT=$1

# Save changes to Git
git add .
git commit -m "$COMMENT"
git push origin main

# Connect to the server and deploy
ssh root@95.140.147.134 << 'ENDSSH'
cd aishanti
git pull origin main
docker stop aishantibot
docker rm aishantibot
docker build -t aishantibot .
docker run -d --name aishantibot -p 3000:3000 aishantibot
ENDSSH
