Le projet est un projet en déploiement on prem et leur serveur n'avait pas accès a internet donc pas de pul d'image docker dans le cloud d'ou la constrcution d'image et l'export en tar mais le principe reste le meme.

donc il faut faire :

docker build -t tc-means-api:local ./tc-means-api
docker build -t tc-means-web:local ./tc-means-web
docker pull mysql:8.4
docker tag mysql:8.4 mysql:local

docker build -t tc-means-api:local ./tc-means-api
docker build -t tc-means-web:local ./tc-means-web
docker pull mysql:8.4
docker tag mysql:8.4 mysql:local

docker save -o tc-means.tar tc-means-api:local tc-means-web:local mysql:local

docker load -i tc-means.tar

docker compose up -d

il faut imaginer le pc comme serveur donc si utilisation du pda il faut trouver l'ip du pc sur le reseau et changer la base Url dans le web avec cette meme ip sinon sans pda on peut faire localhost et utiliser juste le back office

flutter build apk --release
adb install -r build/app/outputs/flutter-apk/app-release.apk

pour ip sur mac
ipconfig getifaddr en0
