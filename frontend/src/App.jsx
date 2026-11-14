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
import PropertyMapPage from "./components/PropertyMapPage";
import CrimeMapPage from "./components/CrimeMapPage";
import InstitutionCarousel from "./components/InstitutionCarousel";
import MapPreview from "./components/MapPreview";
import LoginAndRegistrationPage from "./pages/LoginAndRegistrationPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage";
import OwnerPropertyManagementPage from "./pages/OwnerPropertyManagementPage.jsx";
import { useAuth } from "./context/AuthContext";
import {
  listarPropiedades,
  listarMisPropiedades,
  obtenerPropiedad,
  crearPropiedad,
  actualizarPropiedad,
  eliminarPropiedad,
  agregarImagenes,
  eliminarImagen,
} from "./api/properties";
import {
  listarInstituciones,
  normalizarInstituciones,
} from "./api/institutions";

const barrios = ["Centro", "San Miguel", "Guadalupe", "UNaF"];

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
    tipoInmueble: "Directo",
    tieneAire: /aire acondicionado/i.test(property.description || ""),
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
  return (
    <header className="site-header">
      <Link className="brand-title" to="/">
        Alquileres Formosa <span aria-hidden="true"></span>
      </Link>
      <nav className="main-nav" aria-label="Navegación principal">
        <Link to="/alquileres">Alquileres</Link>
        <Link to="/mapa-del-delito">Mapa del delito</Link>
      </nav>
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

function Filters({ filters, setFilters, mostrarFavoritos }) {
  const update = (event) =>
    setFilters({
      ...filters,
      [event.target.name]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    });
  const limpiarFiltros = () =>
    setFilters({
      barrio: "Todos",
      ambientes: "Todos",
      tipo: "Todos",
      orden: "Defecto",
      precioMaximo: "",
      soloConAire: false,
      soloFavoritos: false,
    });
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
        <button
          className="clear-filters"
          type="button"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </button>
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
          <span>Publicado por</span>
          <select name="tipo" value={filters.tipo} onChange={update}>
            <option value="Todos">Dueño o inmobiliaria</option>
            <option value="Directo">Dueño directo</option>
            <option value="Inmobiliaria">Inmobiliaria</option>
          </select>
        </label>
        <label>
          <span>Ordenar por</span>
          <select name="orden" value={filters.orden} onChange={update}>
            <option value="Defecto">Más recientes</option>
            <option value="MenorMayor">Menor precio</option>
            <option value="MayorMenor">Mayor precio</option>
          </select>
        </label>
        <label>
          <span>Precio máximo</span>
          <div className="input-with-prefix">
            <span>$</span>
            <input
              type="number"
              name="precioMaximo"
              value={filters.precioMaximo}
              onChange={update}
              placeholder="Sin límite"
            />
          </div>
        </label>
        <div className="filter-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="soloConAire"
              checked={filters.soloConAire}
              onChange={update}
            />{" "}
            Solo con aire acondicionado ❄️
          </label>
          {mostrarFavoritos && (
            <label className="checkbox-label favorite-filter">
              <input
                type="checkbox"
                name="soloFavoritos"
                checked={filters.soloFavoritos}
                onChange={update}
              />{" "}
              ⭐ Ver mis favoritos
            </label>
          )}
        </div>
      </div>
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
  const { instituciones, cargandoInstituciones, errorInstituciones } =
    useInstituciones();
  const [favoritos, setFavoritos] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filters, setFilters] = useState({
    barrio: "Todos",
    ambientes: "Todos",
    tipo: "Todos",
    orden: "Defecto",
    precioMaximo: "",
    soloConAire: false,
    soloFavoritos: false,
  });
  const mostrarVistaPrevia =
    vista === "perfil-estudiante" && rolDeUsuario(usuario) === "student";
  const esPropietario =
    vista !== "catalogo" && rolDeUsuario(usuario) === "owner";

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const data = esPropietario
          ? await listarMisPropiedades()
          : await listarPropiedades({
              page: pagina,
              limit: mostrarVistaPrevia ? 3 : 9,
              status: "available",
            });
        if (cancelado) return;
        const items = (data.properties || []).map(normalizarPropiedad);
        setPropiedades(items);
        setTotalPaginas(
          esPropietario || mostrarVistaPrevia
            ? 1
            : data.pagination?.totalPages || 1,
        );
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
  }, [usuario, pagina, esPropietario, mostrarVistaPrevia]);

  useEffect(() => {
    setPagina(1);
  }, [usuario, vista]);

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
      const cumpleTipo =
        filters.tipo === "Todos" ||
        (alquiler.tipoInmueble || "Directo") === filters.tipo;
      const cumplePrecio =
        !filters.precioMaximo ||
        Number(alquiler.precio) <= Number(filters.precioMaximo);
      const cumpleAire = !filters.soloConAire || alquiler.tieneAire === true;
      const cumpleFavorito =
        !filters.soloFavoritos || favoritos.includes(Number(alquiler.id));
      return (
        cumpleBarrio &&
        cumpleAmbientes &&
        cumpleTipo &&
        cumplePrecio &&
        cumpleAire &&
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
          {rolDeUsuario(usuario) === "student" && (
            <Link
              className="button button-accent"
              to="/mapa?capa=instituciones#mapa"
            >
              Ver instituciones
            </Link>
          )}
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
        {vista !== "catalogo" && !esPropietario && instituciones.length > 0 && (
          <InstitutionCarousel
            instituciones={instituciones}
            propiedades={propiedades}
          />
        )}
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
              alquileresFiltrados.map((alquiler) => (
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
              No encontramos alquileres con esos filtros. 🔍
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
      </main>
      <footer className="site-footer">
        <p>© 2026 Alquileres Formosa</p>
        <div>
          <Link to="/alquileres">Ver alquileres</Link>
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

function App() {
  const { usuario, logout, cargandoSesion } = useAuth();

  const guardarPropiedad = async (propiedad) => {
    const { id, imageUrl, existingImageUrl, existingImageIds, ...datos } =
      propiedad;
    const response = id
      ? await actualizarPropiedad(id, datos)
      : await crearPropiedad(datos);
    const propertyId = id || response.property.id;

    if (imageUrl !== existingImageUrl) {
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
      <Route
        path="/alquileres/:id/gestion"
        element={<OwnerPropertyManagementPage usuario={usuario} />}
      />
      <Route path="/mapa" element={<PropertyMapRoute />} />
      <Route path="/mapa-del-delito" element={<CrimeMapPage />} />
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
        element={<HomePage usuario={usuario} onLogout={logout} />}
      />
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
  );
}

export default App;
