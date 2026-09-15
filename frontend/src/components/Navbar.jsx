import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const enlaceClase = ({ isActive }) =>
  isActive ? "navbar__enlace navbar__enlace--activo" : "navbar__enlace";

export default function Navbar() {
  const { usuario, estaLogueado, logout } = useAuth();

  const urlPanel = usuario?.role === "owner" ? "/panel-dueno" : "/panel-estudiante";

  return (
    <>
      <div className="franja-firma" aria-hidden="true" />
      <header className="navbar">
        <div className="navbar__contenido contenedor">
          <NavLink to="/" className="navbar__marca">
            Alquileres <span>Formosa</span>
          </NavLink>

          <nav className="navbar__enlaces" aria-label="Principal">
            <NavLink to="/" end className={enlaceClase}>
              Catálogo
            </NavLink>
            <NavLink to="/institucional" className={enlaceClase}>
              Institucional
            </NavLink>
            <NavLink to="/contacto" className={enlaceClase}>
              Contacto
            </NavLink>
          </nav>

          <div className="navbar__acciones">
            {estaLogueado ? (
              <>
                <NavLink to={urlPanel} className="navbar__saludo" style={{ textDecoration: "none" }}>
                  Hola, <strong>{usuario.name}</strong>
                </NavLink>
                <button type="button" className="boton boton--secundario boton--chico" onClick={logout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <NavLink to="/ingresar" className="boton boton--secundario boton--chico">
                  Iniciar sesión
                </NavLink>
                <NavLink to="/crear-cuenta" className="boton boton--primario boton--chico">
                  Crear cuenta
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
