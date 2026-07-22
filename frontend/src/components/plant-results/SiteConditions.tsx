import { Callout, Card, Flex, Heading, Separator, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { StatTile, CategorySection } from "./StatDisplay";
import { SunIcon } from "./SunIcon";
import { RaindropIcon } from "./RaindropIcon";
import type { LocationProfile } from "../../types/recommendation";

type SiteConditionsProps = {
  location: LocationProfile | null;
};

export function SiteConditions({ location }: SiteConditionsProps) {
  return (
    <Card>
      <Flex direction="column" gap="1" mb="2">
        <Heading size="4">Site Conditions</Heading>
        {location?.place_label && (
          <Text size="2" color="gray">
            {location.place_label}
          </Text>
        )}
      </Flex>
      <Separator size="4" mb="3" />

      {!location && (
        <Callout.Root color="gray">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            No location data is associated with this plant result. Search an address or share your location on the
            map to see site conditions.
          </Callout.Text>
        </Callout.Root>
      )}

      {location && (
        <Flex direction="column" gap="4">
          <CategorySection title="Climate (30-yr normal, 1991–2020)">
            <StatTile
              icon={<SunIcon />}
              label="Avg. temp"
              value={location.annual_mean_temp_f != null ? `${Math.round(location.annual_mean_temp_f)}°F` : "Not specified"}
              tooltip="The average daily temperature at this location, averaged over 30 years of historical climate data."
            />
            <StatTile
              icon={<SunIcon />}
              label="Typical high"
              value={location.annual_max_temp_f != null ? `${Math.round(location.annual_max_temp_f)}°F` : "Not specified"}
              tooltip="The average daily high temperature over the same 30-year period."
            />
            <StatTile
              icon={<SunIcon />}
              label="Typical low"
              value={location.annual_min_temp_f != null ? `${Math.round(location.annual_min_temp_f)}°F` : "Not specified"}
              tooltip="The average daily low temperature over the same 30-year period."
            />
            <StatTile
              icon={<RaindropIcon />}
              label="Annual rainfall"
              value={location.annual_precip_inches != null ? `${location.annual_precip_inches}"` : "Not specified"}
              tooltip="The average total rainfall this location receives in a year, based on 30 years of historical data."
            />
          </CategorySection>

          <CategorySection title="Soil">
            <StatTile
              label="Soil type"
              value={location.soil_name ?? "Not specified"}
              tooltip="The dominant soil series at this location, as mapped by the USDA soil survey."
            />
            <StatTile
              label="Soil pH"
              value={location.soil_ph != null ? String(location.soil_ph) : "Not specified"}
              tooltip="A measure of soil acidity/alkalinity from 0-14. Below 7 is acidic, above 7 is alkaline; most garden plants prefer 6-7."
            />
            <StatTile
              label="Texture"
              value={location.soil_texture ?? "Not specified"}
              tooltip="How coarse or fine the soil particles are — coarse (sandy) soil drains fast, fine (clay) soil holds water longer."
            />
            <StatTile
              label="Drainage"
              value={location.drainage ?? "Not specified"}
              tooltip="How quickly water moves through the soil after rain, from excessively drained (very fast) to very poorly drained (very slow)."
            />
            <StatTile
              label="Soil moisture index"
              value={location.soil_moisture_index != null ? `${location.soil_moisture_index} / 100` : "Not specified"}
              tooltip="An estimate of how much moisture this soil retains, on a 0-100 scale, based on rainfall, soil texture, and drainage. Higher means the soil stays wetter longer."
            />
          </CategorySection>

          <CategorySection title="Location">
            <StatTile
              label="Hardiness zone"
              value={location.hardiness_zone ?? "Not specified"}
              tooltip="The USDA Plant Hardiness Zone for this location, based on average annual minimum winter temperature. Used to determine which plants can survive winters here."
            />
            <StatTile
              label="Coordinates"
              value={`${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`}
              tooltip="The latitude and longitude used to look up this location's climate, soil, and hardiness zone data."
            />
          </CategorySection>
        </Flex>
      )}
    </Card>
  );
}
