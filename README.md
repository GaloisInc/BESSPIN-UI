# BESSPIN Tool Suite UI

*Disclaimer: this UI is under development is considered a
 proof-of-concept towards a prototype. A working docker build can be found in [BESSPIN environment](https://github.com/GaloisInc/BESSPIN-Environment/tree/master/docker/ui)*

The UI provides a single-user, workflow-based interface with which to
interact with the BESSPIN ToolSuite and Testgen systems.

It is comprised main components depicted in the screenshots
above. The components listed below:

## Contents: ##

- [Architecture Extraction](#architecture-extraction): Allows a user to run
  architecture extraction commands and visualize the results.

- [Feature Extraction](#feature-extraction): Allows a user to run
  feature extraction commands and visualize the results.

- [Configurator](#configurator): Allows a user to load a feature model,
  to configure it interactively and to save it in the database.

- [Overview](#overview): Table view of all existing workflows, with buttons to
  intiate actions within that workflow.

- [System Configuration](#configure-system): Allows a user to upload a Nix
  system configuration file as well as edit uploaded files within the browser.

- [Testgen Configuration](#configure-testgen): Allows a user to edit a
  configuration file that customizes the behavior of the testgen system.

- [Vulnerability Configuration](#configure-vulnerability): Allows a user to select
  a given vulnerbility selecting specific CWEs to run.

- [Report Viewer](#build-run): Provides user with a status of the run of a given set of
  tests, displaying a table of successful test scores as well as the ability
  to view the logfile for a given run.

- [Developer's Manual](#developer-manual): Contains information useful for developers.


## Architecture Extraction

The UI supports the main workflows related to Architecture Extraction. It provides UI
elements to edit the main configuration file, buttons to execute commands, and
visualize results. During this interactive process, intermediate states of the session
are stored in a database. The session can be restored from the database so the user
can continue exploring Architecture Extraction.

### Session

To return to a previous session of Architecture Extraction, select a label
associated with a previous session and then clicking on the "Load" button.
As a result it restores the UI the this past state.

To start a new architecture extraction session, select a "CPU template config file"
from the list of prepolulated ones, and use the "Label" textbox by writing a few words
indicating the purpose of this session (the labels are used to differentiate between
sessions). Then click the "New" button and get a config file as a result in the text
editor.

### Edit config file

Edit the config file directly in the text editor and save it by clicking the "Save" button.

### Build

Based on the config file edited in the previous step, the "Build" button
sends a request to execute an architecture extraction command on the server. The
result of this execution is a list of output files stored in the database whose list
is returned to the UI.

### Visualize

Select an output file that resulted from the build step and click on "Visualize" to
visualize the output in the UI page.


## Feature Extraction

The UI supports the main workflows related to Feature Extraction in a similar fashion
as the UI related to Artchitecture Extraction, in particular upto to the "Build" step.

### Build and Simplify

Once the config file has been edited, run the Feature Extraction process by clicking
on the "Build" button. Th execution of this process takes a long time
(15 minutes is not uncommon) and the result is printed in the text editor
under the "Build" button.

It is also possible to *simplify* the feature model extracted during the previous step
by clicking on the "Simplify" button. The result of this process returns a feature
model that is printed in the dedicated text editor under the "Simplify" button.

Both the basic and the simplified feature models can be downloaded by clicking on their
respective "Download" button. The format of this feature model is `.fm.json` which is
not particularly human readable but is intended to be the input of the next step in
the Configurator.


## Configurator

The Configurator UI is a dedicated that can be used to configure any feature model
in BESSPIN. The feature models can be either provided in `.fm.json` format or as a
`.cfr` Clafer file.

Using the "Browse" button, browse your local file system to find a feature model
to configure. By clicking the "Upload model" button, it loads the feature model
and present a graphical representation of the model.

Features in a model can be turned `on`, `off`, or `opt` by simply clicking.
This status of the selection is translated into colors: green, red, or blank,
with various shades based on the history or selection or constraints of the model.

Once the feature selection is ready to be validated, click on the "Validate" button.
This action verifies that the feature selection is valid with respect to the source
model.

At the bottom, two text editors show the source feature model and a text version of
the feature selection after validation.

Click "Download model" to download the configured feature model.


## Overview

The main page for the UI is the overview page which is where management of
workflows happens. At it's core, this page is simply a table listing all
the workflows that have been created, (sorted by creation timestamp with
the most recent at the top).

### Workflow Management

The basic workflow flow available from this page is as follows:

#### Create Workflow

By clicking on the "Create Workflow" button on the overview page, the user is
shown a modal input for defining a user-friendly label to identify the workflow.

Once this is done, a new row is displayed on the overview page which lists the
new workflow label, a date timestamp for the creation of the workflow and a set
of buttons for the actions that need to be taken to configure the workflow for
running a set of tests.

#### Configure System

By clicking on the "System" button a user is taken to the "System Configuration"
screen which allows them to select a Nix configuration file from their local
filesystem to upload. Once added, it can be edited in the UI to make changes.

#### Configure Testgen

By clicking the "Testgen" button for the workflow a user is taken to the "Testgen
Configuration" screen which allows them to initialize the configuration from a
template stored on the server. They can then make edits to that configuration within
the UI.

#### Configure Vulnerability

By clicking the "Vuln" button, the user is taken to the "Vulnerability Configuration"
screen which allows them to select a vulnerability class. They are then shown a graph
of the feature model for that vulnerability class which they can configure by clicking
on nodes in the feature model graph to enable/disable features/CWEs to be tested. There
is a "validate" button to allow them to validate that they are configuring the feature
model correctly.

#### Build-Run

Once all the previous steps are complete, the user can click the "Build/Run" button
which triggers a Nix build of the configured system and a run of the configured tests.
While that is running the button's label will change to "Running" and will then change
to "View" when the tests complete.

Once complete, the view on the screen will display the status of "succeeded" or "failed"
depending upon whether there were errors encountered in building/running. If the run
succeeded, there will be a table of the resulting scores.

There is also a button to view the underlying log file.

Finally, there are placeholders for PPA metrics which are a feature still in development.


## Note on UI

The UI has its own [README.md](./client/README.md) that details its structure

## API documentation

All api routes are prefixed with `/api`. You can access an interactive Swagger UI to explore the API via `http://0.0.0.0:3784/api/doc`

## Developer Manual

The best way to run this application locally is to build the docker images and use them.

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

In addition to this, there is a `.env` file which specifies version information to use
when publishing images. If you do not use this, the images will be tagged with `latest`
(this is the method typically used for building images for local development).

**WARNING** this script takes a long time to run (~20min to build the images
and ~2hr to push them to artifactory). You may want to consider disabling any
settings that automatically put your machine to sleep while this is running.

### Running in Docker

There is an included `docker-compose.yaml` for spinning up a containerized instance of the server and UI:

```
$ docker-compose -f docker-compose.yaml up
```

#### ENV vars

There are a few environment variables that can be set to configure
how the server runs:

 * PORT: the port to expose (this should map to the first port mentioned in the `-p` argument to docker)
 * HOST: the host to run flask on (defaults to `0.0.0.0` so you can access the server within docker)
 * DEBUG: flag to run flask in debug mode (defaults to `True`)

## Architecture

Server side:

- Database
- REST API

Client Side:

- React/Redux UI

![alt text](docs/BESSPIN-UI-architecture.png "BESSPIN UI Architecture")

### Data Model

The API backing the BESSPIN UI uses the following data model:

![BESSPIN Data Model](docs/Data-Model.svg)

#### Key Concepts

##### Workflows

The basic unit for the UI is the `workflow` which is used to represent the steps needed to run a set of
tests against a given system configuration. A workflow simply consists of a `label` to allow for easy
identification by users, along with created and updated timestamps.

##### System Configuration

All tests need to run against a given system configuration. This consists of a `Nix` configuration file
that the user can upload, then edit within the UI. It too has a `label` as a user convenience.

##### Testgen Configuration

Testgen needs to be configured to control its runtime behavior which is reflected in the `.ini`
file used for running tests. There is a template configuration file that is used to initialize
the configuration and then the user is able to edit that configuration via the UI. Again, this
model supports a `label` property.

##### Vulnerability Configuration

The actual tests run against the configured system are determined by the vulnerability feature
model created for the test-run. Once a user selects the vulnerability class to test, they are
given a graph of the feature model and visually edit the features/CWEs that should be tested

##### Jobs

Once inputs are gathered, they are expected to be used to run a job within nix to generated the corresponding artifact. To that end, a job is expected to be comprised of:

 - some status (e.g. "running", "succeeded", "failed")
 - a pointer to the inputs record configuring the job
 - a path to a log of the nix command output
 - a list of test score results (CWE, score, notes)

Given that there are jobs for most of the top-level inputs, there is a "jobs" super-type table and sub-types for each of the specific inputs. It is expected that each unique combination of inputs will correspond to exactly one successful job run, but that is a requirement that the API layer must enforce.

