import type { RouteObject } from "react-router-dom";
import { MapPage } from "../pages/MapPage";
import { DashboardPage } from "../pages/DashboardPage";
import { PlantResultsPage } from "../pages/PlantResultsPage";
import { SearchPage } from "../pages/SearchPage";
import { LoginPage } from "../pages/LoginPage";
import { AuthCallback } from "../pages/AuthCallback";
import { Layout } from "../components/layout/Layout";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

export const routes: RouteObject[] = [
  // Public routes
  { path: "/login", element: <LoginPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },

  // Protected routes — require authentication
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <MapPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/plants/:id", element: <PlantResultsPage /> },
    ],
  },
];
