import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  iniciarSesion,
  registrarUsuario,
  obtenerPerfilPropio,
  actualizarWhatsAppPropio,
} from "../api/auth.js";
import { ApiRequestError, getToken, setToken, clearToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [errorSesion, setErrorSesion] = useState("");

  const cargarSesion = useCallback(async () => {
    setCargandoSesion(true);
    setErrorSesion("");
    try {
      const data = await obtenerPerfilPropio();
      setUsuario(data.user);
    } catch (error) {
      if (error instanceof ApiRequestError && [401, 403].includes(error.status)) {
        clearToken();
        setUsuario(null);
      } else {
        setErrorSesion(
          error instanceof ApiRequestError
            ? error.message
            : "No pudimos verificar tu sesión. Revisá la conexión con el servidor e intentá de nuevo.",
        );
      }
    } finally {
      setCargandoSesion(false);
    }
  }, []);

  // Al montar la app, si hay un token guardado, recuperamos el usuario.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCargandoSesion(false);
      return;
    }

    cargarSesion();
  }, [cargarSesion]);

  const login = useCallback(async (email, password) => {
    const data = await iniciarSesion({ email, password });
    setToken(data.token);
    setUsuario(data.user);
    setErrorSesion("");
    return data.user;
  }, []);

  const registrar = useCallback(async (datos) => {
    const data = await registrarUsuario(datos);
    setToken(data.token);
    setUsuario(data.user);
    setErrorSesion("");
    return data.user;
  }, []);

  const actualizarTelefonoWhatsApp = useCallback(async (telefono) => {
    const data = await actualizarWhatsAppPropio(telefono);
    setUsuario((actual) => ({ ...actual, ...data.user }));
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUsuario(null);
    setErrorSesion("");
  }, []);

  const valor = {
    usuario,
    estaLogueado: Boolean(usuario),
    cargandoSesion,
    errorSesion,
    login,
    registrar,
    actualizarTelefonoWhatsApp,
    logout,
    reintentarSesion: cargarSesion,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return contexto;
};
