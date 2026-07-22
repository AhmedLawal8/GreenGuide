import sys
import os
from concurrent.futures import ThreadPoolExecutor, as_completed # Used to run api calls in parallel so it'll be faster

# Allow imports from the project root when this file is run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.tables import Plant
from services.soil_data import get_soil_data
from services.weather import get_climate_data
from services.hardiness import get_hardiness_zone


# Maps every USDA hardiness zone string to an integer rank so zones can be
# compared numerically.  Higher rank = warmer zone.
# A plant rated "5b" (rank 10) survives in user zone "6b" (rank 12) 
# A plant rated "7a" (rank 13) does NOT survive in user zone "6b" (rank 12) 

ZONE_RANK = {
    "1a": 1,  "1b": 2,
    "2a": 3,  "2b": 4,
    "3a": 5,  "3b": 6,
    "4a": 7,  "4b": 8,
    "5a": 9,  "5b": 10,
    "6a": 11, "6b": 12,
    "7a": 13, "7b": 14,
    "8a": 15, "8b": 16,
    "9a": 17, "9b": 18,
    "10a": 19, "10b": 20,
    "11a": 21, "11b": 22,
    "12a": 23, "12b": 24,
    "13a": 25, "13b": 26,
}


def zone_rank(zone_str):
    """Return integer rank for a zone string, or None if unparseable."""
    if not zone_str:
        return None
    return ZONE_RANK.get(zone_str.strip().lower())


# SSURGO sand/clay/silt percentages -> coarse / medium / fine bucket
# These thresholds are a simplified version of the USDA texture triangle.

def classify_texture(sand, clay, silt):
    """
    Map raw sand/clay/silt percentages to a texture category.
    Returns one of: 'coarse', 'medium', 'fine', or None.
    """
    if sand is None or clay is None:
        return None

    if clay >= 35:
        return "fine"
    if sand >= 70:
        return "coarse"
    return "medium"


def texture_compatible(plant_texture_str, user_texture):
    """
    Check whether the plant's soil_texture field (comma-separated) includes
    the user's classified texture.  If either side is unknown, return True
    (benefit of the doubt - don't hard-filter on missing data).
    """
    if not plant_texture_str or not user_texture:
        return True

    plant_textures = [t.strip().lower() for t in plant_texture_str.split(",")]
    return user_texture.lower() in plant_textures


def format_texture_list(plant_texture_str):
    """Turn a plant's comma-separated soil_texture field into a readable list."""
    return ", ".join(t.strip() for t in plant_texture_str.split(","))

# Rough mapping: annual precipitation inches -> water need bucket.
# Used to check alignment between what a plant needs and what nature provides.
def calculate_moisture_index(precip_inches, sand, clay, organic_matter, drainage):
    """
    Estimate soil moisture availability from 0-100.

    Higher score = soil stays wetter longer.
    """

    # Start from rainfall baseline
    if precip_inches is None:
        score = 50
    else:
        # Normalize rainfall:
        # <20 inches = dry
        # >60 inches = wet
        score = min(max((precip_inches / 60) * 50, 0), 50)

        # shift baseline upward
        score += 25


    # Sand adjustment
    if sand is not None:
        if sand >= 70:
            score -= 20
        elif sand >= 50:
            score -= 10
        elif sand < 20:
            score += 10


    # Clay adjustment
    if clay is not None:
        if clay >= 40:
            score += 20
        elif clay >= 25:
            score += 10


    # Organic matter adjustment
    if organic_matter is not None:
        if organic_matter >= 5:
            score += 15
        elif organic_matter >= 2:
            score += 8
        elif organic_matter < 1:
            score -= 10


    # Drainage adjustment
    drainage_adjustments = {
        "excessively drained": -20,
        "somewhat excessively drained": -15,
        "well drained": -5,
        "moderately well drained": 0,
        "somewhat poorly drained": 10,
        "poorly drained": 20,
        "very poorly drained": 25,
    }

    if drainage:
        adjustment = drainage_adjustments.get(
            drainage.lower(),
            0
        )

        score += adjustment


    return max(0, min(round(score), 100))

#have some overlap for transition
MOISTURE_REQUIREMENTS = {
    "low":    (0,  40),  
    "medium": (35, 70),  
    "high":   (65, 100),  
}

def moisture_compatible(plant_water_requirement, moisture_index):
    """
    Checks if site moisture fits plant preference.
    """

    if not plant_water_requirement or moisture_index is None:
        return None


    bounds = MOISTURE_REQUIREMENTS.get(
        plant_water_requirement.lower()
    )

    if not bounds:
        return None


    minimum, maximum = bounds

    return minimum <= moisture_index <= maximum


def build_profile(lat, lon):
    """
    Fetch soil, climate, and hardiness data concurrently.
    Returns a flat dict representing the site's environmental profile,
    plus a human-readable soil_name and zone string for the API response.

    Raises if any data source fails (callers should handle exceptions).
    """
    results = {}

    # Run all three external calls in parallel - they're independent
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(get_soil_data, lat, lon):    "soil",
            executor.submit(get_climate_data, lat, lon): "climate",
            executor.submit(get_hardiness_zone, lat, lon): "zone",
        }

        for future in as_completed(futures):
            key = futures[future]
            results[key] = future.result()   # re-raises on exception

    soil    = results["soil"]
    climate = results["climate"]
    zone    = results["zone"]   # string like "6b"

    texture = classify_texture(soil.get("sand"), soil.get("clay"), soil.get("silt"))

    return {
        # Location metadata returned to the frontend
        "lat":                  lat,
        "lon":                  lon,
        "hardiness_zone":       zone,
        "organic_matter": soil.get("organic_matter"),
        "soil_name":            soil.get("soil_name"),
        "drainage":             soil.get("drainage"),
        "soil_ph":              soil.get("ph"),
        "soil_texture":         texture,
        "annual_precip_inches": climate.get("annual_precip_inches"),
        "annual_mean_temp_f":   climate.get("annual_mean_temp_f"),
        "annual_min_temp_f":    climate.get("annual_min_temp_f"),
        "annual_max_temp_f":    climate.get("annual_max_temp_f"),

        # Derived values used internally by scoring
        "_zone_rank":           zone_rank(zone),
        "_moisture_index":      calculate_moisture_index(
                                    climate.get("annual_precip_inches"),
                                    soil.get("sand"),
                                    soil.get("clay"),
                                    soil.get("organic_matter"),
                                    soil.get("drainage"),
                                ),
    }


def hard_filter(plants, profile):
    """
    Eliminate plants that definitely cannot survive at this site.
    We only hard-filter on criteria where a mismatch means certain failure.
    Missing data passes through (benefit of the doubt).

    Hard filters:
      - Hardiness zone: plant's minimum zone must be <= user's zone
      - Soil pH: user's pH must be within plant's [ph_min, ph_max]
    """
    user_zone_rank = profile["_zone_rank"]
    user_ph        = profile["soil_ph"]

    survivors = []

    for plant in plants:

        #  Zone check 
        if plant.hardiness_zone and user_zone_rank is not None:
            plant_zone_rank = zone_rank(plant.hardiness_zone)
            if plant_zone_rank is not None and plant_zone_rank > user_zone_rank:
                continue   # plant can't survive this winter

        # pH check 
        if user_ph is not None:
            if plant.soil_ph_min is not None and user_ph < plant.soil_ph_min:
                continue
            if plant.soil_ph_max is not None and user_ph > plant.soil_ph_max:
                continue

        survivors.append(plant)

    return survivors


# Maximum points available (used only for documentation - not normalized here)
#
#   Hardiness zone    25   (survived hard filter; bonus for zone headroom)
#   pH match          20   (how centered the user pH is in plant's range)
#   Soil texture      20   (texture compatibility)
#   Water match       20   (precipitation vs plant water need)
#   Drought tolerance 15   (bonus if site is dry and plant is drought tolerant)
#                    ---
#   Total             100


def score_plant(plant, profile):
    """
    Return (score: int, reasons: list[str]) for a single plant.
    Score is out of 100.  Reasons are human-readable match explanations.
    """
    score   = 0
    reasons = []

    user_zone_rank  = profile["_zone_rank"]
    user_ph         = profile["soil_ph"]
    user_texture    = profile["soil_texture"]
    user_moisture   = profile["_moisture_index"]
    user_precip     = profile["annual_precip_inches"]
    user_zone       = profile["hardiness_zone"]

    # Hardiness zone (25 pts)
    # Already guaranteed plant_zone_rank <= user_zone_rank by hard filter.
    # Award full points if exact zone match, sliding scale for each zone of headroom.
    if plant.hardiness_zone and user_zone_rank is not None:
        plant_zone_rank = zone_rank(plant.hardiness_zone)
        if plant_zone_rank is not None:
            headroom = user_zone_rank - plant_zone_rank   # 0 = exact match
            if headroom == 0:
                score += 25
                reasons.append(
                    f"Rated hardy to zone {plant.hardiness_zone}, exactly matching your zone {user_zone} thus "
                    f"it's built to survive your coldest winter temperatures"
                )
            elif headroom <= 2:
                score += 20
                reasons.append(
                    f"Rated hardy to zone {plant.hardiness_zone}, a bit more cold-tolerant than your zone "
                    f"{user_zone} requires - some cushion against a harsher-than-usual winter"
                )
            else:
                score += 15
                reasons.append(
                    f"Rated hardy to zone {plant.hardiness_zone}, far more cold-tolerant than your zone "
                    f"{user_zone} requires thus winter cold won't be a limiting factor here"
                )
    else:
        # No zone data - award partial credit
        score += 12

    # Soil pH (20 pts)
    if user_ph is not None and plant.soil_ph_min is not None and plant.soil_ph_max is not None:
        ph_range  = plant.soil_ph_max - plant.soil_ph_min
        ph_center = (plant.soil_ph_min + plant.soil_ph_max) / 2
        deviation = abs(user_ph - ph_center)

        if ph_range > 0:
            # Score based on how centered user pH is within the plant's range
            centrality = 1 - (deviation / (ph_range / 2))
            centrality = max(0, min(1, centrality))
        else:
            centrality = 1.0

        ph_score = round(centrality * 20)
        score   += ph_score

        if ph_score >= 16:
            reasons.append(
                f"Your soil pH of {user_ph} sits right in this plant's preferred range of "
                f"{plant.soil_ph_min}-{plant.soil_ph_max}"
            )
        elif ph_score >= 10:
            reasons.append(
                f"Your soil pH of {user_ph} falls within this plant's tolerable range of "
                f"{plant.soil_ph_min}-{plant.soil_ph_max}, though not at the center of it"
            )
        # Low pH score means it barely passed the hard filter

    elif user_ph is None:
        score += 10   # neutral: no data

    # Soil texture (20 pts)
    if texture_compatible(plant.soil_texture, user_texture):
        score += 20
        if user_texture and plant.soil_texture:
            reasons.append(
                f"Your soil's {user_texture} texture matches this plant's preferred soil types "
                f"({format_texture_list(plant.soil_texture)})"
            )
    # Incompatible texture shouldn't reach here (soft penalise only - not a hard filter)
    else:
        score += 5

    # Water / precipitation match (20 pts)
    compat = moisture_compatible(plant.water_requirement, user_moisture)

    if compat is True:
        score += 20
        if user_precip and plant.water_requirement:
            reasons.append(
                f"Your site gets about {user_precip}\" of rain a year, keeping soil moisture around "
                f"{user_moisture}/100 - a good match for this plant's {plant.water_requirement.lower()} water needs"
            )
    elif compat is None:
        score += 10   # neutral: missing data
    else:
        score += 0    # plant needs more water than falls naturally

    # Drought tolerance bonus (15 pts)
    # Extra points when site is dry AND plant handles drought well
    if user_moisture < 35  and plant.drought_tolerance:
        tol = plant.drought_tolerance.lower()
        if tol == "high":
            score += 15
            reasons.append(
                f"Your site runs dry (soil moisture index {user_moisture}/100) and this plant has high "
                f"drought tolerance, so it should handle dry spells with little trouble"
            )
        elif tol == "medium":
            score += 8
            reasons.append(
                f"Your site runs somewhat dry (soil moisture index {user_moisture}/100); this plant's "
                f"moderate drought tolerance should hold up reasonably well between rains"
            )
    elif plant.drought_tolerance and plant.drought_tolerance.lower() == "high":
        score += 5   # small bonus regardless - resilient plants are good
        reasons.append("Naturally drought tolerant, adding extra resilience even in a dry year")

    return score, reasons


# Main entry point

def get_recommendations(lat, lon, limit=20):
    """
    Full recommendation pipeline.

    Args:
        lat:   float - latitude
        lon:   float - longitude
        limit: int   - max plants to return (default 20)

    Returns:
        dict with keys:
            "location": environmental profile dict (for the frontend summary card)
            "plants":   list of scored plant dicts, sorted by score descending

    Raises:
        ValueError  - if environmental data cannot be retrieved
        RuntimeError - if external API calls fail
    """

    # build environmental profile (3 parallel API calls)
    profile = build_profile(lat, lon)

    # load all plants with enough data to be useful
    # pull from DB 
    candidates = (
        Plant.query
        .filter(Plant.hardiness_zone.isnot(None))
        .all()
    )

    # hard filter - eliminate plants that cannot survive
    survivors = hard_filter(candidates, profile)

    # score remaining candidates
    scored = []
    for plant in survivors:
        score, reasons = score_plant(plant, profile)
        scored.append((score, reasons, plant))

    #  sort by score descending, take top N
    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:limit]

    # build response
    location_payload = {
        "lat":                  profile["lat"],
        "lon":                  profile["lon"],
        "hardiness_zone":       profile["hardiness_zone"],
        "annual_precip_inches": profile["annual_precip_inches"],
        "annual_mean_temp_f":   profile["annual_mean_temp_f"],
        "annual_min_temp_f":    profile["annual_min_temp_f"],
        "annual_max_temp_f":    profile["annual_max_temp_f"],
        "soil_name":            profile["soil_name"],
        "soil_ph":              profile["soil_ph"],
        "soil_texture":         profile["soil_texture"],
        "drainage":             profile["drainage"],
        "soil_moisture_index": profile["_moisture_index"],
    }

    plants_payload = []
    for score, reasons, plant in top:
        plants_payload.append({
            "id":               plant.id,
            "common_name":      plant.common_name,
            "scientific_name":  plant.scientific_name,
            "plant_type":       plant.plant_type,
            "image_url":        getattr(plant, "image_url", None),
            "score":            score,
            "hardiness_zone":   plant.hardiness_zone,
            "sun_requirement":  plant.sun_requirement,
            "water_requirement": plant.water_requirement,
            "drought_tolerance": plant.drought_tolerance,
            "duration":         plant.duration,
            "soil_ph_min":      plant.soil_ph_min,
            "soil_ph_max":      plant.soil_ph_max,
            "growth_rate":                     plant.growth_rate,
            "height_at_20_years_maximum_feet":  plant.height_at_20_years_maximum_feet,
            "life_span":                        plant.life_span,
            "fertility_requirement":            plant.fertility_requirement,
            "bloom_period":                     plant.bloom_period,
            "match_reasons":    reasons,
            "ai_summary":       None,   # populated lazily by /api/plants/<id>/explain
        })

    return {
        "location": location_payload,
        "plants":   plants_payload,
    }

if __name__ == "__main__":
    from pprint import pprint
    from app import create_app


    LAT, LON = 40.850998, -75.452016
    app = create_app()

    with app.app_context():
        result = get_recommendations(LAT, LON, limit=10)

        print("\n=== LOCATION PROFILE ===")
        pprint(result["location"])

        print(f"\n=== TOP {len(result['plants'])} PLANTS ===")
        for plant in result["plants"]:
            print(f"\n  [{plant['score']}] {plant['common_name']} ({plant['scientific_name']})")
            print(f"       Type: {plant['plant_type']}  |  Zone: {plant['hardiness_zone']} | Image : {plant['image_url']}")
            print(f"       PH_MIN: {plant['soil_ph_min']}  |  PH_MAX: {plant['soil_ph_max']} + plant_id {plant["id"]}")
            print(f"       Reasons: {plant['match_reasons']}")