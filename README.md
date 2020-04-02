# BESSPIN UI

![alt text](docs/screenshot_UI.png "Screenshot UI")

*Disclaimer: this UI is under development is considered a
 proof-of-concept towards a prototype.*

The UI is made of several main components depicted in the screenshots
above. The components listed below:

- Overview: tables summarizing the CPUs configured, the tests
  configured, the build processes and the results of testing CPUs.

- CPU Configurator: UI to configure and explore the configuration of
  CPUs.

- Tests Configurator: UI to configure and explore the configuration of
  Tests.

- Pipeline: views and controls of build processes for CPUs, Tests
  and running tests against CPUs.

- Dashboard: views, visualizations and controls related to the CPUs
  tests and results.

These components are accessible from the sidebar of the UI.

## Configurator UI

A common UI is used for configuring both CPUs and tests. The current
features of the configurator are:

- *Load a new feature model*: from the local filesystem. The supported
  formats for feature models are Clafer files `.cfr` or fm-json format
  `.fm.json`. Some examples of feature models are provided in the
  `examples` folder.

- *Model visualization*: A model is translated into a graphical
   tree-like structure where every feature is represented as a node
   and indicating its selection.

- *Feature selection by clicking*: Features in a model can be turned
  `on`, `off`, or `opt` by simply clicking.  This status of the
  selection is translated into colors: green, red, or blank, with
  various shades based on the history or selection or constraints of
  the model.

- *Validate configurations*: A button is provided to validate the
  current feature selection. This is done by the backend -- it
  validates the feature selection and returns an updated feature model.

- *Download configured model*: button to download the configured model
  (model + constraints) into the filesystem of the client.


- *Continue configuring feature model*. When a model is already in the
   system and to change the set of features selected, click on
   "Overview" in the sidebar and select the model to configure.

### Note on UI

The UI has it's own [README.md](./client/README.md) that details it's structure

## Configurator API

All api routes are prefixed with `/api`. You can access an interactive Swagger UI to explore the API via `http://0.0.0.0:3784/api/doc`

### Running locally

The best way to run this application locally is to run the following commant:

```
$ TOKEN_NAME='<<NAME OF YOUR GITLAB ACCESS TOKEN>>' PRIVATE_TOKEN='<<VALUE OF YOUR TOKEN>>' docker-compose up
```

This will run the API/UI server locally on your machine using docker and docker-compose. It should show log output from both applications.

#### Stopping the server

You should be able to simply hit `Ctrl-C` to quit the servers. To fully shut down the docker containers, issue the command:

```
$ docker-compose down
```

#### Customizing the clafer version used

It is also possible to indicate a specific version of Clafer to use, by
setting the environment variable `BESSPIN_CLAFER`:

```
BESSPIN_CLAFER=<path-to-clafer> TOKEN_NAME='<<GITLAB ACCESS TOKEN NAME>> ' PRIVATE_TOKEN='<<GITLAB TOKEN>>' docker-compose up
```

The UI is accessible at the url:
```
http://localhost:3784/
```

### Build/Publish Docker image

Built images are published to Artifactory. In order to build/publish images,
there is a helper script (`./scripts/publish-docker-images.sh`) which you
use to tag/build/publish all the necessary images. This file depends upon
an ENV file (`./scripts/production.env`) which you set up with the necessary
environmental variables. Use `./scripts/sample.env` as your template. It
requires the following variables to be defined:

- `TOKEN_NAME` for the name of the personal access token
- `PRIVATE_TOKEN` the private token value
- `BINCACHE_LOGIN` for the artifactory username
- `BINCACHE_APIKEY` the api token to use

**WARNING** this script takes a long time to run (~20min to build the images
and ~2hr to push them to artifactory). You may want to consider disabling any
settings that automatically put your machine to sleep while this is running.

### Running in Docker

There is an included `docker-compose` for spinning up a containerized instance of the server and UI:

```
$ docker-compose up
```

#### ENV vars

There are a few environment variables that can be set to configure
how the server runs:

 * PORT: the port to expose (this should map to the first port mentioned in the `-p` argument to docker)
 * HOST: the host to run flask on (defaults to `0.0.0.0` so you can access the server within docker)
 * DEBUG: flag to run flask in debug mode (defaults to `True`)

### Build Docker with toolsuite

The build of the toolsuite follows the one of the basic Docker image and
it starts by creating a toolsuite image given 4 environment variables:

  * `BINCACHE_LOGIN`: artifactory login
  * `BINCACHE_APIKEY`: artifactory apikey
  * `TOKEN_NAME`: gitlab token name
  * `PRIVATE_TOKEN`: gitlab private token associated with the token name

Provide these parameters as environment variables into the following
`docker build` command.
(NOTE: this build can take between 30 minutes to 2 hours depending on state of binary cache)
```
docker build -f Dockerfile-toolsuite \
  --build-arg BINCACHE_LOGIN=$ARTIFACTORY_LOGIN \
  --build-arg BINCACHE_APIKEY="$(cat ~/.ssh/artifactory_api_key)" \
  --build-arg TOKEN_NAME=$GITLAB_PERSO_ACCESS_TOKEN \
  --build-arg PRIVATE_TOKEN="$(cat $GITLAB_PERSO_ACCESS_TOKEN_PATH)" \
  -t besspin-toolsuite-image .
```

This will produce a `besspin-toolsuite-image` that will be used as a base
image for building the server image. Use the file`docker-compose-toolsuite.yaml`
to build the client and server images:
```
TOKEN_NAME=$GITLAB_PERSO_ACCESS_TOKEN_NAME \
PRIVATE_TOKEN="$(cat $GITLAB_PERSO_ACCESS_TOKEN_PATH)" \
docker-compose -f docker-compose-toolsuite.yaml build
```

To start and stop the app do the usual docker-compose commands:
```
docker-compose -f docker-compose-toolsuite.yaml up
docker-compose -f docker-compose-toolsuite.yaml dowm
```

## Architecture

Server side:

- Database
- Configurator
- REST API

Client Side:
- Overview UI
- Configurator UI for CPUs and Tests
- Pipeline UI
- Dashboard UI

![alt text](docs/BESSPIN-UI-architecture.png "BESSPIN UI Architecture")

### Data Model

The API backing the BESSPIN UI uses the following data model:

![BESSPIN Data Model](docs/Data-Model.svg)

#### Key Concepts

The data model separates out the notion of "inputs" and "jobs". The inputs are settings used to configure a job which is then run within nix. All of the top-level tables support additional meta-data, specifically user-generated labels, and datetime stamps to track when it was created as well as updated.

##### Inputs

Inputs are expected primarily to be pointers to versioned resources. More specifically, they are expected to be URLs to GitLab resources. For this, we have a notion of a "versioned resource" which consists of a URL and a version identifier.

In some cases (particularly vulnerability and system configurations), there is an expectation of text-based information (a LANDO spec in the case of vulnerabilities and a nix-config in the case of system configurations).

##### Jobs

Once inputs are gathered, they are expected to be used to run a job within nix to generated the corresponding artifact. To that end, a job is expected to be comprised of:

 - some status (e.g. "running", "succeeded", "failed")
 - a pointer to the inputs record configuring the job
 - a path to a nix derivation file describing the top-level inputs/outputs for the nix build the job will invoke
 - a path to a log of the nix command output
 - a path to the nix store directory containing the actual generated artifact(s) from the job

Given that there are jobs for most of the top-level inputs, there is a "jobs" super-type table and sub-types for each of the specific inputs. It is expected that each unique combination of inputs will correspond to exactly one successful job run, but that is a requirement that the API layer must enforce.

