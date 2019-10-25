# BESSPIN UI

![alt text](images/screenshot_UI.png "Screenshot UI")

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

## Requirements

- `python3`
- `pip3`
- `flask`, restful APIs framework:
```
pip3 install flask
```
- `clafer` version 0.5, with fm-json
- web browser: Chrome or Firefox.

## Start the configurator

To start the feature model configurator, first start the web server:
```
python3 server_flask.py
```

It is also possible to indicate a specific version of Clafer to use, by
setting the environment variable `BESSPIN_CLAFER`:

```
BESSPIN_CLAFER=<path-to-clafer> python3 server_flask.py
```

The UI is accessible at the url:
```
http://localhost:3784/
```

### Build Docker image

To build the docker image, you need to provide some `personal access
token` credentials to access the gitlab repos. This is done by
providing the environment variables to the docker `docker build`
command:

- `TOKEN_NAME` for the name of the personal access token
- `PRIVATE_TOKEN` the private token value

```
docker build -f Dockerfile --build-arg TOKEN_NAME=$GITLAB_PERSO_ACCESS_TOKEN_NAME --build-arg PRIVATE_TOKEN="$(cat $GITLAB_PERSO_ACCESS_TOKEN_PATH)" -t besspin-ui .
```

### Running in Docker

There is an included `Dockerfile` for spinning up a containerized instance:

```
$ docker run -it --rm -p3784:3784 --name besspin-ui galois:besspin-ui
```

*NOTE:* you need to run with the host `0.0.0.0` in order for Docker to be
able to expose the service externally.

#### ENV vars

There are a few environment variables that can be set to configure how it runs:

 * PORT: the port to expose (this should map to the first port mentioned in the `-p` argument to docker)
 * HOST: the host to run flask on (defaults to `0.0.0.0` so you can access the server within docker)
 * DEBUG: flag to run flask in debug mode (defaults to `True`)

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

![alt text](images/BESSPIN-UI-architecture.png "BESSPIN UI Architecture")
