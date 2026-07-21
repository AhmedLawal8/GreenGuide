import os
from flask import Flask
from flask_cors import CORS
from database.db import db
from database.tables import User  # noqa: F401 — imported so SQLAlchemy registers the model
from api.recommender import recommendations_bp
from api.auth import auth_bp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "database", "greenguide.db")

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    db.init_app(app)

    with app.app_context():
        db.create_all()

    CORS(app, resources={r"/api/*": {"origins": os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")}})

    app.register_blueprint(recommendations_bp)
    app.register_blueprint(auth_bp)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=int(os.environ.get("PORT", 5001)))