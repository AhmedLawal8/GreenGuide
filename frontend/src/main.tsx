import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "./styles/theme-tokens.css";
import "./styles/login-page.css";
import "./styles/marketing.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme accentColor="green" grayColor="sand" radius="medium">
      <App />
    </Theme>
  </StrictMode>,
);
