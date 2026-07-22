import { Box, Button, Flex, Text, Tooltip } from "@radix-ui/themes";
import { AddressSearchControl } from "./AddressSearchControl";
import { PinIcon } from "../map/PinIcon";
import type { Location } from "../../types/location";

type MapControlsPanelProps = {
  errorMessage: string | null;
  onLocationResolved: (location: Location) => void;
  onError: (message: string) => void;
  pinMode: boolean;
  onTogglePinMode: () => void;
};

export function MapControlsPanel({
  errorMessage,
  onLocationResolved,
  onError,
  pinMode,
  onTogglePinMode,
}: MapControlsPanelProps) {
  return (
    <Flex direction="column" gap="3">
      <Flex gap="2" align="start">
        <Box flexGrow="1">
          <AddressSearchControl onLocationResolved={onLocationResolved} onError={onError} />
        </Box>
        <Tooltip content={pinMode ? "Click anywhere on the map to pick that spot" : "Click on the map to pick a location"}>
          <Button
            type="button"
            variant={pinMode ? "solid" : "soft"}
            color={pinMode ? "green" : "gray"}
            onClick={onTogglePinMode}
            aria-pressed={pinMode}
          >
            <PinIcon />
            {pinMode ? "Click the map…" : "Drop a pin"}
          </Button>
        </Tooltip>
      </Flex>
      {errorMessage && (
        <Text size="2" color="red">
          {errorMessage}
        </Text>
      )}
    </Flex>
  );
}
