import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "./router/routes";
import { RecommendationsProvider } from "./context/RecommendationsContext";

function AppRoutes() {
  return useRoutes(routes);
}

export function App() {
  return (
    <RecommendationsProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </RecommendationsProvider>
  );
}
