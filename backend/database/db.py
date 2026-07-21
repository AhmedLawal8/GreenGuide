from flask_sqlalchemy import SQLAlchemy

# This db instance is created here and imported everywhere else.
# It is initialized against the Flask app in app.py via db.init_app(app).
db = SQLAlchemy()


def init_db(app):
    """
    Bind the SQLAlchemy instance to the Flask app and create all tables
    if they don't already exist.

    Call this once in app.py:
        from db.database import init_db
        init_db(app)
    """
    db.init_app(app)

    with app.app_context():
        db.create_all()