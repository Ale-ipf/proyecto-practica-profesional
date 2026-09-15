import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Protege una ruta: exige sesión iniciada y, opcionalmente, un rol específico.
 * Uso: <RutaProtegida rolRequerido="owner"><PanelDueno /></RutaProtegida>
 */
export default function RutaProtegida({ children, rolRequerido }) {
  const { estaLogueado, cargandoSesion, usuario } = useAuth();
  const ubicacion = useLocation();

  if (cargandoSesion) {
    return <p className="estado-carga">Verificando tu sesión…</p>;
  }

  if (!estaLogueado) {
    return <Navigate to="/ingresar" state={{ desde: ubicacion }} replace />;
  }

  if (rolRequerido && usuario.role !== rolRequerido) {
    return <Navigate to="/" replace />;
  }

  return children;
}
