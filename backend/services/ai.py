import os
from google import genai
from services.config import GEMINI_API_KEY

MODEL_NAME     = "gemini-flash-lite-latest"

def build_prompt(plant, location, match_reasons):

    reasons_text = (
        "\n".join(f"- {r}" for r in match_reasons)
        if match_reasons
        else "- No specific match details available"
    )

    return f"""You are a knowledgeable and friendly gardening advisor helping a homeowner \
understand why a plant is a great fit for their property.

Plant: {plant.common_name or plant.scientific_name} ({plant.scientific_name})
Type: {plant.plant_type or "Unknown"}
Hardiness zone rating: {plant.hardiness_zone or "Unknown"}
Sun requirement: {plant.sun_requirement or "Unknown"}
Water requirement: {plant.water_requirement or "Unknown"}
Drought tolerance: {plant.drought_tolerance or "Unknown"}
Soil pH range: {plant.soil_ph_min} - {plant.soil_ph_max}

Site conditions:
- Hardiness zone: {location.get("hardiness_zone", "Unknown")}
- Soil: {location.get("soil_name", "Unknown")} ({location.get("soil_texture", "Unknown")} texture)
- Soil pH: {location.get("soil_ph", "Unknown")}
- Drainage: {location.get("drainage", "Unknown")}
- Annual precipitation: {location.get("annual_precip_inches", "Unknown")} inches
- Average temperature: {location.get("annual_mean_temp_f", "Unknown")}°F
- Soil moisture index: {location.get("soil_moisture_index", "Unknown")}/100

Why this plant matched:
{reasons_text}

Write 2–3 sentences explaining why this plant is a good fit for this homeowner's property. \
Be specific about the site conditions. Mention one practical benefit (e.g. wildlife, low \
maintenance, aesthetics). Keep it conversational and encouraging — no bullet points, no headers."""


def get_plant_explanation(plant, location, match_reasons):

    prompt = build_prompt(plant, location, match_reasons)

    try:
        client  = genai.Client(api_key=GEMINI_API_KEY)
        message = client.models.generate_content(model=MODEL_NAME, contents=prompt)
        return message.text.strip()
    except Exception as e:
        raise RuntimeError(f"Gemini API error: {e}") from e