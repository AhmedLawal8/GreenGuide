import { Box, Flex } from "@radix-ui/themes";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function Layout() {
  return (
    <Flex height="100%" width="100%" position="relative">
      <Navbar />
      <Box flexGrow="1" height="100%" overflow="hidden">
        <Outlet />
      </Box>
    </Flex>
  );
}
