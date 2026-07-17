import type { RouteObject } from "react-router-dom";
import { MapPage } from "../pages/MapPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <MapPage />,
  },
];
