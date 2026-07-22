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

/**
 * Resolve a lat/lng back to a human-readable "City, State" label.
 * Returns null (rather than throwing) on any failure — this is a display
 * nicety, not something that should block showing recommendations.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=place,region&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const [feature] = data.features ?? [];
    return (feature?.place_name as string) ?? null;
  } catch {
    return null;
  }
}
