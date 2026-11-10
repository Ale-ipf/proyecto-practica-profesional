import { useState } from "react";
import { Link } from "react-router-dom";
import "./Access.css";

export default function Access({
  activeTab,
  onTabChange,
  children,
}) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <main className={`access-page ${darkMode ? "dark-mode" : ""}`}>
      <section className="access-shell" aria-label="Autenticación">
        <header className="access-header">
          <Link className="access-brand" to="/">
            Alquileres Formosa
          </Link>
          <button
            type="button"
            className="access-theme-toggle"
            onClick={() => setDarkMode((current) => !current)}
            aria-label={
              darkMode ? "Activar tema claro" : "Activar tema oscuro"
            }
          >
            <span aria-hidden="true">{darkMode ? "☀" : "◐"}</span>
            {darkMode ? "Tema claro" : "Tema oscuro"}
          </button>
        </header>

        <div className="access-content">
          <h1 className="access-page-title">
            Accede para comenzar a ver alquileres
          </h1>
          <div className="access-card">
            <nav
              className="access-tabs"
              role="tablist"
              aria-label="Acceso a la cuenta"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "login"}
                className={`access-tab ${activeTab === "login" ? "is-active" : ""}`}
                onClick={() => onTabChange("login")}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "register"}
                className={`access-tab ${activeTab === "register" ? "is-active" : ""}`}
                onClick={() => onTabChange("register")}
              >
                Registro
              </button>
            </nav>
            <div className="access-form-area">
              <h1>
                {activeTab === "login"
                  ? "Bienvenido de nuevo"
                  : "Crea tu cuenta"}
              </h1>
              <p className="access-intro">
                {activeTab === "login"
                  ? "Accede para continuar."
                  : "Completa tus datos para comenzar."}
              </p>
              {children}
            </div>
          </div>
        </div>

        <footer className="access-footer">
          <Link to="/alquileres">← Volver al catálogo</Link>
        </footer>
      </section>
    </main>
  );
}
