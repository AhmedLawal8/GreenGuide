import { useCallback, useEffect, useRef, type RefObject } from "react";
import mapboxgl from "mapbox-gl";
import type { Location } from "../types/location";

const DEFAULT_CENTER: [number, number] = [-73.9712, 40.7831]; // New York, NY
const DEFAULT_ZOOM = 10;
const FOCUSED_ZOOM = 15;

export function useMapbox(containerRef: RefObject<HTMLDivElement>) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });
    map.addControl(new mapboxgl.NavigationControl(), "bottom-left");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [containerRef]);

  const flyTo = useCallback((location: Location) => {
    mapRef.current?.flyTo({ center: [location.lng, location.lat], zoom: FOCUSED_ZOOM });
  }, []);

  const setMarker = useCallback((location: Location) => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLngLat([location.lng, location.lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({ color: "#3d5212" })
        .setLngLat([location.lng, location.lat])
        .addTo(map);
    }
  }, []);

  return { flyTo, setMarker };
}
