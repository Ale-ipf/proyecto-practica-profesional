import { useState } from "react";
import { Link } from "react-router-dom";

const iconPaths = {
  home: "M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6",
  user: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  search: "m20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  map: "M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15",
  school: "m3 9 9-5 9 5-9 5-9-5Zm3 3v5c3 2 9 2 12 0v-5m3-3v6",
  guide: "M12 3v3m0 12v3m9-9h-3M6 12H3m15.36-6.36-2.12 2.12m-8.48 8.48-2.12 2.12m12.72 0-2.12-2.12M7.76 7.76 5.64 5.64M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z",
  shield: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-3-11 2 2 4-4",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 1 1 8 0v4",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v3m0 14v3m10-10h-3M5 12H2m17.07-7.07-2.12 2.12M7.05 16.95l-2.12 2.12m14.14 0-2.12-2.12M7.05 7.05 4.93 4.93",
  plus: "M12 5v14m-7-7h14",
  building: "M3 21h18M5 21V7l7-4 7 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4",
  arrow: "M5 12h14m-7-7 7 7-7 7",
  logout: "M10 17l5-5-5-5m5 5H3m10-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M18 6 6 18",
  check: "m5 12 4 4L19 6",
  homePin: "M3 10.5 12 3l9 7.5M5.5 9v11h13V9m-6.5 11v-5h-3v5",
};

export function DashboardIcon({ name, size = 20 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconPaths[name] || iconPaths.arrow} />
    </svg>
  );
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toLocaleUpperCase("es-AR"))
      .join("") || "AF"
  );
}

export function StatusBadge({ positive, children }) {
  return (
    <span className={`dashboard-status${positive ? " is-positive" : ""}`}>
      {positive && <DashboardIcon name="check" size={14} />}
      {children}
    </span>
  );
}

export function UserProfileCard({ user, roleLabel, compact = false }) {
  const verified = Boolean(user?.emailVerified && user?.phoneVerified);
  return (
    <section
      className={`dashboard-user-card${compact ? " is-compact" : ""}`}
      aria-label="Perfil de usuario"
    >
      <span className="dashboard-avatar" aria-hidden="true">
        {getInitials(user?.name)}
      </span>
      <div className="dashboard-user-card__details">
        <strong>{user?.name || "Usuario"}</strong>
        <span>{roleLabel}</span>
      </div>
      <StatusBadge positive={verified}>
        {verified ? "Verificada" : "Verificación pendiente"}
      </StatusBadge>
      {!compact && (
        <div className="dashboard-user-card__contact">
          <span>{user?.email || "Correo no informado"}</span>
          {user?.phone && <span>{user.phone}</span>}
        </div>
      )}
    </section>
  );
}

export function DashboardSection({ eyebrow, title, description, action, children }) {
  return (
    <section className="dashboard-section">
      {(eyebrow || title || description || action) && (
        <header className="dashboard-section__header">
          <div>
            {eyebrow && <span className="dashboard-eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function QuickAccessCard({ to, icon, title, description }) {
  return (
    <Link className="dashboard-quick-card" to={to}>
      <span className="dashboard-quick-card__icon">
        <DashboardIcon name={icon} />
      </span>
      <span className="dashboard-quick-card__copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <DashboardIcon name="arrow" size={18} />
    </Link>
  );
}

export function DashboardPropertyCard({ property, owner = false, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const image = property.images?.[0]?.url || property.imageUrl;
  const price = Number(property.price);
  const hasPrice = property.price != null && Number.isFinite(price);
  const statusLabel = property.status === "rented"
    ? "Alquilada"
    : property.status === "available"
      ? "Disponible"
      : "Estado sin informar";
  const hasAvailability = property.status === "available";
  const bedroomsLabel = property.bedrooms === 1
    ? "Monoambiente"
    : property.bedrooms
      ? `${property.bedrooms} ambientes`
      : "Ambientes sin informar";

  const deleteProperty = async () => {
    if (!window.confirm(`¿Querés eliminar la publicación "${property.title}"?`)) {
      return;
    }

    setDeleting(true);
    setDeleteError("");
    try {
      await onDelete(property.id);
    } catch (error) {
      setDeleteError(error.message || "No pudimos eliminar la publicación.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="dashboard-property-card">
      <Link
        className="dashboard-property-card__image"
        to={`/alquileres/${property.id}`}
        aria-label={`Ver ${property.title}`}
      >
        {image ? (
          <img src={image} alt={`Foto de ${property.title}`} loading="lazy" />
        ) : (
          <DashboardIcon name="building" size={32} />
        )}
        <StatusBadge positive={hasAvailability}>
          {statusLabel}
        </StatusBadge>
      </Link>
      <div className="dashboard-property-card__body">
        <span className="dashboard-property-card__location">
          {property.address || property.city || "Ubicación no informada"}
        </span>
        <h3>
          <Link to={`/alquileres/${property.id}`}>{property.title}</Link>
        </h3>
        <div className="dashboard-property-card__facts">
          <span>{bedroomsLabel}</span>
          {property.available_spots != null && (
            <span>{property.available_spots} cupos disponibles</span>
          )}
        </div>
        {hasPrice ? (
          <strong className="dashboard-property-card__price">
            ${price.toLocaleString("es-AR")}
            <small> / mes</small>
          </strong>
        ) : (
          <span className="dashboard-property-card__location">
            Precio no informado
          </span>
        )}
        <div className="dashboard-property-card__actions">
          <Link className="dashboard-button dashboard-button--secondary" to={`/alquileres/${property.id}`}>
            Ver detalle
          </Link>
          {owner && (
            <>
              <Link className="dashboard-button dashboard-button--secondary" to={`/alquileres/${property.id}/editar`}>
                Editar
              </Link>
              <Link className="dashboard-button dashboard-button--primary" to={`/alquileres/${property.id}/gestion`}>
                Administrar
              </Link>
              {onDelete && (
                <button
                  className="dashboard-button dashboard-button--secondary"
                  type="button"
                  onClick={deleteProperty}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando…" : "Eliminar"}
                </button>
              )}
            </>
          )}
        </div>
        {deleteError && (
          <p className="dashboard-message is-error" role="alert">
            {deleteError}
          </p>
        )}
      </div>
    </article>
  );
}

export default function DashboardLayout({
  user,
  roleLabel,
  navigation,
  activeKey,
  onLogout,
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const profileTarget = user?.role === "owner"
    ? "/perfil-dueno"
    : "/panel-estudiante?section=profile";

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="dashboard-shell">
      {menuOpen && (
        <button
          className="dashboard-backdrop"
          type="button"
          aria-label="Cerrar menú"
          onClick={closeMenu}
        />
      )}
      <aside className={`dashboard-sidebar${menuOpen ? " is-open" : ""}`}>
        <Link className="dashboard-brand" to="/">
          <span className="dashboard-brand__mark">
            <DashboardIcon name="homePin" size={23} />
          </span>
          <span>
            <strong>ALQUILERES</strong>
            <small>FORMOSA</small>
          </span>
        </Link>

        <UserProfileCard user={user} roleLabel={roleLabel} compact />

        <nav className="dashboard-navigation" aria-label="Navegación del panel">
          <span className="dashboard-navigation__label">MENÚ PRINCIPAL</span>
          {navigation.map((item) => {
            const active = item.key === activeKey;
            return (
              <Link
                key={`${item.key}-${item.to}`}
                className={`dashboard-navigation__link${active ? " is-active" : ""}`}
                to={item.to}
                aria-current={active ? "page" : undefined}
                onClick={closeMenu}
              >
                <DashboardIcon name={item.icon} size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          className="dashboard-navigation__link dashboard-logout"
          type="button"
          onClick={() => {
            closeMenu();
            onLogout();
          }}
        >
          <DashboardIcon name="logout" size={19} />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="dashboard-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <DashboardIcon name={menuOpen ? "close" : "menu"} />
          </button>
          <Link className="dashboard-topbar__brand" to="/">
            Alquileres <strong>Formosa</strong>
          </Link>
          <div className="dashboard-topbar__user">
            <span>{user?.name || "Usuario"}</span>
            <Link to={profileTarget} aria-label="Ir a mi perfil">
              <span className="dashboard-avatar dashboard-avatar--small" aria-hidden="true">
                {getInitials(user?.name)}
              </span>
            </Link>
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
