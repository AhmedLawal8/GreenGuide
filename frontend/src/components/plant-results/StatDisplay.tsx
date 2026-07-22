import type { ReactNode } from "react";
import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { InfoTooltip } from "./InfoTooltip";

type StatTileProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  tooltip: string;
};

export function StatTile({ icon, label, value, tooltip }: StatTileProps) {
  return (
    <Box p="2">
      <Flex align="center" gap="1" mb="1">
        {icon && <Text style={{ color: "var(--accent-9)" }}>{icon}</Text>}
        <Text size="1" color="gray">
          {label}
        </Text>
        <InfoTooltip label={`What is ${label}?`}>{tooltip}</InfoTooltip>
      </Flex>
      <Text size="4" weight="bold">
        {value}
      </Text>
    </Box>
  );
}

export function CategorySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Text size="2" weight="medium" color="gray" mb="2" as="div">
        {title}
      </Text>
      <Grid columns={{ initial: "2", sm: "3" }} gap="3">
        {children}
      </Grid>
    </Box>
  );
}
