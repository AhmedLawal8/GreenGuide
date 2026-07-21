from flask_sqlalchemy import SQLAlchemy

# This db instance is created here and imported everywhere else.
# It is initialized against the Flask app in app.py via db.init_app(app).
db = SQLAlchemy()
