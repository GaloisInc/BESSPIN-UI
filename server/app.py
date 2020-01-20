"""
BESSPIN UI web app server
"""
import os
from app import create_app

config_name = os.getenv('FLASK_CONFIG') or 'default'

app = create_app(config_name)

if __name__ == '__main__':
    port = app.config['PORT']
    debug = app.config['DEBUG']
    host = app.config['HOST']
    app.run(host, port, debug)
