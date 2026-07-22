import type { RouteObject } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { MapPage } from "../pages/MapPage";
import { PlantResultsPage } from "../pages/PlantResultsPage";
import { SearchPage } from "../pages/SearchPage";
import { SavedPlantsPage } from "../pages/SavedPlantsPage";
import { LoginPage } from "../pages/LoginPage";
import { AuthCallback } from "../pages/AuthCallback";
import { Layout } from "../components/layout/Layout";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

export const routes: RouteObject[] = [
  // Public routes
  { path: "/", element: <HomePage /> },
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
      { path: "/explore", element: <MapPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/saved", element: <SavedPlantsPage /> },
      { path: "/plants/:id", element: <PlantResultsPage /> },
    ],
  },
];
