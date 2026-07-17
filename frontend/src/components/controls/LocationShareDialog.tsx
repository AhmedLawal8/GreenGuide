import { Button, Dialog, Flex, Text } from "@radix-ui/themes";

type LocationShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
};

export function LocationShareDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: LocationShareDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <Dialog.Title>Share your location?</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          <Text>
            GreenGuide would like to use your location to find plants in your area. Please confirm below. 
          </Text>
        </Dialog.Description>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={onConfirm} loading={isLoading}>
            Allow
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
