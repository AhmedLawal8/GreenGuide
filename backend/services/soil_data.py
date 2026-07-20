import requests

# Official USDA API to query for soil data
BASE_URL = "https://sdmdataaccess.sc.egov.usda.gov/Tabular/post.rest"

# Helper function to run queries 
def run_query(query):
    """Run SQL query against USDA Soil Data Access."""

    response = requests.post(
        BASE_URL,
        data={
            "query": query,
            "format": "JSON"
        },
        timeout=30 
    )

    response.raise_for_status()

    data = response.json()

    if "Table" not in data:
        raise RuntimeError(data)

    return data["Table"]

# Given the latitude and longitude get the "mukey" (soil location in db)
def get_mapunit(lat, lon):
    """
    Find USDA soil map unit at a coordinate.
    """
    #Switch lat and lon since wkt coordinates are written as (longisude, latitude)
    point = f"POINT({lon} {lat})"

    query = f"""
    SELECT mukey
    FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('{point}')
    """

    rows = run_query(query)

    if not rows:
        raise ValueError("No soil found")

    #Return mukey
    return rows[0][0]

#Get the dominant soil component given mukey (soil location) 
def get_component(mukey):
    """
    Get dominant soil component.
    """

    #comppct_r details the component percentage for that soil location.
    query = f"""
    SELECT TOP 1

        cokey,
        compname,
        drainagecl

    FROM component

    WHERE mukey = '{mukey}'

    ORDER BY comppct_r DESC
    """

    rows = run_query(query)

    if not rows:
        raise ValueError("No component found")

    return rows[0]

# Get the specific soil detail using the component
def get_horizons(cokey):
    """
    Get top 3 soil layers.
    """

    query = f"""
    SELECT TOP 3

        hzdept_r,
        hzdepb_r,

        sandtotal_r,
        claytotal_r,
        silttotal_r,

        ph1to1h2o_r,
        om_r

    FROM chorizon

    WHERE cokey = '{cokey}'

    ORDER BY hzdept_r
    """

    return run_query(query)

# Helper used to retrieve the first avaliable information for the soil data given 3 layers fromg get_horizons()
def first_available(horizons, index):
    """
    Find first non-null value.
    """

    for row in horizons:

        value = row[index]

        if value is not None:
            return value

    return None


def get_soil_data(lat, lon):

    mukey = get_mapunit(lat, lon)

    component = get_component(mukey)

    horizons = get_horizons(component[0])

    return {

        "mukey": mukey,

        "soil_name": component[1],

        "drainage": component[2],

        "sand": first_available(horizons, 2),

        "clay": first_available(horizons, 3),

        "silt": first_available(horizons, 4),

        "ph": first_available(horizons, 5),

        "organic_matter": first_available(horizons, 6),

        "layers_checked": len(horizons)
    }

#Test
if __name__ == "__main__":

    soil = get_soil_data(
        40.850998, -75.452016
    )

    print(soil)