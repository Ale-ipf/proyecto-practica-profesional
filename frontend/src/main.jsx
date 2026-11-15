import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <LocationProvider>
          <App />
        </LocationProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
