import type { Location } from "../types/location";
import { mapboxToken } from "./mapboxClient";

export class GeocodingError extends Error {}

export async function geocodeAddress(address: string): Promise<Location | null> {
  const query = encodeURIComponent(address.trim());
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&limit=1`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new GeocodingError("Could not reach the address search service. Check your connection.");
  }

  if (!response.ok) {
    throw new GeocodingError("Something went wrong searching for that address.");
  }

  const data = await response.json();
  const [feature] = data.features ?? [];
  if (!feature) {
    return null;
  }

  const [lng, lat] = feature.center as [number, number];
  return { lng, lat, label: feature.place_name as string };
}
