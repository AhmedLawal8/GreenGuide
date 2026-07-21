import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Box, Button, Callout, Card, Flex, Grid, Heading, Separator, Skeleton, Text } from "@radix-ui/themes";
import { ArrowLeftIcon, CheckCircledIcon, InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { SiteConditions } from "../components/plant-results/SiteConditions";
import { useRecommendations } from "../context/RecommendationsContext";
import { ApiError, explainPlant } from "../lib/api";
import { formatListField } from "../lib/format";
import { PLANT_IMAGE_PLACEHOLDER } from "../lib/placeholderImage";
import type { LocationProfile, RecommendedPlant } from "../types/recommendation";

type NavigationState = {
  plant?: RecommendedPlant;
  location?: LocationProfile;
};

function scoreColor(score: number): "green" | "amber" | "gray" {
  if (score >= 70) return "green";
  if (score >= 40) return "amber";
  return "gray";
}

function formatPhRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Not specified";
  if (min != null && max != null) return `${min} – ${max}`;
  if (min != null) return `≥ ${min}`;
  return `≤ ${max}`;
}

function StatRow({ label, value }: { label: string; value: string | null }) {
  return (
    <Flex justify="between" py="2">
      <Text size="2" color="gray">
        {label}
      </Text>
      <Text size="2" weight="medium">
        {value ?? "Not specified"}
      </Text>
    </Flex>
  );
}

export function PlantResultsPage() {
  const { id } = useParams<{ id: string }>();
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { getPlantById, location: contextLocation } = useRecommendations();

  const state = (routerLocation.state as NavigationState | null) ?? null;
  const plantId = Number(id);
  const plant = state?.plant ?? getPlantById(plantId);
  const plantLocation = state?.location ?? contextLocation;

  const [aiSummary, setAiSummary] = useState<string | null>(plant?.ai_summary ?? null);
  const [aiStatus, setAiStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [aiError, setAiError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!plant || aiSummary) return;
    if (!plantLocation) {
      setAiStatus("error");
      setAiError("No location context available for this plant.");
      return;
    }

    let cancelled = false;
    setAiStatus("loading");
    setAiError(null);

    explainPlant(plant.id, plantLocation, plant.match_reasons)
      .then((response) => {
        if (cancelled) return;
        setAiSummary(response.ai_summary);
        setAiStatus("success");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAiStatus("error");
        setAiError(
          error instanceof ApiError
            ? "The AI insight service is temporarily unavailable."
            : "Something went wrong generating the AI insight.",
        );
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plant?.id, plantLocation, retryToken]);

  if (!plant) {
    return (
      <Box p="6">
        <Callout.Root color="amber">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            We don't have details for this plant. Go back and search a location to see recommendations.
          </Callout.Text>
        </Callout.Root>
        <Button mt="4" variant="soft" onClick={() => navigate("/")}>
          <ArrowLeftIcon /> Back to map
        </Button>
      </Box>
    );
  }

  return (
    <Box p="6" height="100%" overflowY="auto">
      <Button variant="ghost" color="gray" mb="4" onClick={() => navigate(-1)}>
        <ArrowLeftIcon /> Back
      </Button>

      <Flex gap="4" align="start" mb="5" wrap="wrap">
        <Box width="96px" height="96px" flexShrink="0">
          <img
            src={plant.image_url ?? PLANT_IMAGE_PLACEHOLDER}
            alt={plant.common_name ?? plant.scientific_name}
            loading="lazy"
            decoding="async"
            className="hero-image"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = PLANT_IMAGE_PLACEHOLDER;
            }}
          />
        </Box>
        <Flex direction="column" gap="2">
          <Heading size="7">{plant.common_name ?? plant.scientific_name}</Heading>
          <Text size="3" color="gray" className="text-italic">
            {plant.scientific_name}
          </Text>
          <Flex gap="2" wrap="wrap">
            {plant.plant_type && <Badge color="gray">{formatListField(plant.plant_type)}</Badge>}
            {plant.duration && <Badge color="gray">{formatListField(plant.duration)}</Badge>}
            <Badge color={scoreColor(plant.score)}>Match score: {Math.round(plant.score)}</Badge>
          </Flex>
        </Flex>
      </Flex>

      <Grid columns={{ initial: "1", md: "2" }} gap="4">
        <Box gridColumn="1 / -1">
          <SiteConditions location={plantLocation} />
        </Box>

        <Card>
          <Heading size="4" mb="2">
            Growing Conditions
          </Heading>
          <Separator size="4" mb="1" />
          <StatRow label="Sun" value={plant.sun_requirement} />
          <StatRow label="Water" value={plant.water_requirement} />
          <StatRow label="Drought tolerance" value={plant.drought_tolerance} />
          <StatRow label="Hardiness zone" value={plant.hardiness_zone} />
          <StatRow label="Duration" value={formatListField(plant.duration)} />
          <StatRow label="Soil pH range" value={formatPhRange(plant.soil_ph_min, plant.soil_ph_max)} />
        </Card>

        <Card>
          <Heading size="4" mb="2">
            Why this plant
          </Heading>
          <Separator size="4" mb="2" />
          {plant.match_reasons.length === 0 ? (
            <Text size="2" color="gray">
              No specific match reasons were provided for this plant.
            </Text>
          ) : (
            <Flex direction="column" gap="2">
              {plant.match_reasons.map((reason) => (
                <Flex key={reason} gap="2" align="start">
                  <Box mt="1">
                    <CheckCircledIcon color="var(--accent-9)" />
                  </Box>
                  <Text size="2">{reason}</Text>
                </Flex>
              ))}
            </Flex>
          )}
        </Card>

        <Box gridColumn="1 / -1">
          <Card>
            <Heading size="4" mb="2">
              AI Insight
            </Heading>
            <Separator size="4" mb="2" />
            {aiStatus === "loading" && (
              <Flex direction="column" gap="2">
                <Skeleton>
                  <Text size="2">Generating a personalized summary for this plant and location…</Text>
                </Skeleton>
                <Skeleton>
                  <Text size="2">Generating a personalized summary for this plant and location…</Text>
                </Skeleton>
              </Flex>
            )}
            {aiStatus === "error" && (
              <Flex direction="column" gap="2" align="start">
                <Text size="2" color="gray">
                  {aiError}
                </Text>
                <Button size="1" variant="soft" onClick={() => setRetryToken((token) => token + 1)}>
                  <ReloadIcon /> Try again
                </Button>
              </Flex>
            )}
            {aiStatus === "success" && aiSummary && <Text size="2">{aiSummary}</Text>}
            {aiStatus === "idle" && aiSummary && <Text size="2">{aiSummary}</Text>}
          </Card>
        </Box>
      </Grid>
    </Box>
  );
}
