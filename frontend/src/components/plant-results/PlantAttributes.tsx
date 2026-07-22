import { Card, Flex, Heading, Separator } from "@radix-ui/themes";
import { BarChartIcon, CalendarIcon, HeightIcon, TimerIcon } from "@radix-ui/react-icons";
import { StatTile, CategorySection } from "./StatDisplay";
import { SunIcon } from "./SunIcon";
import { RaindropIcon } from "./RaindropIcon";
import { formatHeight, formatListField, formatPhRange } from "../../lib/format";
import type { RecommendedPlant } from "../../types/recommendation";

type PlantAttributesProps = {
  plant: RecommendedPlant;
};

export function PlantAttributes({ plant }: PlantAttributesProps) {
  return (
    <Card>
      <Heading size="4" mb="2">
        Plant Details
      </Heading>
      <Separator size="4" mb="3" />

      <Flex direction="column" gap="4">
        <CategorySection title="Growing Conditions">
          <StatTile
            icon={<SunIcon />}
            label="Sun"
            value={formatListField(plant.sun_requirement) ?? "Not specified"}
            tooltip="How much direct sunlight this plant needs each day to thrive."
          />
          <StatTile
            icon={<RaindropIcon />}
            label="Water"
            value={plant.water_requirement ?? "Not specified"}
            tooltip="This plant's typical watering needs relative to other plants."
          />
          <StatTile
            label="Drought tolerance"
            value={plant.drought_tolerance ?? "Not specified"}
            tooltip="How well this plant survives extended periods without rain or watering."
          />
          <StatTile
            label="Fertility requirement"
            value={plant.fertility_requirement ?? "Not specified"}
            tooltip="How much soil nutrient richness this plant needs to grow well."
          />
        </CategorySection>

        <CategorySection title="Size & Lifecycle">
          <StatTile
            label="Duration"
            value={formatListField(plant.duration) ?? "Not specified"}
            tooltip="Whether this plant completes its lifecycle in one year (annual), two years (biennial), or lives for multiple years (perennial)."
          />
          <StatTile
            icon={<TimerIcon />}
            label="Growth rate"
            value={formatListField(plant.growth_rate) ?? "Not specified"}
            tooltip="How quickly this plant grows once established."
          />
          <StatTile
            label="Life span"
            value={plant.life_span ?? "Not specified"}
            tooltip="How long this plant typically lives once mature."
          />
          <StatTile
            icon={<HeightIcon />}
            label="Height at maturity"
            value={formatHeight(plant.height_at_20_years_maximum_feet)}
            tooltip="The maximum height this plant typically reaches after 20 years of growth."
          />
        </CategorySection>

        <CategorySection title="Bloom & Soil">
          <StatTile
            icon={<CalendarIcon />}
            label="Bloom period"
            value={formatListField(plant.bloom_period) ?? "Not specified"}
            tooltip="The time of year this plant typically flowers."
          />
          <StatTile
            label="Hardiness zone"
            value={plant.hardiness_zone ?? "Not specified"}
            tooltip="The coldest USDA hardiness zone this plant is rated to survive in."
          />
          <StatTile
            icon={<BarChartIcon />}
            label="Soil pH range"
            value={formatPhRange(plant.soil_ph_min, plant.soil_ph_max)}
            tooltip="The range of soil acidity/alkalinity this plant tolerates."
          />
        </CategorySection>
      </Flex>
    </Card>
  );
}
