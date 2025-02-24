# iut-project

pour demarrer le projet il faut lancer la commande suivante:
```npm install```
puis,
```npm run start```

# Description
Pour envoyer les mails, il faut se connecter avec un compte gmail, pour cela il faut modifier le fichier .env en ajoutant les informations de votre compte.
``````
exemple :
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=tristian.adams@ethereal.email
MAIL_PASS=e6RSc7BfuDVtXxZyvd````

``````
# Docker 
Pour lancer le projet avec docker, il faut lancer les commandes suivantes:
``````
docker run --name hapi-mysql -e MYSQL_ROOT_PASSWORD=hapi -e MYSQL_DATABASE=user -p 3307:3306 -d mysql:8.0
``````
# BDD
Pour se connecter à la base de données, il faut modifier le fichier server/index.js en ajoutant les informations de votre base de données.
``````
connection : {
        host     : process.env.DB_HOST || '127.0.0.1',
        user     : process.env.DB_USER || 'root',
        password : process.env.DB_PASSWORD || 'hapi',
        database : process.env.DB_DATABASE || 'user',
        port     : process.env.DB_PORT || 3307
    }
``````

# Fonctionnement du projet

aller sur le lien suivant : http://localhost:3000/documentation

pour s'authentifier en tant qu'admin, il faut utiliser les identifiants suivants:
```````
/user/login/admin
```````
pour s'authentifier en tant qu'utilisateur, il faut utiliser les identifiants suivants:
```````
/user/login/user
```````