import { AspectRatio, Badge, Box, Card, Text } from "@radix-ui/themes";
import { PLANT_IMAGE_PLACEHOLDER } from "../../lib/placeholderImage";
import type { RecommendedPlant } from "../../types/recommendation";

type RecommendationCardProps = {
  plant: RecommendedPlant;
  onClick: () => void;
};

function scoreColor(score: number): "green" | "amber" | "gray" {
  if (score >= 70) return "green";
  if (score >= 40) return "amber";
  return "gray";
}

export function RecommendationCard({ plant, onClick }: RecommendationCardProps) {
  const topReason = plant.match_reasons[0];

  return (
    <Card asChild>
      <button type="button" onClick={onClick} className="card-button-reset">
        <Box mb="2">
          <AspectRatio ratio={16 / 9}>
            <Box position="relative" width="100%" height="100%">
              <img
                src={plant.image_url ?? PLANT_IMAGE_PLACEHOLDER}
                alt={plant.common_name ?? plant.scientific_name}
                loading="lazy"
                decoding="async"
                className="card-cover-image"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = PLANT_IMAGE_PLACEHOLDER;
                }}
              />
              {plant.score !== null && (
                <Box position="absolute" top="2" right="2">
                  <Badge color={scoreColor(plant.score)}>{Math.round(plant.score)}</Badge>
                </Box>
              )}
            </Box>
          </AspectRatio>
        </Box>

        <Text as="div" size="3" weight="bold">
          {plant.common_name ?? plant.scientific_name}
        </Text>
        <Text as="div" size="2" color="gray" className="text-italic">
          {plant.scientific_name}
        </Text>
        {topReason && (
          <Text as="div" size="1" color="gray" mt="1">
            {topReason}
          </Text>
        )}
      </button>
    </Card>
  );
}
