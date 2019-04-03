# Feature Model Configurator UI


## Requirements

- python3
- pip3
- The `flask` web server:
```
pip3 install flask
```
- a web browser

## Running the configurator

To start the feature model configurator, first start the web server:
using one of the following command:

```
python3 server_flask.py
BESSPIN_CLAFER=<path>/clafer  python3 server_flask.py
```

The second command is to indicate a specfic version of `clafer`,
otherwise it will use whatever version of clafer is in the `PATH`.

User starts the UI by going to:
```
http://localhost:3784/
```
