import { useContext } from "react";
import { LocationContext } from "./location-context.js";

export function useLocationSharing() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      "useLocationSharing debe usarse dentro de LocationProvider.",
    );
  }
  return context;
}
