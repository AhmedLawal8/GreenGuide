import { useEffect, useState } from "react";
import { Box, Callout, Grid, Heading, Skeleton, Text, TextField } from "@radix-ui/themes";
import { InfoCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { RecommendationCard } from "../components/recommendations/RecommendationCard";
import { useRecommendations } from "../context/RecommendationsContext";
import { ApiError, searchPlants } from "../lib/api";
import type { RecommendedPlant } from "../types/recommendation";

type SearchStatus = "loading" | "success" | "error";

const BROWSE_LIMIT = 40;

export function SearchPage() {
  const { location } = useRecommendations();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<RecommendedPlant[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    const timeoutId = setTimeout(() => {
      searchPlants(query.trim(), BROWSE_LIMIT)
        .then((response) => {
          if (cancelled) return;
          setResults(response.plants);
          setStatus("success");
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setStatus("error");
          setErrorMessage(
            error instanceof ApiError ? error.message : "Something went wrong searching for plants.",
          );
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query]);

  function handleSelect(plantId: number) {
    const plant = results.find((candidate) => candidate.id === plantId);
    navigate(`/plants/${plantId}`, { state: { plant, location } });
  }

  return (
    <Box p="6" height="100%" overflowY="auto" className="search-page">
      <Heading size="6" mb="4">
        Search
      </Heading>

      <Box maxWidth="480px" mb="5">
        <TextField.Root
          size="3"
          placeholder="Search by plant name…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      </Box>

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
          <Callout.Text>{errorMessage ?? "Something went wrong searching for plants."}</Callout.Text>
        </Callout.Root>
      )}

      {status === "success" && results.length === 0 && (
        <Text size="2" color="gray">
          {query.trim() ? `No plants match "${query}".` : "No plants found."}
        </Text>
      )}

      {status === "success" && results.length > 0 && (
        <Grid columns={{ initial: "1", sm: "2", md: "3", lg: "4" }} gap="4">
          {results.map((plant) => (
            <RecommendationCard
              key={plant.id}
              plant={plant}
              onClick={() => handleSelect(plant.id)}
              showScore={false}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
}
