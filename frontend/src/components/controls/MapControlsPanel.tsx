import { Flex, Text } from "@radix-ui/themes";
import { AddressSearchControl } from "./AddressSearchControl";
import type { Location } from "../../types/location";

type MapControlsPanelProps = {
  errorMessage: string | null;
  onLocationResolved: (location: Location) => void;
  onError: (message: string) => void;
};

export function MapControlsPanel({
  errorMessage,
  onLocationResolved,
  onError,
}: MapControlsPanelProps) {
  return (
    <Flex direction="column" gap="3">
      <AddressSearchControl onLocationResolved={onLocationResolved} onError={onError} />
      {errorMessage && (
        <Text size="2" color="red">
          {errorMessage}
        </Text>
      )}
    </Flex>
  );
}
