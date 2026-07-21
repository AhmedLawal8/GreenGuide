import os
from flask import Flask
from flask_cors import CORS
from database.db import db
from api.recommender import recommendations_bp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, "database", "greenguide.db")

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_PATH}"
    db.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")}})

    app.register_blueprint(recommendations_bp)
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=int(os.environ.get("PORT", 5001)))