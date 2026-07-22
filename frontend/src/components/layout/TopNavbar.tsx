import { Avatar, Button, Flex, Text } from "@radix-ui/themes";
import { NavLink, useNavigate } from "react-router-dom";
import { LeafIcon } from "../dashboard/LeafIcon";
import { LogoutConfirmDialog } from "../auth/LogoutConfirmDialog";
import { useAuth } from "../../context/AuthContext";

function TopNavLink({ to, end, children }: { to: string; end?: boolean; children: string }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `marketing-nav-link${isActive ? " active" : ""}`}>
      {children}
    </NavLink>
  );
}

export function TopNavbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="marketing-nav">
      <div className="marketing-nav-side marketing-nav-links">
        <TopNavLink to="/" end>
          Home
        </TopNavLink>
        <TopNavLink to="/explore">Explore</TopNavLink>
        <TopNavLink to="/search">Search</TopNavLink>
        <TopNavLink to="/saved">Saved Plants</TopNavLink>
      </div>

      <NavLink to="/" end className="marketing-nav-brand">
        <LeafIcon width="22" height="22" color="var(--accent-9)" />
        <Text size="5" weight="bold">
          GreenGuide
        </Text>
      </NavLink>

      <div className="marketing-nav-side marketing-nav-auth">
        {isAuthenticated ? (
          <Flex align="center" gap="3">
            <Flex align="center" gap="2" className="marketing-nav-user">
              <Avatar
                size="1"
                radius="full"
                src={user?.avatar_url ?? undefined}
                fallback={(user?.display_name ?? user?.username ?? user?.email)?.[0]?.toUpperCase() ?? "U"}
              />
              <Text size="2" weight="medium">
                {user?.display_name ?? user?.username ?? "Account"}
              </Text>
            </Flex>
            <LogoutConfirmDialog
              onConfirm={handleLogout}
              trigger={
                <Button variant="soft" color="gray">
                  Logout
                </Button>
              }
            />
          </Flex>
        ) : (
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        )}
      </div>
    </header>
  );
}
