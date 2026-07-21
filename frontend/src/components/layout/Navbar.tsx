import { useState } from "react";
import { Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, ListBulletIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { NavLink } from "react-router-dom";
import { LeafIcon } from "../dashboard/LeafIcon";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <Flex direction="column" align="center" width="48px" minWidth="48px" height="100%" p="2" gap="3">
        <IconButton variant="ghost" color="gray" onClick={() => setIsOpen(true)} aria-label="Open navigation">
          <ChevronRightIcon />
        </IconButton>
        <LeafIcon width="20" height="20" color="var(--accent-9)" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" width="220px" minWidth="220px" height="100%" p="4" gap="4" overflowY="auto">
      <Flex align="center" justify="between" gap="2">
        <Flex align="center" gap="2">
          <LeafIcon width="24" height="24" color="var(--accent-9)" />
          <Heading size="4">GreenGuide</Heading>
        </Flex>
        <IconButton variant="ghost" color="gray" size="1" onClick={() => setIsOpen(false)} aria-label="Collapse navigation">
          <ChevronLeftIcon />
        </IconButton>
      </Flex>

      <Flex direction="column" gap="1">
        <NavLink to="/" className="nav-link" end>
          {({ isActive }) => (
            <Flex align="center" gap="2" px="2" py="2" className={isActive ? "nav-link-row nav-link-active" : "nav-link-row"}>
              <HomeIcon />
              <Text size="2" weight={isActive ? "bold" : "regular"}>Map</Text>
            </Flex>
          )}
        </NavLink>
        <NavLink to="/dashboard" className="nav-link">
          {({ isActive }) => (
            <Flex align="center" gap="2" px="2" py="2" className={isActive ? "nav-link-row nav-link-active" : "nav-link-row"}>
              <ListBulletIcon />
              <Text size="2" weight={isActive ? "bold" : "regular"}>My Plants</Text>
            </Flex>
          )}
        </NavLink>
        <NavLink to="/search" className="nav-link">
          {({ isActive }) => (
            <Flex align="center" gap="2" px="2" py="2" className={isActive ? "nav-link-row nav-link-active" : "nav-link-row"}>
              <MagnifyingGlassIcon />
              <Text size="2" weight={isActive ? "bold" : "regular"}>Search</Text>
            </Flex>
          )}
        </NavLink>
      </Flex>
    </Flex>
  );
}
