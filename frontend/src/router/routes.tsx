import type { RouteObject } from "react-router-dom";
import { MapPage } from "../pages/MapPage";
import { DashboardPage } from "../pages/DashboardPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MapPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
];
