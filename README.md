# BESSPIN UI

![alt text](images/screenshot_UI.png "Screenshot UI")

The UI consists of several components:

- Dashboard: a table visualization of models currently entered into
  the system. Each model has hyperlinks available to other parts of
  the UI described below.

- Configurator: this component is the UI to configure and explore the
  configuration of models.

- Monitor: provides a visualization and commands related to the
  testing pipeline for models

- Metrics: provides a visualization and commands related to the
  evaluation of models


## Configurator UI

The Configurator UI has some features listed below:

- *Load a new feature model*: from the local file system. The file is
  parsed using Clafer in the backend and then displayed to the user in
  a graphical tree-like structure. Some examples of feature models are
  provided in the `examples` folder.

- *Continue configuring feature model*. Choose a model from the list
   of models previously entered in the system and continue exploring
   and exploring their configuration.

- *Model visualization*: A model is translated into a graphical
   tree-like structure -- *configuration tree* -- with nodes
   representing features and indicating possible feature
   configurations.

- *Select features by clicking*: It is possible to `select`, explicit
  ly `unselected`, or leave as `unconfigured` the features of a model.
  The status of the features is translated into color, green for
  selected, red for unselected and blank for unconfigured. A set of
  convenience buttons are provided to facilitate the selection.

- *Validate configurations*: once a round of feature selection is
  done, process the selection by clicking the button. The backend
  analyzes the selection and returns the model, validating the feature
  selection and returning a new configuration tree.

- *Download configured model*: by clicking on the button, save the
  configured model (model + constraints) to a filesystem.


## Requirements

- python3
- pip3
- `flask`, a Restful microframework:
```
pip3 install flask
```
- `clafer` version 0.5
- web browser, tested with Chrome and Firefox.

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

## Architecture

Server side:

- Database
- Configurator
- REST API

Client Side:
- Overview UI
- Configurator UI
- Dashboard UI

![alt text](images/BESSPIN-UI-architecture.png "BESSPIN UI Architecture")

# Future work

- integrate a configurator algorithm
- enhance user interactions to facilitate exploration of feature selections
