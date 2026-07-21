import { useState } from "react";
import { AspectRatio, Badge, Box, Callout, Card, Flex, Heading, IconButton, Separator, Skeleton, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon, InfoCircledIcon } from "@radix-ui/react-icons";
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
    <Card>
      <Box mb="2">
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
  const [isOpen, setIsOpen] = useState(true);

  function handleSelect(plant: RecommendedPlant) {
    navigate(`/plants/${plant.id}`, { state: { plant, location } });
  }

  if (!isOpen) {
    return (
      <Flex direction="column" align="center" width="48px" minWidth="48px" height="100%" p="2" gap="3">
        <IconButton variant="ghost" color="gray" onClick={() => setIsOpen(true)} aria-label="Open recommendations">
          <ChevronLeftIcon />
        </IconButton>
        {status === "success" && plants.length > 0 && <Badge color="green">{plants.length}</Badge>}
      </Flex>
    );
  }

  return (
    <Flex direction="column" width="360px" minWidth="360px" height="100%" p="4" gap="3" overflowY="auto">
      <Flex align="center" justify="between" gap="2">
        <Heading size="4">Recommended Plants</Heading>
        <IconButton variant="ghost" color="gray" size="1" onClick={() => setIsOpen(false)} aria-label="Collapse recommendations">
          <ChevronRightIcon />
        </IconButton>
      </Flex>
      {status === "success" && plants.length > 0 && (
        <Text size="2" color="gray">
          {plants.length} plants match this location
        </Text>
      )}
      <Separator size="4" />

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
