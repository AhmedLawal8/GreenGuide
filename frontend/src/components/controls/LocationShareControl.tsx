import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { GlobeIcon } from "@radix-ui/react-icons";
import { useGeolocation, GeolocationError } from "../../hooks/useGeolocation";
import { LocationShareDialog } from "./LocationShareDialog";
import type { Location } from "../../types/location";

type LocationShareControlProps = {
  onLocationResolved: (location: Location) => void;
  onError: (message: string) => void;
};

export function LocationShareControl({ onLocationResolved, onError }: LocationShareControlProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentLocation } = useGeolocation();

  const geolocationSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

  async function handleConfirm() {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      onLocationResolved(location);
      setDialogOpen(false);
    } catch (error) {
      onError(error instanceof GeolocationError ? error.message : "Couldn't get your location.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="solid"
        disabled={!geolocationSupported}
        onClick={() => setDialogOpen(true)}
      >
        <GlobeIcon />
        Share my location
      </Button>
      <LocationShareDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </>
  );
}
