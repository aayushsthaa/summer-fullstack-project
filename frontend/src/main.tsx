import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="695498569118-4o9c7a3eopr3iuqpe94spscu99nklmmc.apps.googleusercontent.com">
      <BrowserRouter>
      <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
