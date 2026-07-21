import { AspectRatio, Box, Callout, Card, Flex, Heading, Skeleton, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { useNavigate } from "react-router-dom";
import { RecommendationCard } from "./RecommendationCard";
import type { LocationProfile, RecommendedPlant } from "../../types/recommendation";

export type RecommendationsStatus = "idle" | "loading" | "success" | "error";

type RecommendationsSidebarProps = {
  status: RecommendationsStatus;
  errorMessage: string | null;
  plants: RecommendedPlant[];
  location: LocationProfile | null;
};

function SkeletonCard() {
  return (
    <Card className="plant-card">
      <Box mb="3" className="plant-card-image-frame">
        <AspectRatio ratio={16 / 9}>
          <Skeleton width="100%" height="100%" />
        </AspectRatio>
      </Box>
      <Skeleton>
        <Text size="3">Loading plant name</Text>
      </Skeleton>
      <Skeleton>
        <Text size="2">Loading scientific name</Text>
      </Skeleton>
    </Card>
  );
}

export function RecommendationsSidebar({ status, errorMessage, plants, location }: RecommendationsSidebarProps) {
  const navigate = useNavigate();

  function handleSelect(plant: RecommendedPlant) {
    navigate(`/plants/${plant.id}`, { state: { plant, location } });
  }

  return (
    <Flex
      direction="column"
      width="360px"
      minWidth="360px"
      height="100%"
      p="4"
      gap="3"
      overflowY="auto"
      className="recommendations-panel"
    >
      <Heading size="4">Recommended Plants</Heading>
      {status === "success" && plants.length > 0 && (
        <Text size="2" color="gray">
          {plants.length} plants match this location
        </Text>
      )}

      {status === "idle" && (
        <Text size="2" color="gray">
          Search an address or share your location to see plant recommendations for your area.
        </Text>
      )}

      {status === "loading" && (
        <Flex direction="column" gap="3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </Flex>
      )}

      {status === "error" && (
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{errorMessage ?? "Something went wrong loading recommendations."}</Callout.Text>
        </Callout.Root>
      )}

      {status === "success" && plants.length === 0 && (
        <Text size="2" color="gray">
          No matching plants found for this location.
        </Text>
      )}

      {status === "success" && plants.length > 0 && (
        <Flex direction="column" gap="3">
          {plants.map((plant) => (
            <RecommendationCard key={plant.id} plant={plant} onClick={() => handleSelect(plant)} />
          ))}
        </Flex>
      )}
    </Flex>
  );
}
