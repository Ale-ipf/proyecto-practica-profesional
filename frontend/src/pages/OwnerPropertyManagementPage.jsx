import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerPropiedad } from "../api/properties.js";
import {
  actualizarPagoDelAlquiler,
  agregarPersonaAlAlquiler,
  eliminarPersonaDelAlquiler,
  listarPersonasDelAlquiler,
} from "../api/property-tenants.js";

const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatPaymentDate = (value) => {
  if (!value) return "";
  const dateParts = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(value));
  const date = Object.fromEntries(dateParts.map(({ type, value: part }) => [type, part]));
  return `${date.day}-${date.month}-${date.year}`;
};

const formatPeriod = (period) =>
  new Date(`${period}-01T12:00:00`).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

export default function OwnerPropertyManagementPage({ usuario }) {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [propertyError, setPropertyError] = useState("");
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [activeSection, setActiveSection] = useState("personas");
  const [period, setPeriod] = useState(currentPeriod);
  const [tenants, setTenants] = useState([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [tenantsError, setTenantsError] = useState("");
  const [email, setEmail] = useState("");
  const [addingTenant, setAddingTenant] = useState(false);
  const [updatingTenantId, setUpdatingTenantId] = useState(null);
  const [message, setMessage] = useState("");
  const tenantsRequest = useRef(0);

  const isOwner =
    usuario?.role === "owner" &&
    String(property?.owner?.id) === String(usuario?.id);

  const loadTenants = useCallback(async () => {
    const requestId = ++tenantsRequest.current;
    setLoadingTenants(true);
    setTenantsError("");
    try {
      const data = await listarPersonasDelAlquiler(id, period);
      if (requestId === tenantsRequest.current) setTenants(data.tenants || []);
    } catch (error) {
      if (requestId === tenantsRequest.current) {
        setTenantsError(error.message || "No pudimos cargar las personas del alquiler.");
      }
    } finally {
      if (requestId === tenantsRequest.current) setLoadingTenants(false);
    }
  }, [id, period]);

  useEffect(() => {
    let cancelled = false;
    obtenerPropiedad(id)
      .then(({ property: result }) => {
        if (cancelled) return;
        if (
          usuario?.role !== "owner" ||
          String(result.owner?.id) !== String(usuario?.id)
        ) {
          setPropertyError("Solo el dueño de la publicación puede administrarla.");
          return;
        }
        setProperty(result);
      })
      .catch((error) => {
        if (!cancelled) {
          setPropertyError(error.message || "No pudimos cargar el alquiler.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProperty(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, usuario]);

  useEffect(() => {
    if (isOwner) loadTenants();
  }, [isOwner, loadTenants]);

  const addTenant = async (event) => {
    event.preventDefault();
    setAddingTenant(true);
    setTenantsError("");
    setMessage("");
    try {
      await agregarPersonaAlAlquiler(id, email.trim());
      setEmail("");
      setMessage("La persona se agregó al alquiler.");
      await loadTenants();
    } catch (error) {
      setTenantsError(error.message || "No pudimos agregar a esta persona.");
    } finally {
      setAddingTenant(false);
    }
  };

  const removeTenant = async (tenant) => {
    if (!window.confirm(`¿Querés quitar a ${tenant.user.name} de este alquiler?`)) {
      return;
    }
    setUpdatingTenantId(tenant.id);
    setTenantsError("");
    setMessage("");
    try {
      await eliminarPersonaDelAlquiler(id, tenant.id);
      setMessage("La persona se quitó del alquiler.");
      await loadTenants();
    } catch (error) {
      setTenantsError(error.message || "No pudimos quitar a esta persona.");
    } finally {
      setUpdatingTenantId(null);
    }
  };

  const togglePayment = async (tenant) => {
    setUpdatingTenantId(tenant.id);
    setTenantsError("");
    setMessage("");
    try {
      await actualizarPagoDelAlquiler(id, tenant.id, period, !tenant.paid);
      await loadTenants();
    } catch (error) {
      setTenantsError(error.message || "No pudimos actualizar el estado del pago.");
    } finally {
      setUpdatingTenantId(null);
    }
  };

  if (loadingProperty) {
    return <main className="owner-management"><p className="muted">Cargando alquiler…</p></main>;
  }
  if (propertyError || !property || !isOwner) {
    return (
      <main className="owner-management">
        <p className="error-message" role="alert">
          {propertyError || "No pudimos cargar el alquiler."}
        </p>
        <Link className="button button-primary" to="/panel-dueno">Volver a mis alquileres</Link>
      </main>
    );
  }

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">Alquileres Formosa</Link>
        <Link className="button button-accent" to="/panel-dueno">Volver a mis alquileres</Link>
      </header>
      <main className="owner-management">
        <span className="section-kicker">GESTIÓN DEL ALQUILER</span>
        <h1>{property.title}</h1>
        <p className="muted">{property.address}, {property.city}</p>

        <div className="owner-management__tabs" role="tablist" aria-label="Apartados del alquiler">
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === "informacion"}
            className={activeSection === "informacion" ? "is-active" : ""}
            onClick={() => setActiveSection("informacion")}
          >
            Información del alquiler
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSection === "personas"}
            className={activeSection === "personas" ? "is-active" : ""}
            onClick={() => setActiveSection("personas")}
          >
            Personas
          </button>
        </div>

        {activeSection === "informacion" ? (
          <section className="owner-management__panel" role="tabpanel">
            <div className="owner-management__section-heading">
              <div>
                <h2>Información del alquiler</h2>
                <p className="muted">Revisá los datos publicados y actualizalos cuando lo necesites.</p>
              </div>
              <Link
                className="button button-primary"
                to={`/alquileres/${property.id}/editar`}
                state={{ returnTo: `/alquileres/${property.id}/gestion` }}
              >
                Editar información
              </Link>
            </div>
            <dl className="owner-management__property-info">
              <div><dt>Precio mensual</dt><dd>${Number(property.price).toLocaleString("es-AR")}</dd></div>
              <div><dt>Estado</dt><dd>{property.status === "rented" ? "Alquilado" : "Disponible"}</dd></div>
              <div><dt>Espacios libres</dt><dd>{property.available_spots}</dd></div>
              <div><dt>Ambientes</dt><dd>{property.bedrooms}</dd></div>
              <div><dt>Amoblado</dt><dd>{property.is_furnished ? "Sí" : "No"}</dd></div>
              <div><dt>Descripción</dt><dd>{property.description}</dd></div>
            </dl>
          </section>
        ) : (
          <section className="owner-management__panel" role="tabpanel">
            <div className="owner-management__section-heading">
              <div>
                <h2>Personas del alquiler</h2>
                <p className="muted">Agregá estudiantes con cuenta registrada y controlá el pago de cada mes.</p>
              </div>
              <label className="owner-management__period">
                <span>Mes a consultar</span>
                <input
                  type="month"
                  value={period}
                      required
                  onChange={(event) => {
                    setPeriod(event.target.value);
                    setMessage("");
                  }}
                  aria-label="Mes de alquiler"
                />
              </label>
            </div>
            <form className="owner-management__add-form" onSubmit={addTenant}>
              <label>
                <span>Email de la cuenta del estudiante</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="estudiante@ejemplo.com"
                  required
                />
              </label>
              <button className="button button-primary" type="submit" disabled={addingTenant}>
                {addingTenant ? "Agregando…" : "Agregar persona"}
              </button>
            </form>

            {message && <p className="mensaje-alerta mensaje-alerta--exito" role="status">{message}</p>}
            {tenantsError && <p className="error-message" role="alert">{tenantsError}</p>}
            {loadingTenants && <p className="muted">Cargando personas…</p>}
            {!loadingTenants && !tenantsError && tenants.length === 0 && (
              <div className="owner-management__empty">
                <h3>Todavía no hay personas agregadas</h3>
                <p className="muted">Ingresá el email de una cuenta de estudiante para sumarla a este alquiler.</p>
              </div>
            )}
            {!loadingTenants && !tenantsError && tenants.length > 0 && (
              <div className="owner-management__tenant-list">
                <div className="owner-management__list-heading">
                  <h3>Estado de {formatPeriod(period)}</h3>
                  <span>{tenants.length} {tenants.length === 1 ? "persona" : "personas"}</span>
                </div>
                {tenants.map((tenant) => (
                  <article className="owner-management__tenant" key={tenant.id}>
                    <div className="owner-management__tenant-info">
                      <strong>{tenant.user.name}</strong>
                      <span>{tenant.user.email}</span>
                    </div>
                    <div className="owner-management__tenant-payment">
                      <span className={tenant.paid ? "payment-status payment-status--paid" : "payment-status"}>
                        {tenant.paid ? "Pagó" : "Pendiente"}
                      </span>
                      {tenant.paid && <small>Registrado el {formatPaymentDate(tenant.paidAt)}</small>}
                      <button
                        type="button"
                        className="button button-small button-accent"
                        onClick={() => togglePayment(tenant)}
                        disabled={updatingTenantId === tenant.id}
                      >
                        {updatingTenantId === tenant.id
                          ? "Guardando…"
                          : tenant.paid
                            ? "Marcar pendiente"
                            : "Marcar pagado"}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="button button-small button-outline-danger"
                      onClick={() => removeTenant(tenant)}
                      disabled={updatingTenantId === tenant.id}
                    >
                      Quitar
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
