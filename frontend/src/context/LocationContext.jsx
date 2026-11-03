import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { usuario, cargandoSesion } = useAuth();
  const [coordinates, setCoordinates] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const watchId = useRef(null);
  const hadAuthenticatedSession = useRef(false);

  const stopSharing = useCallback(() => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setCoordinates(null);
    setIsSharing(false);
    setError("");
  }, []);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Este navegador no permite acceder a la ubicación.");
      return false;
    }

    if (watchId.current !== null) return true;

    setError("");
    try {
      watchId.current = navigator.geolocation.watchPosition(
        ({ coords }) => {
          setCoordinates([coords.latitude, coords.longitude]);
          setIsSharing(true);
          setError("");
        },
        (geolocationError) => {
          if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
            if (watchId.current !== null) {
              navigator.geolocation.clearWatch(watchId.current);
              watchId.current = null;
            }
            setCoordinates(null);
            setIsSharing(false);
          }

          setError(
            geolocationError.code === geolocationError.PERMISSION_DENIED
              ? "No se concedió permiso para usar la ubicación."
              : "No pudimos actualizar tu ubicación. Revisá la señal del dispositivo.",
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
      setIsSharing(true);
      return true;
    } catch {
      watchId.current = null;
      setIsSharing(false);
      setError("No pudimos activar el seguimiento de ubicación.");
      return false;
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      hadAuthenticatedSession.current = true;
    } else if (!cargandoSesion && hadAuthenticatedSession.current) {
      hadAuthenticatedSession.current = false;
      stopSharing();
    }
  }, [cargandoSesion, stopSharing, usuario]);

  useEffect(
    () => () => {
      if (watchId.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    },
    [],
  );

  return (
    <LocationContext.Provider
      value={{ coordinates, isSharing, error, startSharing, stopSharing }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationSharing() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      "useLocationSharing debe usarse dentro de LocationProvider.",
    );
  }
  return context;
}
