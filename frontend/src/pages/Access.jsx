import { Link } from "react-router-dom";
import { useTheme } from "../context/useTheme.js";
import "./Access.css";

export default function Access({
  activeTab,
  onTabChange,
  children,
}) {
  const { theme } = useTheme();

  return (
    <main className={`access-page ${theme === "dark" ? "dark-mode" : ""}`}>
      <section className="access-shell" aria-label="Autenticación">
        <header className="access-header">
          <Link className="access-brand" to="/">
            Alquileres Formosa
          </Link>
        </header>

        <div className="access-content">
          <p className="access-page-title">
            Accede para comenzar a ver alquileres
          </p>
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
