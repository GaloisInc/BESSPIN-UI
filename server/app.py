"""
BESSPIN UI web app server
"""
from app import create_app
from config import Config

app = create_app()

if __name__ == '__main__':
    port = Config.PORT
    debug = Config.DEBUG
    host = Config.HOST
    app.run(host, port, debug)
