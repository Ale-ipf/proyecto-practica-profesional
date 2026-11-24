import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import "./styles/App.css";
import PropertyCard from "./components/PropertyCard";
import PropertyDetails from "./components/PropertyDetails";
import PropertyFormPage from "./components/PropertyFromPage";
import AppAssistant from "./components/AppAssistant.jsx";
import PropertyMapPage from "./components/PropertyMapPage";
import CrimeMapPage from "./components/CrimeMapPage";
import InstitutionCarousel from "./components/InstitutionCarousel";
import FeatureCarousel from "./components/FeatureCarousel";
import MapPreview from "./components/MapPreview";
import LoginAndRegistrationPage from "./pages/LoginAndRegistrationPage.jsx";
import OwnerProfilePage from "./pages/OwnerProfilePage.jsx";
import GuidedRentalGuidePage from "./pages/GuidedRentalGuidePage.jsx";
import SafetyTipsPage from "./pages/SafetyTipsPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage.jsx";
import OwnerPropertyManagementPage from "./pages/OwnerPropertyManagementPage.jsx";
import OwnerGuaranteeDocumentsPage from "./pages/OwnerGuaranteeDocumentsPage.jsx";
import PropertyForumPage from "./pages/PropertyForumPage.jsx";
import { useAuth } from "./context/useAuth.js";
import {
  listarPropiedades,
  listarMisPropiedades,
  obtenerPropiedad,
  crearPropiedad,
  actualizarPropiedad,
  eliminarPropiedad,
  agregarImagenes,
  eliminarImagen,
  subirImagenesPropiedad,
} from "./api/properties";
import {
  listarInstituciones,
  normalizarInstituciones,
} from "./api/institutions";

const barrios = ["Centro", "San Miguel", "Guadalupe", "UNaF"];
const PROPERTY_PAGE_SIZE = 9;
const API_PAGE_SIZE = 100;
const INITIAL_FILTERS = {
  barrio: "Todos",
  ambientes: "Todos",
  orden: "Defecto",
  aceptaMascotas: false,
  soloVerificados: false,
  convivencia: "Todos",
  soloConDocumentacion: false,
  tipo: "Todos",
  amoblamiento: "Todos",
  soloConWifi: false,
  soloConCable: false,
  ventilacion: "Todos",
  modalidad: "Todos",
  soloFavoritos: false,
};

function normalizarParadas(busStops) {
  if (Array.isArray(busStops)) return busStops;

  if (typeof busStops === "string") {
    try {
      const parsed = JSON.parse(busStops);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizarPropiedad(property) {
  const owner = property.owner || {};
  const address = property.address || "";

  return {
    ...property,
    id: property.id,
    titulo: property.title,
    descripcion: property.description,
    precio: Number(property.price),
    barrio: address.match(/Barrio ([^,]+)/i)?.[1] || property.city || "Formosa",
    direccion: address,
    ambientes: Number(property.bedrooms) || 1,
    cuposDisponibles: Number(property.available_spots ?? 1),
    tipoInmueble: property.owner_type === "agency" ? "Inmobiliaria" : "Directo",
    aceptaMascotas: property.allows_pets,
    tieneWifi: property.has_wifi,
    tieneCable: property.has_cable,
    tieneVentilador: property.has_fan,
    tieneAire:
      property.has_air_conditioning ??
      /aire acondicionado/i.test(property.description || ""),
    verificado: Boolean(property.owner?.verified),
    tieneDocumentacion: Boolean(property.owner?.hasDocumentation),
    modalidad: property.is_shared == null
      ? "Sin especificar"
      : property.is_shared
        ? "Compartido"
        : "Solo",
    amoblado: Boolean(property.is_furnished),
    imagen: property.images?.[0]?.url || property.imageUrl || "",
    coordenadas:
      property.latitude != null && property.longitude != null
        ? [Number(property.latitude), Number(property.longitude)]
        : null,
    dueno: owner.name || "Propietario",
    propietario: { ...owner, id: owner.id, nombre: owner.name },
    estado: property.status,
  };
}

const rolDeUsuario = (usuario) => usuario?.role;
const nombreDeUsuario = (usuario) => usuario?.name || "Usuario";

function useInstituciones() {
  const [instituciones, setInstituciones] = useState([]);
  const [cargandoInstituciones, setCargandoInstituciones] = useState(true);
  const [errorInstituciones, setErrorInstituciones] = useState("");

  useEffect(() => {
    let cancelado = false;
    listarInstituciones()
      .then((data) => {
        if (!cancelado) {
          setInstituciones(
            (data.institutions || []).map((institution) => ({
              ...institution,
              abreviatura: institution.abbreviation,
              nombre: institution.name,
              tipo: institution.type,
              coordenadas: [
                Number(institution.latitude),
                Number(institution.longitude),
              ],
              paradas: normalizarParadas(institution.busStops).map((stop) => ({
                ...stop,
                coordenadas: [Number(stop.latitude), Number(stop.longitude)],
              })),
            })),
          );
        }
      })
      .catch((requestError) => {
        if (!cancelado)
          setErrorInstituciones(
            requestError.message ||
              "No pudimos cargar las instituciones educativas.",
          );
      })
      .finally(() => {
        if (!cancelado) setCargandoInstituciones(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { instituciones, cargandoInstituciones, errorInstituciones };
}

function Header({ usuario, onLogout }) {
  const { pathname } = useLocation();

  return (
    <header className={`site-header${usuario ? " is-authenticated" : ""}`}>
      <Link className="brand-title" to="/">
        Alquileres Formosa <span aria-hidden="true"></span>
      </Link>
      {!usuario && (
        <nav className="main-nav" aria-label="Navegación principal">
          {pathname !== "/alquileres" && <Link to="/alquileres">Alquileres</Link>}
        </nav>
      )}
      <div className="header-actions">
        {usuario ? (
          <>
            <span className="greeting">Hola, {nombreDeUsuario(usuario)}</span>
            <Link
              className="button button-primary"
              to={
                rolDeUsuario(usuario) === "owner"
                  ? "/panel-dueno"
                  : "/panel-estudiante"
              }
            >
              {rolDeUsuario(usuario) === "owner"
                ? "👤 Mi panel"
                : "🎓 Mi panel"}
            </Link>
            {rolDeUsuario(usuario) === "owner" && (
                <Link className="button button-accent" to="/perfil-dueno">
                  Mi perfil
                </Link>
            )}
            <button
              className="button button-outline-danger"
              type="button"
              onClick={onLogout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link className="button button-primary" to="/login-and-registration">
            Acceder
          </Link>
        )}
      </div>
    </header>
  );
}

function Filters({ filters, setFilters, mostrarFavoritos, sesionActiva }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modalOpen]);

  const update = (event) =>
    setFilters({
      ...filters,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  const updateDraft = (event) =>
    setDraftFilters((current) => ({
      ...current,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  const openModal = () => {
    setDraftFilters(filters);
    setModalOpen(true);
  };
  const limpiarFiltros = () => {
    setFilters({ ...INITIAL_FILTERS });
    setDraftFilters({ ...INITIAL_FILTERS });
  };
  const checkboxFilter = (name, label) => (
    <label className="checkbox-label" key={name}>
      <input
        type="checkbox"
        name={name}
        checked={draftFilters[name]}
        onChange={updateDraft}
      />
      {label}
    </label>
  );

  return (
    <section className="panel filters-panel">
      <div className="filter-heading">
        <div>
          <span className="section-kicker">EXPLORAR PROPIEDADES</span>
          <h2>Encontrá tu próximo alquiler</h2>
          <p className="filter-description">
            Usá los filtros para encontrar una propiedad que se adapte a vos.
          </p>
        </div>
        <div className="filter-heading-actions">
          <button className="button button-accent" type="button" onClick={openModal}>
            Ver más filtros
          </button>
        </div>
      </div>
      <div className="form-grid filter-grid">
        <label>
          <span>Barrio</span>
          <select name="barrio" value={filters.barrio} onChange={update}>
            <option value="Todos">Todos los barrios</option>
            {barrios.map((barrio) => (
              <option key={barrio} value={barrio}>
                {barrio === "UNaF" ? "Cerca de la UNaF" : barrio}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Ambientes</span>
          <select name="ambientes" value={filters.ambientes} onChange={update}>
            <option value="Todos">Cualquier cantidad</option>
            <option value="1">Monoambiente</option>
            <option value="2">2 ambientes</option>
            <option value="3">3 ambientes</option>
          </select>
        </label>
        <label>
          <span>Precio</span>
          <select name="orden" value={filters.orden} onChange={update}>
            <option value="Defecto">Sin ordenar</option>
            <option value="MenorMayor">Ascendente</option>
            <option value="MayorMenor">Descendente</option>
          </select>
        </label>
      </div>
      <div className="filter-actions-footer">
        <button className="clear-filters" type="button" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      {modalOpen && (
        <div
          className="advanced-filters-overlay"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <section
            className="advanced-filters-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="advanced-filters-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="advanced-filters-modal__heading">
              <div>
                <span className="section-kicker">PERSONALIZÁ TU BÚSQUEDA</span>
                <h2 id="advanced-filters-title">Más filtros</h2>
              </div>
              <button
                className="student-edit-modal-close"
                type="button"
                aria-label="Cerrar filtros"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </header>
            <div className="advanced-filters-grid">
              <label>
                Barrio
                <select name="barrio" value={draftFilters.barrio} onChange={updateDraft}>
                  <option value="Todos">Todos los barrios</option>
                  {barrios.map((barrio) => (
                    <option key={barrio} value={barrio}>
                      {barrio === "UNaF" ? "Cerca de la UNaF" : barrio}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Ambientes
                <select name="ambientes" value={draftFilters.ambientes} onChange={updateDraft}>
                  <option value="Todos">Cualquier cantidad</option>
                  <option value="1">Monoambiente</option>
                  <option value="2">2 ambientes</option>
                  <option value="3">3 ambientes</option>
                </select>
              </label>
              <label>
                Precio
                <select name="orden" value={draftFilters.orden} onChange={updateDraft}>
                  <option value="Defecto">Sin ordenar</option>
                  <option value="MenorMayor">Ascendente</option>
                  <option value="MayorMenor">Descendente</option>
                </select>
              </label>
              <label>
                Tipo de anunciante
                <select name="tipo" value={draftFilters.tipo} onChange={updateDraft}>
                  <option value="Todos">Dueño o inmobiliaria</option>
                  <option value="Directo">Dueño directo</option>
                  <option value="Inmobiliaria">Inmobiliaria</option>
                </select>
              </label>
              <label>
                Amoblamiento
                <select name="amoblamiento" value={draftFilters.amoblamiento} onChange={updateDraft}>
                  <option value="Todos">Cualquiera</option>
                  <option value="Amoblado">Amoblado</option>
                  <option value="Sin amoblar">Sin amoblar</option>
                </select>
              </label>
              <label>
                ¿Con quién querés alquilar?
                <select name="convivencia" value={draftFilters.convivencia} onChange={updateDraft}>
                  <option value="Todos">Sin preferencia</option>
                  <option value="Solo">Solo/a</option>
                  <option value="Acompanado">Con otra persona</option>
                </select>
              </label>
              <label>
                Modalidad de la publicación
                <select name="modalidad" value={draftFilters.modalidad} onChange={updateDraft}>
                  <option value="Todos">Compartida o privada</option>
                  <option value="Compartido">Compartida</option>
                  <option value="Solo">Solo</option>
                </select>
              </label>
              <label>
                Ventilación
                <select name="ventilacion" value={draftFilters.ventilacion} onChange={updateDraft}>
                  <option value="Todos">Cualquiera</option>
                  <option value="Ventilador">Ventilador</option>
                  <option value="Aire">Aire acondicionado</option>
                  <option value="Ambos">Ventilador y aire acondicionado</option>
                </select>
              </label>
              <div className="advanced-filters-checks">
                {checkboxFilter("aceptaMascotas", "Acepta mascotas")}
                {sesionActiva ? (
                  <>
                    {checkboxFilter("soloVerificados", "Cuenta verificada")}
                    {checkboxFilter("soloConDocumentacion", "Propietario con DNI cargado")}
                  </>
                ) : (
                  <p className="advanced-filters-auth-note">
                    <Link to="/login-and-registration">Iniciá sesión</Link> para
                    filtrar por verificación y documentación del propietario.
                  </p>
                )}
                {checkboxFilter("soloConWifi", "Wi-Fi")}
                {checkboxFilter("soloConCable", "Cable")}
                {mostrarFavoritos && checkboxFilter("soloFavoritos", "Ver mis favoritos")}
              </div>
            </div>
            <p className="advanced-filters-note">
              Mascotas, servicios y modalidad se filtran según lo declarado en
              cada publicación. Las cuentas verificadas tienen correo y
              teléfono confirmados.
            </p>
            <footer className="advanced-filters-modal__actions">
              <button className="clear-filters" type="button" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
              <button className="button button-accent" type="button" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button
                className="button button-primary"
                type="button"
                onClick={() => {
                  setFilters(draftFilters);
                  setModalOpen(false);
                }}
              >
                Aplicar filtros
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

function PropertyDetailsPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [propiedad, setPropiedad] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (rolDeUsuario(usuario) !== "student") {
      setFavoritos([]);
      return;
    }
    const almacenados = localStorage.getItem("alquileres-formosa-favorites");
    setFavoritos(almacenados ? JSON.parse(almacenados).map(Number) : []);
  }, [usuario]);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    obtenerPropiedad(id)
      .then((data) => {
        if (!cancelado) setPropiedad(normalizarPropiedad(data.property));
      })
      .catch((requestError) => {
        if (!cancelado)
          setError(requestError.message || "No pudimos cargar esta propiedad.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  const alternarFavorito = () => {
    const actualizados = favoritos.includes(Number(propiedad.id))
      ? favoritos.filter((favorito) => favorito !== Number(propiedad.id))
      : [...favoritos, Number(propiedad.id)];
    setFavoritos(actualizados);
    localStorage.setItem(
      "alquileres-formosa-favorites",
      JSON.stringify(actualizados),
    );
  };

  if (cargando)
    return (
      <InformativePage
        eyebrow="CARGANDO"
        title="Buscando la propiedad."
        description="Un momento, estamos consultando el servidor."
      />
    );

  if (error || !propiedad) {
    return (
      <InformativePage
        eyebrow="PROPIEDAD NO DISPONIBLE"
        title="No pudimos encontrar este alquiler."
        description={
          error || "Volvé al inicio para explorar las propiedades disponibles."
        }
      >
        <Link className="button button-primary" to="/alquileres">
          Ver alquileres
        </Link>
      </InformativePage>
    );
  }

  return (
    <PropertyDetails
      propiedad={propiedad}
      tieneSesion={Boolean(usuario)}
      esEstudiante={rolDeUsuario(usuario) === "student"}
      esPropietario={
        rolDeUsuario(usuario) === "owner" &&
        String(propiedad.owner?.id) === String(usuario?.id)
      }
      esFavorito={favoritos.includes(Number(propiedad.id))}
      onToggleFavorite={alternarFavorito}
    />
  );
}

function HomePage({ usuario, onLogout, vista = "inicio" }) {
  const { search: locationSearch } = useLocation();
  const { instituciones, cargandoInstituciones, errorInstituciones } =
    useInstituciones();
  const [favoritos, setFavoritos] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(locationSearch);
    return {
      ...INITIAL_FILTERS,
      soloFavoritos: params.get("favoritos") === "true",
    };
  });
  const mostrarVistaPrevia =
    vista === "perfil-estudiante" && rolDeUsuario(usuario) === "student";
  const esPropietario =
    vista !== "catalogo" && rolDeUsuario(usuario) === "owner";
  const cargarTodasLasPropiedades =
    vista === "catalogo" && !esPropietario && !mostrarVistaPrevia;

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const data = esPropietario
          ? await listarMisPropiedades()
          : await listarPropiedades({
              page: 1,
              limit: mostrarVistaPrevia
                ? 3
                : cargarTodasLasPropiedades
                  ? API_PAGE_SIZE
                  : 9,
              status: "available",
            });
        if (cancelado) return;
        let rows = data.properties || [];
        if (cargarTodasLasPropiedades) {
          const otherPages = await Promise.all(
            Array.from(
              { length: Math.max(0, (data.pagination?.totalPages || 1) - 1) },
              (_, index) =>
                listarPropiedades({
                  page: index + 2,
                  limit: API_PAGE_SIZE,
                  status: "available",
                }),
            ),
          );
          rows = [
            ...rows,
            ...otherPages.flatMap((page) => page.properties || []),
          ];
        }
        if (cancelado) return;
        const items = rows.map(normalizarPropiedad);
        setPropiedades(items);
      } catch (requestError) {
        if (!cancelado)
          setError(
            requestError.message ||
              "No pudimos cargar las propiedades. Revisá que el backend esté corriendo.",
          );
      } finally {
        if (!cancelado) setCargando(false);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, [usuario, esPropietario, mostrarVistaPrevia, cargarTodasLasPropiedades]);

  useEffect(() => {
    setPagina(1);
  }, [usuario, vista]);

  useEffect(() => {
    const params = new URLSearchParams(locationSearch);
    setFilters({
      ...INITIAL_FILTERS,
      soloFavoritos: params.get("favoritos") === "true",
    });
  }, [usuario, locationSearch]);

  useEffect(() => {
    if (rolDeUsuario(usuario) !== "student") return;
    const storedFavorites = localStorage.getItem(
      "alquileres-formosa-favorites",
    );
    setFavoritos(
      storedFavorites ? JSON.parse(storedFavorites).map(Number) : [],
    );
  }, [usuario]);

  const alquileres = esPropietario
    ? propiedades.filter(
        (propiedad) => String(propiedad.owner?.id) === String(usuario.id),
      )
    : propiedades.filter((propiedad) => propiedad.estado === "available");

  const alquileresFiltrados = useMemo(() => {
    const resultado = alquileres.filter((alquiler) => {
      const cumpleBarrio =
        filters.barrio === "Todos" || alquiler.barrio === filters.barrio;
      const cumpleAmbientes =
        filters.ambientes === "Todos" ||
        Number(alquiler.ambientes || 1) === Number(filters.ambientes);
      const cumpleMascotas =
        !filters.aceptaMascotas || alquiler.aceptaMascotas === true;
      const cumpleVerificacion =
        !filters.soloVerificados || alquiler.verificado;
      const cumpleConvivencia =
        filters.convivencia === "Todos" ||
        (filters.convivencia === "Solo" && alquiler.cuposDisponibles > 0) ||
        (filters.convivencia === "Acompanado" && alquiler.cuposDisponibles >= 2);
      const cumpleDocumentacion =
        !filters.soloConDocumentacion || alquiler.tieneDocumentacion;
      const cumpleTipoAnunciante =
        filters.tipo === "Todos" ||
        (alquiler.tipoInmueble || "Directo") === filters.tipo;
      const cumpleAmoblamiento =
        filters.amoblamiento === "Todos" ||
        (filters.amoblamiento === "Amoblado" && alquiler.amoblado) ||
        (filters.amoblamiento === "Sin amoblar" && !alquiler.amoblado);
      const cumpleWifi = !filters.soloConWifi || alquiler.tieneWifi === true;
      const cumpleCable = !filters.soloConCable || alquiler.tieneCable === true;
      const cumpleVentilacion =
        filters.ventilacion === "Todos" ||
        (filters.ventilacion === "Ventilador" &&
          alquiler.tieneVentilador === true &&
          alquiler.tieneAire !== true) ||
        (filters.ventilacion === "Aire" &&
          alquiler.tieneAire === true &&
          alquiler.tieneVentilador !== true) ||
        (filters.ventilacion === "Ambos" &&
          alquiler.tieneVentilador === true &&
          alquiler.tieneAire === true);
      const cumpleModalidad =
        filters.modalidad === "Todos" || alquiler.modalidad === filters.modalidad;
      const cumpleFavorito =
        !filters.soloFavoritos || favoritos.includes(Number(alquiler.id));
      return (
        cumpleBarrio &&
        cumpleAmbientes &&
        cumpleMascotas &&
        cumpleVerificacion &&
        cumpleConvivencia &&
        cumpleDocumentacion &&
        cumpleTipoAnunciante &&
        cumpleAmoblamiento &&
        cumpleWifi &&
        cumpleCable &&
        cumpleVentilacion &&
        cumpleModalidad &&
        cumpleFavorito
      );
    });
    return [...resultado].sort((a, b) =>
      filters.orden === "MenorMayor"
        ? a.precio - b.precio
        : filters.orden === "MayorMenor"
          ? b.precio - a.precio
          : 0,
    );
  }, [alquileres, favoritos, filters]);

  const totalPaginas =
    esPropietario || mostrarVistaPrevia
      ? 1
      : Math.max(1, Math.ceil(alquileresFiltrados.length / PROPERTY_PAGE_SIZE));
  const alquileresPaginados =
    esPropietario || mostrarVistaPrevia
      ? alquileresFiltrados
      : alquileresFiltrados.slice(
          (pagina - 1) * PROPERTY_PAGE_SIZE,
          pagina * PROPERTY_PAGE_SIZE,
        );

  const borrarPropiedad = async (id) => {
    await eliminarPropiedad(id);
    setPropiedades((actuales) =>
      actuales.filter((propiedad) => Number(propiedad.id) !== Number(id)),
    );
  };

  return (
    <div className="app-shell">
      <Header usuario={usuario} onLogout={onLogout} />
      {usuario && (
        <div className="welcome-bar">
          Hola, {nombreDeUsuario(usuario)}.
          <span>
            {esPropietario
              ? "Administrá tus propiedades desde tu panel."
              : "Encontrá tu próximo hogar en Formosa."}
          </span>
        </div>
      )}
      <main>
        {errorInstituciones && (
          <p className="error-message" role="alert">
            {errorInstituciones}
          </p>
        )}
        {!cargandoInstituciones &&
          instituciones.length === 0 &&
          !errorInstituciones && (
            <p className="muted">
              Todavía no hay instituciones educativas cargadas.
            </p>
          )}
        {vista !== "catalogo" && (
          <>
            <FeatureCarousel />
            <section className="guided-guide-prompt">
              <h2>¿No sabés por dónde comenzar? Probá la Guía Asistida</h2>
              <Link className="button button-primary" to="/guia-asistida">
                Ir ahora
              </Link>
            </section>
          </>
        )}
        {vista !== "catalogo" && !esPropietario && instituciones.length > 0 && (
          <InstitutionCarousel
            instituciones={instituciones}
            propiedades={propiedades}
          />
        )}
        {vista === "catalogo" && (
          <>
            <div className="listings-toolbar" id="alquileres">
              <div>
                <span className="section-kicker">
                  {esPropietario ? "MIS PUBLICACIONES" : "CATÁLOGO DISPONIBLE"}
                </span>
                <h2>
                  {esPropietario
                    ? "Mis alquileres"
                    : mostrarVistaPrevia
                      ? "Alquileres destacados"
                      : "Alquileres disponibles en Formosa"}
                </h2>
              </div>
              {esPropietario && (
                <Link className="button button-primary" to="/alquileres/nuevo">
                  + Agregar alquiler
                </Link>
              )}
              {mostrarVistaPrevia && (
                <Link className="button button-primary" to="/alquileres">
                  Ver todos los alquileres
                </Link>
              )}
            </div>
            {!esPropietario && !mostrarVistaPrevia && (
              <Filters
                filters={filters}
                setFilters={(nextFilters) => {
                  setFilters(nextFilters);
                  setPagina(1);
                }}
                mostrarFavoritos={rolDeUsuario(usuario) === "student"}
                sesionActiva={Boolean(usuario)}
              />
            )}
            <section className="listings-section">
              {cargando && <p className="muted">Cargando propiedades…</p>}
              {error && <p className="error-message">{error}</p>}
              {!cargando && !error && !alquileres.length && (
                <p className="muted">No hay propiedades para mostrar.</p>
              )}
              <div className="property-grid">
                {!cargando &&
                  alquileresPaginados.map((alquiler) => (
                    <PropertyCard
                      key={alquiler.id}
                      propiedad={alquiler}
                      usuario={usuario}
                      favoritos={favoritos}
                      onDelete={borrarPropiedad}
                    />
                  ))}
              </div>
              {!cargando && !!alquileres.length && !alquileresFiltrados.length && (
                <p className="empty-message">
                  No encontramos alquileres con esos filtros. Probá quitar alguno o elegir otro barrio.
                </p>
              )}
              {!esPropietario && !mostrarVistaPrevia && totalPaginas > 1 && (
                <nav
                  className="pagination-controls"
                  aria-label="Paginación de propiedades"
                >
                  <button
                    type="button"
                    disabled={pagina <= 1}
                    onClick={() => setPagina((current) => current - 1)}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {pagina} de {totalPaginas}
                  </span>
                  <button
                    type="button"
                    disabled={pagina >= totalPaginas}
                    onClick={() => setPagina((current) => current + 1)}
                  >
                    Siguiente
                  </button>
                </nav>
              )}
              {!mostrarVistaPrevia && !esPropietario && (
                <MapPreview propiedades={propiedades} />
              )}
            </section>
          </>
        )}
      </main>
      <footer className="site-footer">
        <p>© 2026 Alquileres Formosa</p>
        <div>
          <Link to="/alquileres">Ver alquileres</Link>
          <Link to="/consejos-seguridad">Consejos de seguridad</Link>
        </div>
      </footer>
    </div>
  );
}

function InformativePage({ eyebrow, title, description, children }) {
  return (
    <div className="app-shell route-page-shell">
      <Header usuario={null} />
      <main className="route-page">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="route-description">{description}</p>
        {children}
      </main>
    </div>
  );
}

function EditPropertyRoute({ usuario, onSave }) {
  const { id } = useParams();
  const [propiedad, setPropiedad] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    obtenerPropiedad(id)
      .then((data) => {
        if (!cancelado) setPropiedad(normalizarPropiedad(data.property));
      })
      .catch((requestError) => {
        if (!cancelado)
          setError(requestError.message || "No pudimos cargar la propiedad.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [id]);

  if (cargando)
    return (
      <InformativePage
        eyebrow="CARGANDO"
        title="Buscando la propiedad."
        description="Un momento, estamos consultando el servidor."
      />
    );
  if (
    error ||
    rolDeUsuario(usuario) !== "owner" ||
    String(propiedad?.owner?.id) !== String(usuario?.id)
  )
    return (
      <InformativePage
        eyebrow="ACCESO RESTRINGIDO"
        title="No podés modificar esta propiedad."
        description={
          error ||
          "Sólo el propietario de la publicación puede editar sus datos."
        }
      >
        <Link className="button button-primary" to="/">
          Volver al inicio
        </Link>
      </InformativePage>
    );
  return (
    <PropertyFormPage usuario={usuario} propiedad={propiedad} onSave={onSave} />
  );
}

function PropertyMapRoute() {
  const [propiedades, setPropiedades] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [errorInstituciones, setErrorInstituciones] = useState("");
  const [cargandoInstituciones, setCargandoInstituciones] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    listarPropiedades({ page: 1, limit: 100, status: "available" })
      .then((data) => {
        if (!cancelado)
          setPropiedades((data.properties || []).map(normalizarPropiedad));
      })
      .catch((requestError) => {
        if (!cancelado)
          setError(
            requestError.message ||
              "No pudimos cargar las propiedades para el mapa.",
          );
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    listarInstituciones()
      .then((data) => {
        if (!cancelado)
          setInstituciones(normalizarInstituciones(data.institutions));
      })
      .catch((requestError) => {
        if (!cancelado)
          setErrorInstituciones(
            requestError.message || "No pudimos cargar las instituciones.",
          );
      })
      .finally(() => {
        if (!cancelado) setCargandoInstituciones(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  if (error)
    return (
      <InformativePage
        eyebrow="ERROR DE CONEXIÓN"
        title="No pudimos cargar el mapa."
        description={error}
      >
        <Link className="button button-primary" to="/">
          Volver al inicio
        </Link>
      </InformativePage>
    );
  if (cargando)
    return (
      <InformativePage
        eyebrow="CARGANDO"
        title="Cargando alquileres."
        description="Estamos buscando alquileres disponibles para el mapa."
      />
    );
  return (
    <PropertyMapPage
      propiedades={propiedades}
      instituciones={instituciones}
      errorInstituciones={errorInstituciones}
      cargandoInstituciones={cargandoInstituciones}
    />
  );
}

function InstitutionsMapRedirect() {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  searchParams.set("capa", "instituciones");
  return (
    <Navigate
      to={`/mapa?${searchParams.toString()}#mapa`}
      replace
    />
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        document
          .querySelector(hash)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}

function App() {
  const { usuario, logout, cargandoSesion } = useAuth();

  const guardarPropiedad = async (propiedad) => {
    const { id, imageUrl, imageFile, existingImageUrl, existingImageIds, ...datos } =
      propiedad;
    const response = id
      ? await actualizarPropiedad(id, datos)
      : await crearPropiedad(datos);
    const propertyId = id || response.property.id;

    if (imageFile) {
      await subirImagenesPropiedad(propertyId, [imageFile]);
      await Promise.all(
        (existingImageIds || []).map((imageId) =>
          eliminarImagen(propertyId, imageId),
        ),
      );
    } else if (imageUrl !== existingImageUrl) {
      if (imageUrl) await agregarImagenes(propertyId, [imageUrl]);
      await Promise.all(
        (existingImageIds || []).map((imageId) =>
          eliminarImagen(propertyId, imageId),
        ),
      );
    }

    return response;
  };

  if (cargandoSesion)
    return (
      <InformativePage
        eyebrow="CARGANDO"
        title="Conectando con tu cuenta."
        description="Estamos verificando tu sesión."
      />
    );

  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route
        path="/"
        element={<HomePage usuario={usuario} onLogout={logout} />}
      />
      <Route
        path="/alquileres"
        element={
          <HomePage usuario={usuario} onLogout={logout} vista="catalogo" />
        }
      />
      <Route path="/alquileres/:id" element={<PropertyDetailsPage />} />
      <Route path="/alquileres/:id/foro" element={<PropertyForumPage />} />
      <Route
        path="/alquileres/:id/gestion"
        element={<OwnerPropertyManagementPage usuario={usuario} />}
      />
      <Route path="/mapa" element={<PropertyMapRoute />} />
      <Route
        path="/mapa-del-delito"
        element={
          usuario ? (
            <CrimeMapPage />
          ) : (
            <Navigate
              to="/login-and-registration"
              replace
              state={{ desde: { pathname: "/mapa-del-delito" } }}
            />
          )
        }
      />
      <Route path="/guia-asistida" element={<GuidedRentalGuidePage />} />
      <Route path="/consejos-seguridad" element={<SafetyTipsPage />} />
      <Route
        path="/instituciones"
        element={<InstitutionsMapRedirect />}
      />
      <Route
        path="/acceder"
        element={<Navigate to="/login-and-registration" replace />}
      />
      <Route
        path="/login"
        element={<Navigate to="/login-and-registration" replace />}
      />
      <Route
        path="/registro"
        element={
          <Navigate
            to="/login-and-registration?tab=register"
            replace
          />
        }
      />
      <Route
        path="/login-and-registration"
        element={<LoginAndRegistrationPage />}
      />
      <Route
        path="/panel-dueno"
        element={<OwnerDashboardPage />}
      />
      <Route path="/panel-dueno/garantias" element={<OwnerGuaranteeDocumentsPage />} />
      <Route path="/perfil-dueno" element={<OwnerProfilePage />} />
      <Route path="/panel-estudiante" element={<StudentDashboardPage />} />
      <Route
        path="/alquileres/nuevo"
        element={
          rolDeUsuario(usuario) === "owner" ? (
            <PropertyFormPage usuario={usuario} onSave={guardarPropiedad} />
          ) : (
            <LoginAndRegistrationPage />
          )
        }
      />
      <Route
        path="/alquileres/:id/editar"
        element={
          <EditPropertyRoute usuario={usuario} onSave={guardarPropiedad} />
        }
      />
      <Route
        path="*"
        element={
          <InformativePage
            eyebrow="404"
            title="Esta pantalla todavía no existe."
            description="Volvé al inicio para seguir explorando los alquileres disponibles."
          >
            <Link className="button button-primary" to="/">
              Volver al inicio
            </Link>
          </InformativePage>
        }
      />
      </Routes>
      <AppAssistant />
    </>
  );
}

export default App;
