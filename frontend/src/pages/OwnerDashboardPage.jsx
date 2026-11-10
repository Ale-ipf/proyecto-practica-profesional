import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { eliminarPropiedad, listarMisPropiedades } from "../api/properties.js";
import { ApiRequestError } from "../api/client.js";

const textoDisponibilidad = (estado, espacios) => {
  if (estado === "rented" || Number(espacios) === 0) return "Alquilado";
  return Number(espacios) === 1 ? "1 espacio disponible" : `${espacios} espacios disponibles`;
};

function TarjetaPropiedad({ propiedad, onEliminar, eliminando }) {
  const imagen = propiedad.images?.[0]?.url || propiedad.imageUrl;
  const alquilada = propiedad.status === "rented" || Number(propiedad.available_spots) === 0;

  return (
    <article className="owner-property-card">
      <Link
        className="owner-property-card__image"
        to={`/alquileres/${propiedad.id}`}
        aria-label={`Ver ${propiedad.title}`}
      >
        {imagen ? (
          <img src={imagen} alt={`Foto de ${propiedad.title}`} />
        ) : (
          <span>Foto no disponible</span>
        )}
        <span className={`owner-property-card__status${alquilada ? " owner-property-card__status--rented" : ""}`}>
          {textoDisponibilidad(propiedad.status, propiedad.available_spots)}
        </span>
      </Link>
      <div className="owner-property-card__body">
        <div className="owner-property-card__tags">
          <span>{propiedad.bedrooms === 1 ? "Monoambiente" : `${propiedad.bedrooms} ambientes`}</span>
          <span>{propiedad.is_furnished ? "Amoblado" : "Sin amoblar"}</span>
        </div>
        <Link className="owner-property-card__title" to={`/alquileres/${propiedad.id}`}>
          <h3>{propiedad.title}</h3>
        </Link>
        <p className="owner-property-card__address">{propiedad.address}, {propiedad.city}</p>
        <p className="owner-property-card__price">
          ${Number(propiedad.price).toLocaleString("es-AR")} <small>/ mes</small>
        </p>
        <div className="owner-property-card__actions">
          <Link className="button button-small button-accent" to={`/alquileres/${propiedad.id}/editar`}>
            Editar
          </Link>
          <button
            className="button button-small button-outline-danger"
            type="button"
            onClick={() => onEliminar(propiedad)}
            disabled={eliminando}
          >
            {eliminando ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function OwnerDashboardPage({ usuario, onLogout }) {
  const { actualizarTelefonoWhatsApp } = useAuth();
  const [propiedades, setPropiedades] = useState([]);
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState(usuario?.whatsappPhone || "");
  const [guardandoTelefono, setGuardandoTelefono] = useState(false);
  const [errorTelefono, setErrorTelefono] = useState("");
  const [mensajeTelefono, setMensajeTelefono] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorEliminar, setErrorEliminar] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);

  const cargarPropiedades = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await listarMisPropiedades();
      setPropiedades(data.properties || []);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos cargar tus propiedades. Revisá tu conexión e intentá de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPropiedades();
  }, [cargarPropiedades]);

  const estadisticas = useMemo(() => ({
    publicaciones: propiedades.length,
    disponibles: propiedades.filter(
      (propiedad) => propiedad.status === "available" && Number(propiedad.available_spots) > 0,
    ).length,
    espacios: propiedades.reduce(
      (total, propiedad) => total + (propiedad.status === "available" ? Number(propiedad.available_spots || 0) : 0),
      0,
    ),
  }), [propiedades]);

  const eliminar = async (propiedad) => {
    if (!window.confirm(`¿Querés eliminar la publicación "${propiedad.title}"?`)) return;

    setEliminandoId(propiedad.id);
    setErrorEliminar("");
    try {
      await eliminarPropiedad(propiedad.id);
      setPropiedades((actuales) => actuales.filter((item) => String(item.id) !== String(propiedad.id)));
    } catch (requestError) {
      setErrorEliminar(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos eliminar la publicación. Intentá de nuevo.",
      );
    } finally {
      setEliminandoId(null);
    }
  };

  const guardarTelefono = async (event) => {
    event.preventDefault();
    setGuardandoTelefono(true);
    setErrorTelefono("");
    setMensajeTelefono("");

    try {
      const usuarioActualizado = await actualizarTelefonoWhatsApp(telefonoWhatsApp.trim());
      setTelefonoWhatsApp(usuarioActualizado.whatsappPhone || "");
      setMensajeTelefono(
        usuarioActualizado.whatsappPhone
          ? "Tu número de WhatsApp se guardó correctamente."
          : "Se quitó tu número de WhatsApp de las publicaciones.",
      );
    } catch (requestError) {
      setErrorTelefono(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos guardar tu número. Revisá la conexión e intentá de nuevo.",
      );
    } finally {
      setGuardandoTelefono(false);
    }
  };

  const primerNombre = usuario?.name?.trim().split(/\s+/)[0] || "propietario";

  return (
    <div className="app-shell route-page-shell owner-dashboard-shell">
      <header className="site-header owner-header">
        <Link className="brand-title" to="/">Alquileres Formosa</Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link to="/alquileres">Alquileres</Link>
          <Link to="/mapa">Mapa</Link>
        </nav>
        <div className="header-actions">
          <span className="greeting">Hola, {primerNombre}</span>
          <button className="button button-outline-danger" type="button" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="owner-dashboard">
        <section className="owner-welcome">
          <div className="owner-welcome__copy">
            <span className="owner-eyebrow">PANEL DEL PROPIETARIO</span>
            <h1>Hola, {primerNombre}</h1>
            <p>Administrá tus propiedades y mantené tus publicaciones al día.</p>
          </div>
          <div className="owner-stats" aria-label="Resumen de tus publicaciones">
            <div className="owner-stat">
              <strong>{estadisticas.publicaciones}</strong>
              <span>Publicaciones</span>
            </div>
            <div className="owner-stat">
              <strong>{estadisticas.disponibles}</strong>
              <span>Disponibles</span>
            </div>
            <div className="owner-stat">
              <strong>{estadisticas.espacios}</strong>
              <span>Espacios libres</span>
            </div>
          </div>
        </section>

        <section className="owner-contact-settings" aria-labelledby="owner-contact-title">
          <div>
            <span className="section-kicker">CONTACTO PARA ESTUDIANTES</span>
            <h2 id="owner-contact-title">Tu WhatsApp</h2>
            <p>Este número aparecerá en tus alquileres para que puedan escribirte directamente.</p>
          </div>
          <form onSubmit={guardarTelefono}>
            <label htmlFor="owner-whatsapp-phone">
              Número con código de país
              <input
                id="owner-whatsapp-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={22}
                value={telefonoWhatsApp}
                onChange={(event) => setTelefonoWhatsApp(event.target.value)}
                placeholder="+54 9 3704 123456"
                aria-describedby="owner-whatsapp-help"
              />
            </label>
            <small id="owner-whatsapp-help">
              Incluí el código de país y el prefijo, por ejemplo +54 9 para celulares argentinos.
            </small>
            {errorTelefono && <p className="mensaje-alerta mensaje-alerta--error" role="alert">{errorTelefono}</p>}
            {mensajeTelefono && <p className="mensaje-alerta mensaje-alerta--exito" role="status">{mensajeTelefono}</p>}
            <button className="button button-primary" type="submit" disabled={guardandoTelefono}>
              {guardandoTelefono ? "Guardando…" : "Guardar WhatsApp"}
            </button>
          </form>
        </section>

        <section className="owner-listings">
          <div className="owner-listings__heading">
            <div>
              <span className="section-kicker">GESTIONÁ TUS PUBLICACIONES</span>
              <h2>Mis alquileres</h2>
            </div>
            <Link className="button button-primary" to="/alquileres/nuevo">
              + Agregar alquiler
            </Link>
          </div>

          {error && (
            <div className="mensaje-alerta mensaje-alerta--error" role="alert">
              <p>{error}</p>
              <button className="button button-small button-accent" type="button" onClick={cargarPropiedades}>
                Intentar de nuevo
              </button>
            </div>
          )}
          {errorEliminar && <div className="mensaje-alerta mensaje-alerta--error" role="alert">{errorEliminar}</div>}
          {cargando && <p className="estado-carga">Cargando tus publicaciones…</p>}
          {!cargando && !error && propiedades.length === 0 && (
            <div className="owner-empty-state">
              <span className="owner-empty-state__icon" aria-hidden="true">+</span>
              <h3>Tu próximo alquiler empieza acá</h3>
              <p>Publicá tu primera propiedad para que estudiantes puedan encontrarla.</p>
              <Link className="button button-primary" to="/alquileres/nuevo">Publicar propiedad</Link>
            </div>
          )}
          {!cargando && !error && propiedades.length > 0 && (
            <div className="owner-property-grid">
              {propiedades.map((propiedad) => (
                <TarjetaPropiedad
                  key={propiedad.id}
                  propiedad={propiedad}
                  onEliminar={eliminar}
                  eliminando={eliminandoId === propiedad.id}
                />
              ))}
              <Link className="owner-add-card" to="/alquileres/nuevo">
                <span className="owner-add-card__icon" aria-hidden="true">+</span>
                <strong>Publicar otro alquiler</strong>
                <span>Sumá una propiedad a tu catálogo</span>
              </Link>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <p>© 2026 Alquileres Formosa</p>
        <div><Link to="/alquileres">Ver alquileres</Link></div>
      </footer>
    </div>
  );
}
