import { Box, Flex } from "@radix-ui/themes";
import { Outlet } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";

export function Layout() {
  return (
    <Flex direction="column" height="100%" width="100%" position="relative">
      <TopNavbar />
      <Box flexGrow="1" minHeight="0" overflow="hidden">
        <Outlet />
      </Box>
    </Flex>
  );
}
