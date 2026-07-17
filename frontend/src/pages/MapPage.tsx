import { useState } from "react";
import { Box, Callout, Flex } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { MapView } from "../components/map/MapView";
import { MapControlsPanel } from "../components/controls/MapControlsPanel";
import { LocationShareControl } from "../components/controls/LocationShareControl";
import { isMapboxTokenConfigured } from "../lib/mapboxClient";
import type { Location } from "../types/location";

export function MapPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleLocationResolved(resolvedLocation: Location) {
    setErrorMessage(null);
    setLocation(resolvedLocation);
  }

  if (!isMapboxTokenConfigured) {
    return (
      <Box p="4">
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Missing Mapbox access token
          </Callout.Text>
        </Callout.Root>
      </Box>
    );
  }

  return (
    <Box p="6" height="100vh">
      <Flex direction="column" gap="4" height="100%">
        <MapControlsPanel
          errorMessage={errorMessage}
          onLocationResolved={handleLocationResolved}
          onError={setErrorMessage}
        />
        <Box position="relative" width="100%" flexGrow="1">
          <MapView location={location} />
          <Box position="absolute" top="4" left="4">
            <LocationShareControl onLocationResolved={handleLocationResolved} onError={setErrorMessage} />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
