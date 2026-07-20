import geopandas as gpd
from shapely.geometry import Point
from pathlib import Path

# Load once at module level
ZONE_GDF = None
BASE_DIR = Path(__file__).resolve().parent.parent

ZONE_FILE = (
    BASE_DIR /
    "data" /
    "hardiness" /
    "phzm_us_zones_shp_2023.shp"
)

def _load_zones():
    global ZONE_GDF
    if ZONE_GDF is None:
        ZONE_GDF = gpd.read_file(ZONE_FILE)
        # Ensure we're in standard lat/lon CRS
        ZONE_GDF = ZONE_GDF.to_crs("EPSG:4326")
    return ZONE_GDF

def get_hardiness_zone(lat, lon):
    """
    Returns the USDA hardiness zone string (e.g. '6b') for a lat/lon.
    Uses a local shapefile for instant, offline, lookup.
    """
    gdf = _load_zones()
    point = Point(lon, lat)  # Shapely is lon, lat

    match = gdf[gdf.geometry.contains(point)]

    if match.empty:
        raise ValueError(f"No hardiness zone found for ({lat}, {lon}) — may be outside US coverage")

    # The zone column in the USDA shapefile is 'zone' or 'gridcode'
    # gridcode is numeric (e.g. 6 = 6a, 7 = 6b), zone is the string
    return match.iloc[0]["zone"].lower()  # e.g "6b"

print(get_hardiness_zone(40.850998, -75.452016))