import { useState } from "react";
import { Flex, Heading, Text } from "@radix-ui/themes";
import { HomeIcon, ListBulletIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { NavLink } from "react-router-dom";
import { LeafIcon } from "../dashboard/LeafIcon";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Flex
      direction="column"
      width={isOpen ? "220px" : "48px"}
      minWidth={isOpen ? "220px" : "48px"}
      height="100%"
      p={isOpen ? "4" : "2"}
      gap="4"
      overflowY="auto"
      className="navbar-panel"
    >
      <Flex align="center" gap="2" justify={isOpen ? "start" : "center"}>
        <button
          type="button"
          className="logo-toggle-button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Collapse navigation" : "Expand navigation"}
          aria-pressed={isOpen}
        >
          <LeafIcon width="24" height="24" color="var(--accent-9)" />
        </button>
        {isOpen && <Heading size="4">GreenGuide</Heading>}
      </Flex>

      <Flex direction="column" gap="1">
        <NavLink to="/" className="nav-link" end>
          {({ isActive }) => (
            <Flex
              align="center"
              gap="2"
              px="2"
              py="2"
              justify={isOpen ? "start" : "center"}
              className={isActive ? "nav-link-row nav-link-active" : "nav-link-row"}
            >
              <HomeIcon />
              {isOpen && <Text size="2" weight={isActive ? "bold" : "regular"}>Map</Text>}
            </Flex>
          )}
        </NavLink>
        <NavLink to="/dashboard" className="nav-link">
          {({ isActive }) => (
            <Flex
              align="center"
              gap="2"
              px="2"
              py="2"
              justify={isOpen ? "start" : "center"}
              className={isActive ? "nav-link-row nav-link-active" : "nav-link-row"}
            >
              <ListBulletIcon />
              {isOpen && <Text size="2" weight={isActive ? "bold" : "regular"}>My Plants</Text>}
            </Flex>
          )}
        </NavLink>
        <NavLink to="/search" className="nav-link">
          {({ isActive }) => (
            <Flex
              align="center"
              gap="2"
              px="2"
              py="2"
              justify={isOpen ? "start" : "center"}
              className={isActive ? "nav-link-row nav-link-active" : "nav-link-row"}
            >
              <MagnifyingGlassIcon />
              {isOpen && <Text size="2" weight={isActive ? "bold" : "regular"}>Search</Text>}
            </Flex>
          )}
        </NavLink>
      </Flex>
    </Flex>
  );
}
