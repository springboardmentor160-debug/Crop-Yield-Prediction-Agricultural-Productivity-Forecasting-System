"""
YieldSense AI backend -- application entry point.

Run this file directly to start the dev server:
    python app.py

STATUS (Step 2): foundation only.
    - Flask app + config
    - CORS enabled for the Vite frontend
    - SQLite database created (empty -- no tables yet, that's Step 3)
    - GET /api/health
    - Clean JSON error handlers

No blueprints are registered yet on purpose -- routes/*.py currently only
contain placeholder Blueprint objects with no routes. Each later step will
add real routes to one of those files, then this file gets ONE new line
inside register_blueprints() to wire it up. That's the only place app.py
should need to change going forward.
"""

import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from models.database import db

# Load values from backend/.env (see .env.example for what's expected).
# If .env doesn't exist yet, sensible defaults below are used instead.
load_dotenv()


def create_app():
    app = Flask(__name__)

    # ---- Configuration ----
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL", "sqlite:///yieldsense.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-me")

    # ---- Extensions ----
    db.init_app(app)

    # Only allow the React dev server to call /api/* during local development.
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    CORS(app, resources={r"/api/*": {"origins": frontend_origin}})

    register_blueprints(app)
    register_error_handlers(app)
    register_health_check(app)

    # Creates yieldsense.db and any tables defined on `db.Model` subclasses.
    # Right now there are no models yet, so this just creates an empty
    # database file -- Step 3 adds the User model.
    with app.app_context():
        db.create_all()

    return app


def register_blueprints(app):
    """
    Wire up route blueprints here as each one is implemented.
    Nothing is registered yet in Step 2 -- routes/*.py are placeholders.

    Step 3 example:
        from routes.auth import auth_bp
        app.register_blueprint(auth_bp, url_prefix="/api/auth")
    """
    pass


def register_health_check(app):
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "success": True,
            "message": "YieldSense AI backend is running"
        }), 200


def register_error_handlers(app):
    """Make sure errors come back as JSON, not Flask's default HTML pages."""

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"success": False, "message": "Method not allowed"}), 405

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"success": False, "message": "Internal server error"}), 500


app = create_app()

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)