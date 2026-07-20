import requests

BASE_URL = "https://climate-api.open-meteo.com/v1/climate"


def run_query(params):
    """Run a request against the Open-Meteo Climate API."""
    response = requests.get(BASE_URL, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def average(values):
    """Return the average of a list, ignoring None values."""
    values = [v for v in values if v is not None]

    if not values:
        return None

    return sum(values) / len(values)


def celsius_to_fahrenheit(temp):
    """Convert Celsius to Fahrenheit."""
    if temp is None:
        return None

    return round((temp * 9 / 5) + 32, 1)


def mm_to_inches(mm):
    """Convert millimeters to inches."""
    if mm is None:
        return None

    return round(mm / 25.4, 1)


def get_climate_data(lat, lon):
    """
    Return 30-year climate averages for a location.
    """

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": "1991-01-01",
        "end_date": "2020-12-31",
        "models": "EC_Earth3P_HR",
        "daily": [
            "temperature_2m_mean",
            "temperature_2m_max",
            "temperature_2m_min",
            "precipitation_sum",
        ],
    }

    daily = run_query(params)["daily"]

    annual_mean_temp = average(daily["temperature_2m_mean"])
    annual_max_temp = average(daily["temperature_2m_max"])
    annual_min_temp = average(daily["temperature_2m_min"])
    annual_precip_mm = sum(
    value for value in daily["precipitation_sum"]
    if value is not None
    )
    years = 30

    average_annual_precip = annual_precip_mm / years

    return {
        "annual_mean_temp_f": celsius_to_fahrenheit(annual_mean_temp),
        "annual_max_temp_f": celsius_to_fahrenheit(annual_max_temp),
        "annual_min_temp_f": celsius_to_fahrenheit(annual_min_temp),
        "annual_precip_inches": mm_to_inches(average_annual_precip),
    }


if __name__ == "__main__":
    from pprint import pprint

    pprint(get_climate_data(40.850998, -75.452016))