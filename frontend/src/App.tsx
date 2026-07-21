import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "./router/routes";
import { RecommendationsProvider } from "./context/RecommendationsContext";
import { AuthProvider } from "./context/AuthContext";

function AppRoutes() {
  return useRoutes(routes);
}

export function App() {
  return (
    <AuthProvider>
      <RecommendationsProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RecommendationsProvider>
    </AuthProvider>
  );
}
