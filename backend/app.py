import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from api.admin_reporting import admin_bp
from api.appointments import appointments_bp
from api.auth import auth_bp
from api.notifications import notifications_bp
from api.patients import patients_bp
from api.queue import queue_bp
from utils.error_handler import error_response

load_dotenv()


def create_app():
    app = Flask(__name__)

    cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
    cors_origins = [o.strip() for o in cors_origins_raw.split(",") if o.strip()]
    CORS(app, origins=cors_origins, supports_credentials=True)

    app.url_map.strict_slashes = False

    app.register_blueprint(auth_bp)
    app.register_blueprint(patients_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(queue_bp)

    @app.errorhandler(404)
    def not_found(e):
        return error_response("The requested resource was not found", "NOT_FOUND", 404)

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response("Method not allowed", "METHOD_NOT_ALLOWED", 405)

    @app.errorhandler(500)
    def internal_error(e):
        return error_response("An internal server error occurred", "SERVER_ERROR", 500)

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "8000"))
    debug = os.getenv("FLASK_ENV", "production") == "development"
    app.run(port=port, debug=debug)
