# SURF SamenwerkingsBeheerSysteem (SBS)

[![Build status](https://github.com/SURFscz/SBS/actions/workflows/main.yml/badge.svg)](https://github.com/SURFscz/SBS/actions)
[![Codecov](https://codecov.io/gh/SURFscz/SBS/branch/main/graph/badge.svg)](https://codecov.io/gh/SURFscz/SBS)

SURF Research Access Management (SRAM) Platform

### [Overview Requirements](#system-requirements)

-   Python 3.7.x
-   MySQL v5.7.x or MariaDB 10.x
-   Redis v6.x
-   Yarn 1.x
-   node
-   libxmlsec1

### [Getting started](#getting-started)

#### [Server](#server)

Create a virtual environment and install the required python packages:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r ./server/requirements/test.txt
```

Connect to your local mysql database: `mysql -uroot` and create the SBS database and user:

```sql
DROP DATABASE IF EXISTS sbs;
DROP DATABASE IF EXISTS sbs_test;
CREATE DATABASE sbs DEFAULT CHARACTER SET utf8mb4;
CREATE DATABASE sbs_test DEFAULT CHARACTER SET utf8mb4;
CREATE USER 'sbs'@'localhost' IDENTIFIED BY 'sbs';
GRANT ALL PRIVILEGES ON *.* TO 'sbs'@'localhost' WITH GRANT OPTION;
```

Ensure MySQL is running and run the Python server with the correct local environment settings:

```bash
PROFILE=local CONFIG=config/test_config.yml python -m server
```

With TESTING=1 no mails will be send. If you do want to validate the mails you can run a fake smtp server with:

```bash
python -m smtpd -n -c DebuggingServer localhost:1025
```

If you want the emails to be opened in the browser when developing add the `OPEN_MAIL_IN_BROWSER=1` to your environment

#### [Client](#client)

First install all dependencies with:

```bash
yarn install
```

The GUI can be started with:

```bash
cd client
yarn start
```

To create a GUI production build:

```bash
yarn build
```

To analyze the bundle:

```bash
yarn analyze
```

### [API](#api)

See the [Swagger](https://test.sram.surf.nl/apidocs/) for the API documentation and data model.

To see all routes:

```bash
source .venv/bin/activate
cd server
CONFIG='config/test_config.yml' FLASK_APP='__main__.py' flask routes
```

### [Testing](#testing)

To run all Python tests and validate syntax / formatting:

```bash
source .venv/bin/activate
cd server
pytest test
flake8 ./server/
```

To generate coverage reports:

```bash
source .venv/bin/activate
cd server
pytest --cov=server --cov-report html:htmlcov test
open htmlcov/index.html
```

To run all JavaScript tests:

```bash
cd client
yarn test
```

Or to run all the tests and do not watch - like CI:

```bash
cd client
CI=true yarn test
```

With the environment variable `CONFIG=config/test_config.yml` the test database is used. After you ran one or all of the tests
the database is left with the test data seed. If you want to skip the login process when developing local then add the following to your
environment: OPEN_MAIL_IN_BROWSER=1;PROFILE=local;CONFIG=config/test_config.yml;ALLOW_MOCK_USER_API=1

### [Deployment](#deployment)

See the https://github.com/SURFscz/SCZ-deploy project

### [Upgrade](#upgrade)

See https://github.com/simion/pip-upgrader for upgrading automatically

```bash
source .venv/bin/activate
pip install pip-upgrader
cd server
pip-upgrade requirements/test.txt --dry-run
```

### [Swagger](#swagger)

See http://localhost:8080/apidocs/ and https://test.sram.surf.nl/apidocs/

### [SURFSecureID](#surfsecureid)

See the /config/saml_test configuration and the https://github.com/SURFscz/SCZ-deploy project

### [flash](#flash)

To open a flash terminal session:

```bash
source .venv/bin/activate
cd server
CONFIG='config/test_config.yml' FLASK_APP='__main__.py' flask shell
```

### [docker](#docker)

For localhost deployment you can make use of **docker**. You can take existing **docker-compose.yml** as your starting point. The docker-compose file makes use of environment variables that you can adjust via a local **.env** file. To create your own **.env** file, copy the provided **.env.example** file:

```bash
$ cp .env.example .env
```

Now adjust the contents of this **.env** file to match your desired configuration.

Then build the docker images and launch the containers:

```bash
$ docker-compose build
$ docker-compose up -d
```

Now open your browser at: http://localhost:8080
