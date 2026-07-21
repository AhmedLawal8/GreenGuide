import { AspectRatio, Box, Card, DropdownMenu, Flex, IconButton, Skeleton, Text } from "@radix-ui/themes";
import { DotsVerticalIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import type { Plant } from "../../types/plant";
import { LeafIcon } from "./LeafIcon";

type PlantCardProps = {
  plant: Plant;
  onEdit: () => void;
  onDelete: () => void;
};

export function PlantCard({ plant, onEdit, onDelete }: PlantCardProps) {
  return (
    <Card>
      <Box mb="3">
        <AspectRatio ratio={1}>
          <Box position="relative" width="100%" height="100%">
            <Skeleton width="100%" height="100%" />
            <Flex position="absolute" inset="0" align="center" justify="center">
              <LeafIcon width="40" height="40" />
            </Flex>
          </Box>
        </AspectRatio>
      </Box>

      <Flex justify="between" align="center">
        <Flex direction="column">
          <Text as="div" size="3" weight="bold">
            {plant.name}
          </Text>
          <Text as="div" size="2" color="gray">
            {plant.species}
          </Text>
        </Flex>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton variant="ghost" color="gray" aria-label={`Actions for ${plant.name}`}>
              <DotsVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onSelect={onEdit}>
              <Pencil2Icon /> Edit
            </DropdownMenu.Item>
            <DropdownMenu.Item color="red" onSelect={onDelete}>
              <TrashIcon /> Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </Card>
  );
}
