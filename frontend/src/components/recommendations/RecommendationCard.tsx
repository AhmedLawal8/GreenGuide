import { AspectRatio, Badge, Box, Card, Flex, IconButton, Text } from "@radix-ui/themes";
import { BookmarkFilledIcon, BookmarkIcon } from "@radix-ui/react-icons";
import { PLANT_IMAGE_PLACEHOLDER } from "../../lib/placeholderImage";
import { useRecommendations } from "../../context/RecommendationsContext";
import type { RecommendedPlant } from "../../types/recommendation";

type RecommendationCardProps = {
  plant: RecommendedPlant;
  onClick?: () => void;
  showScore?: boolean;
  /** Set false for display-only previews (e.g. marketing pages) — disables click/save. */
  interactive?: boolean;
};

function scoreColor(score: number): "green" | "amber" | "gray" {
  if (score >= 70) return "green";
  if (score >= 40) return "amber";
  return "gray";
}

export function RecommendationCard({
  plant,
  onClick,
  showScore = true,
  interactive = true,
}: RecommendationCardProps) {
  const { savedPlantIds, toggleSavedPlant } = useRecommendations();
  const isSaved = savedPlantIds.has(plant.id);

  return (
    <Card asChild className="plant-card">
      <div
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? onClick : undefined}
        onKeyDown={
          interactive
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        className={interactive ? "card-button-reset" : "card-button-reset card-static"}
      >
        <Box mb="3" className="plant-card-image-frame">
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
              {showScore && plant.score !== null && (
                <Box position="absolute" top="2" right="2">
                  <Badge color={scoreColor(plant.score)} variant="solid" className="score-badge">
                    {Math.round(plant.score)}
                  </Badge>
                </Box>
              )}
            </Box>
          </AspectRatio>
        </Box>

        <Flex justify="between" align="center">
          <Flex direction="column">
            <Text as="div" size="3" weight="bold">
              {plant.common_name ?? plant.scientific_name}
            </Text>
            <Text as="div" size="2" color="gray" className="text-italic">
              {plant.scientific_name}
            </Text>
          </Flex>

          {interactive && (
            <IconButton
              variant={isSaved ? "solid" : "soft"}
              color={isSaved ? "green" : "gray"}
              aria-label={isSaved ? "Remove from saved plants" : "Save plant"}
              aria-pressed={isSaved}
              onClick={(event) => {
                event.stopPropagation();
                toggleSavedPlant(plant.id);
              }}
            >
              {isSaved ? <BookmarkFilledIcon /> : <BookmarkIcon />}
            </IconButton>
          )}
        </Flex>
      </div>
    </Card>
  );
}
