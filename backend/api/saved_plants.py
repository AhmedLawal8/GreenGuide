from flask import Blueprint, jsonify
from database.db import db
from database.tables import Plant, SavedPlant, User
from api.auth import require_auth

saved_plants_bp = Blueprint("saved_plants", __name__)


@saved_plants_bp.get("/api/saved-plants")
@require_auth
def list_saved_plants(current_user: User):
    saved = (
        SavedPlant.query
        .filter_by(user_id=current_user.id)
        .order_by(SavedPlant.created_at.desc())
        .all()
    )
    return jsonify({"plants": [s.to_dict() for s in saved]}), 200


@saved_plants_bp.post("/api/plants/<int:plant_id>/save")
@require_auth
def save_plant(plant_id, current_user: User):
    if db.session.get(Plant, plant_id) is None:
        return jsonify({"error": f"Plant {plant_id} not found"}), 404

    existing = SavedPlant.query.filter_by(user_id=current_user.id, plant_id=plant_id).first()
    if existing is not None:
        return jsonify(existing.to_dict()), 200

    saved = SavedPlant(user_id=current_user.id, plant_id=plant_id)
    db.session.add(saved)
    db.session.commit()
    return jsonify(saved.to_dict()), 201


@saved_plants_bp.delete("/api/plants/<int:plant_id>/save")
@require_auth
def unsave_plant(plant_id, current_user: User):
    saved = SavedPlant.query.filter_by(user_id=current_user.id, plant_id=plant_id).first()
    if saved is None:
        return jsonify({"error": "Plant is not saved"}), 404

    db.session.delete(saved)
    db.session.commit()
    return "", 204
