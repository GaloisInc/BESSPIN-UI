from flask import Flask

from config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    from .models import db
    db.init_app(app)
    from .models import migrate
    migrate.init_app(app, db)

    from app.api import blueprint as api
    app.register_blueprint(api, url_prefix='/api')

    from app.ui.routes import ui_routes
    app.register_blueprint(ui_routes)

    return app
