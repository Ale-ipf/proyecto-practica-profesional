import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarInstituciones } from "../api/institutions.js";
import { ApiRequestError } from "../api/client.js";

export default function InstitutionsPage() {
  const [instituciones, setInstituciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;

    listarInstituciones()
      .then((data) => {
        if (!cancelado) setInstituciones(data.institutions || []);
      })
      .catch((requestError) => {
        if (!cancelado) {
          setError(
            requestError instanceof ApiRequestError
              ? requestError.message
              : "No pudimos cargar las instituciones.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">Alquileres Formosa</Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link to="/panel-estudiante">Mi perfil</Link>
          <Link to="/mapa">Mapa</Link>
        </nav>
        <Link className="button button-primary" to="/panel-estudiante">Volver al perfil</Link>
      </header>
      <main className="institutions-page">
        <span className="section-kicker">INSTITUCIONES EDUCATIVAS</span>
        <h1>Universidades e instituciones asociadas</h1>
        <p className="route-description">
          Explorá las instituciones disponibles y consultá su ubicación en el mapa.
        </p>

        {cargando && <p className="muted">Cargando instituciones…</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        {!cargando && !error && instituciones.length === 0 && (
          <p className="muted">Todavía no hay instituciones disponibles.</p>
        )}

        {!cargando && !error && instituciones.length > 0 && (
          <div className="institutions-grid">
            {instituciones.map((institucion) => (
              <article className="institution-card" key={institucion.id}>
                <span className="institution-card__abbreviation">{institucion.abbreviation}</span>
                <span className="institution-card__type">{institucion.type}</span>
                <h2>{institucion.name}</h2>
                <p>{institucion.description}</p>
                <Link
                  className="button button-accent"
                  to={`/mapa?institucion=${encodeURIComponent(institucion.id)}`}
                >
                  Ver ubicación en el mapa
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
