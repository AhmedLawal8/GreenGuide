import { useEffect, useState } from "react";
import { Box, Callout, Grid, Heading, Skeleton, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { RecommendationCard } from "../components/recommendations/RecommendationCard";
import { useAuth } from "../context/AuthContext";
import { ApiError, getSavedPlants } from "../lib/api";
import type { RecommendedPlant, SavedPlant } from "../types/recommendation";

type PageStatus = "loading" | "success" | "error";

function toRecommendedPlant(saved: SavedPlant): RecommendedPlant | null {
  if (!saved.plant) return null;
  return { ...saved.plant, score: null, match_reasons: [], ai_summary: null };
}

export function SavedPlantsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedPlants, setSavedPlants] = useState<SavedPlant[]>([]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setStatus("loading");

    getSavedPlants(token)
      .then((response) => {
        if (cancelled) return;
        setSavedPlants(response.plants);
        setStatus("success");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          error instanceof ApiError ? error.message : "Something went wrong loading your saved plants.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleSelect(plant: RecommendedPlant) {
    navigate(`/plants/${plant.id}`, { state: { plant, location: null } });
  }

  const plants = savedPlants.map(toRecommendedPlant).filter((plant): plant is RecommendedPlant => plant !== null);

  return (
    <Box p="6" height="100%" overflowY="auto" className="search-page">
      <Heading size="6" mb="4">
        Saved Plants
      </Heading>

      {status === "loading" && (
        <Grid columns={{ initial: "1", sm: "2", md: "3", lg: "4" }} gap="4">
          <Skeleton>
            <Box height="220px" />
          </Skeleton>
          <Skeleton>
            <Box height="220px" />
          </Skeleton>
          <Skeleton>
            <Box height="220px" />
          </Skeleton>
        </Grid>
      )}

      {status === "error" && (
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{errorMessage ?? "Something went wrong loading your saved plants."}</Callout.Text>
        </Callout.Root>
      )}

      {status === "success" && plants.length === 0 && (
        <Text size="2" color="gray">
          You haven&apos;t saved any plants yet. Bookmark a plant from your recommendations or search results to see
          it here.
        </Text>
      )}

      {status === "success" && plants.length > 0 && (
        <Grid columns={{ initial: "1", sm: "2", md: "3", lg: "4" }} gap="4">
          {plants.map((plant) => (
            <RecommendationCard key={plant.id} plant={plant} onClick={() => handleSelect(plant)} showScore={false} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
