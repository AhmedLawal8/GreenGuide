import type { RouteObject } from "react-router-dom";
import { MapPage } from "../pages/MapPage";
import { DashboardPage } from "../pages/DashboardPage";
import { PlantResultsPage } from "../pages/PlantResultsPage";
import { SearchPage } from "../pages/SearchPage";
import { Layout } from "../components/layout/Layout";

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <MapPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/plants/:id", element: <PlantResultsPage /> },
    ],
  },
];
