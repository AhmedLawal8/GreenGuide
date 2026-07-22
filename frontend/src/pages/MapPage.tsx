import { useRef, useState } from "react";
import { Box, Callout, Flex } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { MapView } from "../components/map/MapView";
import { MapControlsPanel } from "../components/controls/MapControlsPanel";
import { LocationShareControl } from "../components/controls/LocationShareControl";
import { RecommendationsSidebar, type RecommendationsStatus } from "../components/recommendations/RecommendationsSidebar";
import { isMapboxTokenConfigured } from "../lib/mapboxClient";
import { ApiError, getRecommendations } from "../lib/api";
import { reverseGeocode } from "../lib/geocoding";
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
  const { mapLocation: cachedMapLocation, location: cachedLocationProfile, plants: cachedPlants, setRecommendations } =
    useRecommendations();

  const [location, setLocation] = useState<Location | null>(cachedMapLocation);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recStatus, setRecStatus] = useState<RecommendationsStatus>(cachedPlants.length > 0 ? "success" : "idle");
  const [recErrorMessage, setRecErrorMessage] = useState<string | null>(null);
  const [plants, setPlants] = useState<RecommendedPlant[]>(cachedPlants);
  const [locationProfile, setLocationProfile] = useState<LocationProfile | null>(cachedLocationProfile);
  const [pinMode, setPinMode] = useState(false);
  const requestIdRef = useRef(0);

  function handleLocationResolved(resolvedLocation: Location) {
    const requestId = ++requestIdRef.current;

    setPinMode(false);
    setErrorMessage(null);
    setLocation(resolvedLocation);
    setRecStatus("loading");
    setRecErrorMessage(null);

    getRecommendations(resolvedLocation.lat, resolvedLocation.lng)
      .then((response) => {
        if (requestIdRef.current !== requestId) return;
        const enrichedLocation = { ...response.location, place_label: resolvedLocation.label ?? null };
        setPlants(response.plants);
        setLocationProfile(enrichedLocation);
        setRecStatus("success");
        setRecommendations(resolvedLocation, enrichedLocation, response.plants);
      })
      .catch((error: unknown) => {
        if (requestIdRef.current !== requestId) return;
        setRecStatus("error");
        setRecErrorMessage(error instanceof ApiError ? messageForError(error) : "Something went wrong loading recommendations.");
      });
  }

  function handlePinDrop(clickedLocation: Location) {
    // Reverse-geocode is best-effort (never rejects) — fall back to raw coordinates.
    reverseGeocode(clickedLocation.lat, clickedLocation.lng).then((label) => {
      handleLocationResolved({ ...clickedLocation, label: label ?? undefined });
    });
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
    <Flex direction="column" height="100%" gap="4" p="6">
      <MapControlsPanel
        errorMessage={errorMessage}
        onLocationResolved={handleLocationResolved}
        onError={setErrorMessage}
        pinMode={pinMode}
        onTogglePinMode={() => setPinMode((prev) => !prev)}
      />
      <Box position="relative" flexGrow="1" minHeight="0" mr="-6" mb="-6">
        <Box position="absolute" top="0" left="0" right="0" bottom="0" pr="6" pb="6">
          <Box position="relative" height="100%">
            <MapView location={location} pinMode={pinMode} onPinDrop={handlePinDrop} />
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
