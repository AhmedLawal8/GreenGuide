"""
migrate.py
----------
One-time script. Reads the raw USDA data from plants.db, transforms it,
and populates greenguide.db through the SQLAlchemy ORM.

Run from the project root:
    python db/migrate.py

plants.db must be present in the db/ folder before running.
greenguide.db will be created (or overwritten) in the db/ folder.
"""

import sys
import os
import sqlite3
import time
import requests

# Allow imports from the project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from flask import Flask
from database.db import db, init_db
from database.models import Plant

# Hardiness zone lookup - full USDA scale including a/b sub-zones
ZONE_MAP = [
    (-999, -55,  "1a"),
    ( -55, -50,  "1b"),
    ( -50, -45,  "2a"),
    ( -45, -40,  "2b"),
    ( -40, -35,  "3a"),
    ( -35, -30,  "3b"),
    ( -30, -25,  "4a"),
    ( -25, -20,  "4b"),
    ( -20, -15,  "5a"),
    ( -15, -10,  "5b"),
    ( -10,  -5,  "6a"),
    (  -5,   0,  "6b"),
    (   0,   5,  "7a"),
    (   5,  10,  "7b"),
    (  10,  15,  "8a"),
    (  15,  20,  "8b"),
    (  20,  25,  "9a"),
    (  25,  30,  "9b"),
    (  30,  35,  "10a"),
    (  35,  40,  "10b"),
    (  40,  45,  "11a"),
    (  45,  50,  "11b"),
    (  50,  55,  "12a"),
    (  55,  60,  "12b"),
    (  60,  65,  "13a"),
    (  65, 999,  "13b"),
]


def temp_to_zone(temp_f):
    if temp_f is None:
        return None
    temp_f = float(temp_f)
    for low, high, label in ZONE_MAP:
        if low <= temp_f < high:
            return label
    return None


# Transformations

SHADE_TO_SUN = {
    "intolerant":   "full sun",
    "intermediate": "partial shade",
    "tolerant":     "full shade",
}

def shade_to_sun(shade_tolerance):
    if shade_tolerance is None:
        return None
    return SHADE_TO_SUN.get(shade_tolerance.lower(), shade_tolerance.lower())


def build_soil_texture(coarse, fine, medium):
    parts = []
    if coarse == "Yes":
        parts.append("coarse")
    if medium == "Yes":
        parts.append("medium")
    if fine == "Yes":
        parts.append("fine")
    return ", ".join(parts) if parts else None



# Migration


DB_DIR  = os.path.dirname(__file__)
SRC_DB  = os.path.join(DB_DIR, "plants.db")
DST_DB  = os.path.join(DB_DIR, "greenguide.db")


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"]        = f"sqlite:///{DST_DB}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    init_db(app)
    return app


def fetch_source_rows():
    if not os.path.exists(SRC_DB):
        sys.exit(f"[error] plants.db not found at {SRC_DB}")

    print(f"[info] Reading source: {SRC_DB}")
    conn = sqlite3.connect(SRC_DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("""
        SELECT
            p.symbol,
            p.scientific_name,
            p.common_name,
            p.growth_habits,
            p.durations,
            p.profile_image_url,
            c.temperature_minimum_f,
            c.shade_tolerance,
            c.moisture_use,
            c.adapted_to_coarse_textured_soils,
            c.adapted_to_fine_textured_soils,
            c.adapted_to_medium_textured_soils,
            c.ph_minimum,
            c.ph_maximum,
            c.drought_tolerance
        FROM plants p
        JOIN plant_characteristics c ON c.plant_id = p.id
        WHERE p.scientific_name IS NOT NULL
          AND p.scientific_name != ''
          AND (
            (c.temperature_minimum_f IS NOT NULL) +
            (c.shade_tolerance IS NOT NULL) +
            (c.moisture_use IS NOT NULL) +
            (c.ph_minimum IS NOT NULL) +
            (c.ph_maximum IS NOT NULL) +
            (c.drought_tolerance IS NOT NULL)
          ) >= 4
        ORDER BY p.scientific_name
    """)

    rows = cur.fetchall()
    conn.close()
    print(f"[info] {len(rows):,} rows fetched from source")
    return rows

import re

def clean_scientific_name(name):
    """Strip HTML italic tags and author suffixes from scientific names.
    '<i>Arnica fulgens</i> Pursh' -> 'Arnica fulgens'
    """
    if name is None:
        return None
    # Extract just the text inside <i>...</i> if present
    match = re.search(r"<i>(.*?)</i>", name, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    # No tags - strip any trailing author suffix (capitalized word(s) after the species epithet)
    return name.strip()

def run_migration():
    app = create_app()

    with app.app_context():
        # Wipe existing data so re-runs are safe
        Plant.query.delete()
        db.session.commit()
        print("[info] Cleared existing plants table")

        rows = fetch_source_rows()

        inserted = 0
        skipped  = 0
        batch    = []
        BATCH_SIZE = 500

        for row in rows:
            try:
                plant = Plant(
                    symbol            = row["symbol"],
                    scientific_name = clean_scientific_name(row["scientific_name"]),
                    common_name       = row["common_name"],
                    plant_type        = row["growth_habits"],
                    duration          = row["durations"],
                    hardiness_zone    = temp_to_zone(row["temperature_minimum_f"]),
                    sun_requirement   = shade_to_sun(row["shade_tolerance"]),
                    water_requirement = row["moisture_use"],
                    soil_texture      = build_soil_texture(
                                            row["adapted_to_coarse_textured_soils"],
                                            row["adapted_to_fine_textured_soils"],
                                            row["adapted_to_medium_textured_soils"],
                                        ),
                    soil_ph_min       = row["ph_minimum"],
                    soil_ph_max       = row["ph_maximum"],
                    drought_tolerance = row["drought_tolerance"],
                    image_url         = row["profile_image_url"],
                )
                batch.append(plant)
                inserted += 1

                if len(batch) >= BATCH_SIZE:
                    db.session.bulk_save_objects(batch)
                    db.session.commit()
                    batch = []
                    print(f"  [info] {inserted:,} rows inserted …")

            except Exception as e:
                skipped += 1
                if skipped <= 5:
                    print(f"  [skip] {row['scientific_name']}: {e}")

        # Flush remaining
        if batch:
            db.session.bulk_save_objects(batch)
            db.session.commit()

        print(f"\n[done] Inserted {inserted:,} rows, skipped {skipped}")
        print(f"[done] greenguide.db written to {DST_DB}")
        print_sample(app)


def print_sample(app):
    with app.app_context():
        total = Plant.query.count()
        sample = (
            Plant.query
            .filter(Plant.hardiness_zone.isnot(None))
            .limit(5)
            .all()
        )
        print(f"\n--- Sample ({total:,} total plants) ---")
        for p in sample:
            print(p.to_dict())


if __name__ == "__main__":
    run_migration()