from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from services.recommendation import get_recommendations
from database.tables import Plant
from services.ai import get_plant_explanation

recommendations_bp = Blueprint("recommendations", __name__)

# GET /api/recommendations 

@recommendations_bp.get("/api/recommendations")
def recommend():
    """
    Query params:
        lat   (float, required)
        lon   (float, required)
        limit (int,   optional, default 20)
    """

    # --- parse & validate params ---
    lat_raw = request.args.get("lat")
    lon_raw = request.args.get("lon")

    if lat_raw is None or lon_raw is None:
        return jsonify({"error": "lat and lon are required query parameters"}), 400

    try:
        lat = float(lat_raw)
        lon = float(lon_raw)
    except ValueError:
        return jsonify({"error": "lat and lon must be valid numbers"}), 400

    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        return jsonify({"error": "lat must be -90..90 and lon must be -180..180"}), 400

    try:
        limit = int(request.args.get("limit", 20))
        limit = max(1, min(limit, 40))   # clamp to reasonable range
    except ValueError:
        return jsonify({"error": "limit must be an integer"}), 400

    # --- run pipeline ---
    try:
        result = get_recommendations(lat, lon, limit=limit)
    except ValueError as e:
        # Environmental data not available for this coordinate (e.g. outside US)
        return jsonify({"error": str(e)}), 422
    except RuntimeError as e:
        # Upstream API failure
        return jsonify({"error": f"Data source unavailable: {e}"}), 502

    return jsonify(result), 200


# GET /api/plants/search
@recommendations_bp.get("/api/plants/search")
def search_plants():
    """
    Query params:
        q     (string, required) - substring matched against common/scientific name
        limit (int,    optional, default 20)
    """

    query = (request.args.get("q") or "").strip()
    if not query:
        return jsonify({"plants": []}), 200

    try:
        limit = int(request.args.get("limit", 20))
        limit = max(1, min(limit, 40))
    except ValueError:
        return jsonify({"error": "limit must be an integer"}), 400

    like = f"%{query}%"
    plants = (
        Plant.query
        .filter(or_(Plant.common_name.ilike(like), Plant.scientific_name.ilike(like)))
        .order_by(Plant.common_name)
        .limit(limit)
        .all()
    )

    plants_payload = [
        {
            "id":               plant.id,
            "common_name":      plant.common_name,
            "scientific_name":  plant.scientific_name,
            "plant_type":       plant.plant_type,
            "image_url":        plant.image_url,
            "score":            None,
            "hardiness_zone":   plant.hardiness_zone,
            "sun_requirement":  plant.sun_requirement,
            "water_requirement": plant.water_requirement,
            "drought_tolerance": plant.drought_tolerance,
            "duration":         plant.duration,
            "soil_ph_min":      plant.soil_ph_min,
            "soil_ph_max":      plant.soil_ph_max,
            "match_reasons":    [],
            "ai_summary":       None,
        }
        for plant in plants
    ]

    return jsonify({"plants": plants_payload}), 200


# POST /api/plants/<id>/explain
@recommendations_bp.post("/api/plants/<int:plant_id>/explain")
def explain(plant_id):
    plant = Plant.query.get(plant_id)
    if plant is None:
        return jsonify({"error": f"Plant {plant_id} not found"}), 404
 
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400
 
    location      = body.get("location", {})
    match_reasons = body.get("match_reasons", [])
 
    if not location:
        return jsonify({"error": "'location' object is required in request body"}), 400
 
    try:
        ai_summary = get_plant_explanation(plant, location, match_reasons)
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 502
 
    return jsonify({"plant_id": plant_id, "ai_summary": ai_summary}), 200