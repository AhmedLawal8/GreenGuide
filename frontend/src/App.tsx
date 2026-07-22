import { BrowserRouter, useRoutes } from "react-router-dom";
import { routes } from "./router/routes";
import { RecommendationsProvider } from "./context/RecommendationsContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

function AppRoutes() {
  return useRoutes(routes);
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RecommendationsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RecommendationsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
