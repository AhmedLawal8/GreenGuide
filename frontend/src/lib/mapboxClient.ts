import mapboxgl from "mapbox-gl";

export const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

export const isMapboxTokenConfigured =
  mapboxToken.length > 0 && mapboxToken !== "your-mapbox-access-token-here";

if (isMapboxTokenConfigured) {
  mapboxgl.accessToken = mapboxToken;
}
