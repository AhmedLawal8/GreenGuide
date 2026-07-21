import { useEffect, useState } from "react";
import { Box, Callout, Flex } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { MapView } from "../components/map/MapView";
import { MapControlsPanel } from "../components/controls/MapControlsPanel";
import { LocationShareControl } from "../components/controls/LocationShareControl";
import { RecommendationsSidebar, type RecommendationsStatus } from "../components/recommendations/RecommendationsSidebar";
import { isMapboxTokenConfigured } from "../lib/mapboxClient";
import { ApiError, getRecommendations } from "../lib/api";
import { useRecommendations } from "../context/RecommendationsContext";
import type { Location } from "../types/location";
import type { LocationProfile, RecommendedPlant } from "../types/recommendation";

function messageForError(error: ApiError): string {
  if (error.status === 422) {
    return "We don't have environmental data for this location yet.";
  }
  if (error.status === 502) {
    return "Plant data service is temporarily unavailable. Try again shortly.";
  }
  if (error.status === 0) {
    return "Could not reach the GreenGuide server. Check your connection.";
  }
  return error.message;
}

export function MapPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recStatus, setRecStatus] = useState<RecommendationsStatus>("idle");
  const [recErrorMessage, setRecErrorMessage] = useState<string | null>(null);
  const [plants, setPlants] = useState<RecommendedPlant[]>([]);
  const [locationProfile, setLocationProfile] = useState<LocationProfile | null>(null);
  const { setRecommendations } = useRecommendations();

  function handleLocationResolved(resolvedLocation: Location) {
    setErrorMessage(null);
    setLocation(resolvedLocation);
  }

  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    setRecStatus("loading");
    setRecErrorMessage(null);

    getRecommendations(location.lat, location.lng)
      .then((response) => {
        if (cancelled) return;
        setPlants(response.plants);
        setLocationProfile(response.location);
        setRecStatus("success");
        setRecommendations(response.location, response.plants);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setRecStatus("error");
        setRecErrorMessage(error instanceof ApiError ? messageForError(error) : "Something went wrong loading recommendations.");
      });

    return () => {
      cancelled = true;
    };
  }, [location, setRecommendations]);

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
    <Flex direction="column" height="100%" gap="4" p="6">
      <MapControlsPanel
        errorMessage={errorMessage}
        onLocationResolved={handleLocationResolved}
        onError={setErrorMessage}
      />
      <Box position="relative" flexGrow="1" minHeight="0" mr="-6" mb="-6">
        <Box position="absolute" top="0" left="0" right="0" bottom="0" pr="6" pb="6">
          <Box position="relative" height="100%">
            <MapView location={location} />
            <Box position="absolute" top="4" left="4">
              <LocationShareControl onLocationResolved={handleLocationResolved} onError={setErrorMessage} />
            </Box>
          </Box>
        </Box>
        <Box position="absolute" top="0" right="0" height="100%" className="recommendations-overlay">
          <RecommendationsSidebar
            status={recStatus}
            errorMessage={recErrorMessage}
            plants={plants}
            location={locationProfile}
          />
        </Box>
      </Box>
    </Flex>
  );
}
