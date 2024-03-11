# Thesis Management System

#### Short Description
Expansion, modification, and virtualization (docker containers) of the existing web-based application Thesis Management System (TMS)
for the management of undergraduate, postgraduate, and doctoral theses in an Academic Institution, aiming to facilitate and support 
professors and students in the announcement, assignment, monitoring, and completion of these works.

## Verbose Variant

What you will need:
* NodeJS
* React TS
* MongoDB

Tested on:
* NodeJS v20.8.1
* React TS
* MongoDB v4.4

## Docker Variant

What you will need:
* Docker

Tested on:
* Docker version 25.0.3, build 4debf41


### Useful commands
Inside *`integration`* folder you can use the following commands:

> Run application (and build):
```sh
docker-compose up --build
```

> Run application (with full logging available):
```sh
docker-compose up
```

> Run application (detached mode/with no logging available):
```sh
docker-compose up -d
```

> Stop application:
```sh
docker-compose down
```

> View logs for specific project/container of the application (e.g., backend):
```sh
docker-compose logs -f backend
```

