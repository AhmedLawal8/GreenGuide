import { useMemo, useState } from "react";
import { Box, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { RecommendationCard } from "../components/recommendations/RecommendationCard";
import { useRecommendations } from "../context/RecommendationsContext";

export function SearchPage() {
  const { plants, location } = useRecommendations();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return plants;
    return plants.filter(
      (plant) =>
        plant.common_name?.toLowerCase().includes(trimmed) ||
        plant.scientific_name.toLowerCase().includes(trimmed),
    );
  }, [plants, query]);

  function handleSelect(plantId: number) {
    const plant = plants.find((candidate) => candidate.id === plantId);
    navigate(`/plants/${plantId}`, { state: { plant, location } });
  }

  return (
    <Box p="6" height="100%" overflowY="auto">
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

      {results.length === 0 ? (
        <Text size="2" color="gray">
          {plants.length === 0
            ? "Search a location on the map to load plant recommendations."
            : `No plants match "${query}".`}
        </Text>
      ) : (
        <Grid columns={{ initial: "1", sm: "2", md: "3", lg: "4" }} gap="4">
          {results.map((plant) => (
            <RecommendationCard key={plant.id} plant={plant} onClick={() => handleSelect(plant.id)} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
