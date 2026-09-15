import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { iniciarSesion, registrarUsuario, obtenerPerfilPropio } from "../api/auth.js";
import { getToken, setToken, clearToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Al montar la app, si hay un token guardado, recuperamos el usuario.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCargandoSesion(false);
      return;
    }

    obtenerPerfilPropio()
      .then((data) => setUsuario(data.user))
      .catch(() => clearToken())
      .finally(() => setCargandoSesion(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await iniciarSesion({ email, password });
    setToken(data.token);
    setUsuario(data.user);
    return data.user;
  }, []);

  const registrar = useCallback(async (datos) => {
    const data = await registrarUsuario(datos);
    setToken(data.token);
    setUsuario(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUsuario(null);
  }, []);

  const valor = {
    usuario,
    estaLogueado: Boolean(usuario),
    cargandoSesion,
    login,
    registrar,
    logout,
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
