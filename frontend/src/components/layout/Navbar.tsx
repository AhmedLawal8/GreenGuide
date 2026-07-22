import { useState } from "react";
import { Flex, Heading, IconButton, Text, Avatar, Separator } from "@radix-ui/themes";
import { ChevronRightIcon, HomeIcon, ListBulletIcon, MagnifyingGlassIcon, ExitIcon } from "@radix-ui/react-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { LeafIcon } from "../dashboard/LeafIcon";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

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

      {/* Spacer to push user section to the bottom */}
      <Flex flexGrow="1" />

      {/* User section */}
      {user && (
        <>
          <Separator size="4" />
          <Flex align="center" gap="2" px="1">
            <Avatar
              size="2"
              radius="full"
              src={user.avatar_url ?? undefined}
              fallback={(user.display_name ?? user.username ?? user.email)?.[0]?.toUpperCase() ?? "U"}
            />
            <Flex direction="column" flexGrow="1" style={{ minWidth: 0 }}>
              <Text size="2" weight="medium" truncate>
                {user.display_name ?? user.username ?? "User"}
              </Text>
              <Text size="1" color="gray" truncate>
                {user.email}
              </Text>
            </Flex>
            <IconButton
              variant="ghost"
              color="gray"
              size="1"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
            >
              <ExitIcon />
            </IconButton>
          </Flex>
        </>
      )}
    </Flex>
  );
}
