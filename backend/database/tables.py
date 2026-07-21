from database.db import db


class Plant(db.Model):
    __tablename__ = "plants"

    id                = db.Column(db.Integer, primary_key=True, autoincrement=True)
    symbol            = db.Column(db.String,  nullable=True,  index=True)
    scientific_name   = db.Column(db.String,  nullable=False, index=True)
    common_name       = db.Column(db.String,  nullable=True,  index=True)
    plant_type        = db.Column(db.String,  nullable=True,  index=True)  # Tree | Shrub | Forb/Herb | Grass | Vine
    duration          = db.Column(db.String,  nullable=True)               # Annual | Perennial | Biennial
    hardiness_zone    = db.Column(db.String,  nullable=True,  index=True)  # e.g. "6b"
    sun_requirement   = db.Column(db.String,  nullable=True,  index=True)  # full sun | partial shade | full shade
    water_requirement = db.Column(db.String,  nullable=True)               # Low | Medium | High
    soil_texture      = db.Column(db.String,  nullable=True)               # coarse | medium | fine (comma-separated)
    soil_ph_min       = db.Column(db.Float,   nullable=True)
    soil_ph_max       = db.Column(db.Float,   nullable=True)
    drought_tolerance = db.Column(db.String,  nullable=True,  index=True)  # None | Low | Medium | High
    image_url         = db.Column(db.String, nullable=True)

    def to_dict(self):
        return {
            "id":                self.id,
            "symbol":            self.symbol,
            "scientific_name":   self.scientific_name,
            "common_name":       self.common_name,
            "plant_type":        self.plant_type,
            "duration":          self.duration,
            "hardiness_zone":    self.hardiness_zone,
            "sun_requirement":   self.sun_requirement,
            "water_requirement": self.water_requirement,
            "soil_texture":      self.soil_texture,
            "soil_ph_min":       self.soil_ph_min,
            "soil_ph_max":       self.soil_ph_max,
            "drought_tolerance": self.drought_tolerance,
            "image_url": self.image_url,
        }

    def __repr__(self):
        return f"<Plant {self.symbol} — {self.common_name}>"