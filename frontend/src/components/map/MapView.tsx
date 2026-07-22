import { useEffect, useRef } from "react";
import { Box } from "@radix-ui/themes";
import { useMapbox } from "../../hooks/useMapbox";
import type { Location } from "../../types/location";

type MapViewProps = {
  location: Location | null;
  pinMode?: boolean;
  onPinDrop?: (location: Location) => void;
};

export function MapView({ location, pinMode = false, onPinDrop }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { flyTo, setMarker, setPinMode } = useMapbox(containerRef);

  useEffect(() => {
    if (!location) return;
    flyTo(location);
    setMarker(location);
  }, [location, flyTo, setMarker]);

  useEffect(() => {
    setPinMode(pinMode, onPinDrop);
  }, [pinMode, onPinDrop, setPinMode]);

  return (
    <Box ref={containerRef} className="map-frame" position="relative" width="100%" height="100%" />
  );
}
