from flask import Flask
from config import config


def create_app(config_name=None):
    app = Flask(__name__)
    config_obj = config[config_name or 'default']
    app.config.from_object(config_obj)

    if not app.config['TESTING']:
        app.logger.debug(f"Using database({app.config['DATABASE']})")

    from .models import db
    db.init_app(app)
    from .models import migrate
    migrate.init_app(app, db)

    from app.api import blueprint as api
    app.register_blueprint(api, url_prefix='/api')

    from app.ui.routes import ui_routes
    app.register_blueprint(ui_routes)

    from commands import test_cli_bp
    app.register_blueprint(test_cli_bp)

    return app
