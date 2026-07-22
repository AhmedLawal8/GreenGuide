import type { ReactNode } from "react";
import { AlertDialog, Button, Flex } from "@radix-ui/themes";

type LogoutConfirmDialogProps = {
  trigger: ReactNode;
  onConfirm: () => void;
};

export function LogoutConfirmDialog({ trigger, onConfirm }: LogoutConfirmDialogProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>{trigger}</AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="400px">
        <AlertDialog.Title>Log out?</AlertDialog.Title>
        <AlertDialog.Description size="2">
          You'll need to sign in again to see your saved plants and recommendations.
        </AlertDialog.Description>
        <Flex gap="3" justify="end" mt="4">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button color="red" onClick={onConfirm}>
              Log out
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
