from flask import Flask
from database.db import init_db

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/greenguide.db"
init_db(app)