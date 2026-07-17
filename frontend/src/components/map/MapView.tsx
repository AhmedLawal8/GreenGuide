import { useEffect, useRef } from "react";
import { Box } from "@radix-ui/themes";
import { useMapbox } from "../../hooks/useMapbox";
import type { Location } from "../../types/location";

type MapViewProps = {
  location: Location | null;
};

export function MapView({ location }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { flyTo, setMarker } = useMapbox(containerRef);

  useEffect(() => {
    if (!location) return;
    flyTo(location);
    setMarker(location);
  }, [location, flyTo, setMarker]);

  return (
    <Box ref={containerRef} className="map-frame" position="relative" width="100%" height="100%" />
  );
}
