import { Tooltip, Text } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

type InfoTooltipProps = {
  label: string;
  children: string;
};

export function InfoTooltip({ label, children }: InfoTooltipProps) {
  return (
    <Tooltip content={children}>
      <Text
        as="span"
        color="gray"
        aria-label={label}
        tabIndex={0}
        style={{ display: "inline-flex", cursor: "help", verticalAlign: "middle" }}
      >
        <InfoCircledIcon />
      </Text>
    </Tooltip>
  );
}
