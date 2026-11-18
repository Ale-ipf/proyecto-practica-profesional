import { useEffect, useState, useCallback } from "react";
import { iniciarSesion, registrarUsuario, obtenerPerfilPropio } from "../api/auth.js";
import { getToken, setToken, clearToken } from "../api/client.js";
import { AuthContext } from "./auth-context.js";

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

  const actualizarUsuario = useCallback((datosActualizados) => {
    setUsuario((actual) =>
      actual ? { ...actual, ...datosActualizados } : actual,
    );
  }, []);

  const valor = {
    usuario,
    estaLogueado: Boolean(usuario),
    cargandoSesion,
    login,
    registrar,
    logout,
    actualizarUsuario,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
