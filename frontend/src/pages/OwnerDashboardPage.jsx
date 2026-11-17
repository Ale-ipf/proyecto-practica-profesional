import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import DashboardLayout, {
  DashboardPropertyCard,
  DashboardSection,
  QuickAccessCard,
} from "../components/DashboardLayout.jsx";
import { OWNER_NAVIGATION } from "../components/dashboardNavigation.js";
import { useAuth } from "../context/AuthContext.jsx";
import { eliminarPropiedad, listarMisPropiedades } from "../api/properties.js";
import { ApiRequestError } from "../api/client.js";
import { imagenHero } from "../data/appData.js";

export default function OwnerDashboardPage() {
  const { usuario, logout } = useAuth();
  const { hash } = useLocation();
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPropiedades = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await listarMisPropiedades();
      setPropiedades(data.properties);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos cargar tus propiedades.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.role !== "owner") return;
    cargarPropiedades();
  }, [cargarPropiedades, usuario?.role]);

  const eliminarPublicacion = async (id) => {
    try {
      await eliminarPropiedad(id);
      setPropiedades((actuales) =>
        actuales.filter((propiedad) => String(propiedad.id) !== String(id)),
      );
    } catch (requestError) {
      throw new Error(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos eliminar la propiedad.",
        { cause: requestError },
      );
    }
  };

  if (!usuario) return <Navigate to="/login-and-registration" replace />;
  if (usuario.role !== "owner") return <Navigate to="/panel-estudiante" replace />;

  const disponibles = propiedades.filter(
    (propiedad) => propiedad.status === "available",
  ).length;
  const alquiladas = propiedades.filter(
    (propiedad) => propiedad.status === "rented",
  ).length;
  return (
    <DashboardLayout
      user={usuario}
      roleLabel="Cuenta de propietario"
      navigation={OWNER_NAVIGATION}
      activeKey={hash === "#propiedades" ? "properties" : "dashboard"}
      onLogout={logout}
    >
      <section className="dashboard-welcome">
        <img src={imagenHero} alt="" aria-hidden="true" />
        <div className="dashboard-welcome__content">
          <span className="dashboard-eyebrow">PANEL DEL PROPIETARIO</span>
          <h1>¡Hola de nuevo, {usuario.name || "propietario"}!</h1>
          <p>
            Administrá tus propiedades y gestioná tus alquileres desde un solo lugar.
          </p>
        </div>
      </section>

      <DashboardSection eyebrow="RESUMEN" title="Tu actividad">
        <div className="dashboard-stats-grid">
          <article className="dashboard-stat">
            <span>Propiedades publicadas</span>
            <strong>{cargando || error ? "—" : propiedades.length}</strong>
          </article>
          <article className="dashboard-stat">
            <span>Disponibles</span>
            <strong>{cargando || error ? "—" : disponibles}</strong>
          </article>
          <article className="dashboard-stat">
            <span>Alquiladas</span>
            <strong>{cargando || error ? "—" : alquiladas}</strong>
          </article>
        </div>
      </DashboardSection>

      <DashboardSection eyebrow="ACCESOS DIRECTOS" title="¿Qué necesitás hacer?">
        <div className="dashboard-quick-grid">
          <QuickAccessCard
            to="/panel-dueno#propiedades"
            icon="building"
            title="Mis propiedades"
            description="Consultá el estado de tus publicaciones."
          />
          <QuickAccessCard
            to="/alquileres/nuevo"
            icon="plus"
            title="Publicar propiedad"
            description="Sumá un nuevo inmueble a la plataforma."
          />
          <QuickAccessCard
            to="/panel-dueno#propiedades"
            icon="settings"
            title="Administrar alquileres"
            description="Gestioná estudiantes y pagos de tus alquileres."
          />
          <QuickAccessCard
            to="/perfil-dueno"
            icon="user"
            title="Mi perfil"
            description="Actualizá tus datos y verificaciones."
          />
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="TUS PUBLICACIONES"
        title="Mis propiedades"
        description="Revisá disponibilidad, información y gestión de cada publicación."
        action={
          <Link className="dashboard-button dashboard-button--primary" to="/alquileres/nuevo">
            <span aria-hidden="true">+</span> Publicar propiedad
          </Link>
        }
      >
        <div id="propiedades">
          {cargando && <p className="dashboard-message">Cargando tus propiedades…</p>}
          {!cargando && error && (
            <p className="dashboard-message is-error" role="alert">
              {error}
            </p>
          )}
          {!cargando && !error && propiedades.length === 0 && (
            <div className="dashboard-empty">
              <h3>Todavía no publicaste propiedades</h3>
              <p>Cuando publiques un alquiler, aparecerá acá para que puedas administrarlo.</p>
              <Link className="dashboard-button dashboard-button--primary" to="/alquileres/nuevo">
                Publicar mi primera propiedad
              </Link>
            </div>
          )}
          {!cargando && !error && propiedades.length > 0 && (
            <div className="dashboard-property-grid">
              {propiedades.map((propiedad) => (
                <DashboardPropertyCard
                  key={propiedad.id}
                  property={propiedad}
                  owner
                  onDelete={eliminarPublicacion}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardSection>
    </DashboardLayout>
  );
}
