import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardPropertyCard } from "../components/DashboardLayout.jsx";
import { listarPropiedades } from "../api/properties.js";
import { ApiRequestError } from "../api/client.js";

const FILTROS_INICIALES = {
  city: "",
  bedrooms: "",
  maxPrice: "",
  status: "available",
  is_furnished: "",
};

function BarraFiltros({ filtros, onCambiar }) {
  const actualizar = (event) => {
    onCambiar({ ...filtros, [event.target.name]: event.target.value });
  };

  return (
    <section className="panel filters-panel" aria-label="Filtros de alquileres">
      <div className="filter-heading">
        <div>
          <span className="section-kicker">ENCONTRÁ TU LUGAR</span>
          <h2>Filtrá las propiedades</h2>
        </div>
        <button
          className="clear-filters"
          type="button"
          onClick={() => onCambiar(FILTROS_INICIALES)}
        >
          Limpiar filtros
        </button>
      </div>
      <div className="form-grid filter-grid">
        <label>
          Ciudad
          <input name="city" value={filtros.city} onChange={actualizar} placeholder="Formosa" />
        </label>
        <label>
          Ambientes
          <select name="bedrooms" value={filtros.bedrooms} onChange={actualizar}>
            <option value="">Cualquier cantidad</option>
            <option value="1">Monoambiente</option>
            <option value="2">2 ambientes</option>
            <option value="3">3 ambientes</option>
          </select>
        </label>
        <label>
          Precio máximo
          <input type="number" min="0" name="maxPrice" value={filtros.maxPrice} onChange={actualizar} placeholder="Sin límite" />
        </label>
        <label>
          Estado
          <select name="status" value={filtros.status} onChange={actualizar}>
            <option value="">Todos</option>
            <option value="available">Disponible</option>
            <option value="rented">Alquilada</option>
          </select>
        </label>
        <label>
          Amoblamiento
          <select name="is_furnished" value={filtros.is_furnished} onChange={actualizar}>
            <option value="">Cualquiera</option>
            <option value="true">Amoblada</option>
            <option value="false">Sin amoblar</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function TarjetaPropiedad({ propiedad }) {
  return <DashboardPropertyCard property={propiedad} />;
}

export default function HomePage() {
  const [parametrosUrl] = useSearchParams();

  // Permite llegar con filtros ya aplicados, ej: /?status=available (accesos rápidos del panel de estudiante)
  const [filtros, setFiltros] = useState(() => ({
    ...FILTROS_INICIALES,
    city: parametrosUrl.get("city") || "",
    bedrooms: parametrosUrl.get("bedrooms") || "",
    maxPrice: parametrosUrl.get("maxPrice") || "",
    status: parametrosUrl.get("status") || "",
    is_furnished: parametrosUrl.get("is_furnished") || "",
  }));
  const [pagina, setPagina] = useState(1);
  const [propiedades, setPropiedades] = useState([]);
  const [paginacion, setPaginacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelado = false;
    const idTimeout = setTimeout(async () => {
      setCargando(true);
      setError("");
      try {
        const data = await listarPropiedades({ ...filtros, page: pagina, limit: 9 });
        if (!cancelado) {
          setPropiedades(data.properties);
          setPaginacion(data.pagination);
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof ApiRequestError
              ? err.message
              : "No pudimos cargar las propiedades. Revisá que el backend esté corriendo.",
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(idTimeout);
    };
  }, [filtros, pagina]);

  const cambiarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
    setPagina(1);
  };

  return (
    <>
      <div className="hero-inicio">
        <div className="hero-inicio__franja" aria-hidden="true" />
        <div className="hero-inicio__texto">
          <p className="hero-inicio__kicker">Alquileres para estudiantes en Formosa</p>
          <h1>Un lugar cerca de la facu, sin vueltas.</h1>
          <p>
            Propiedades publicadas directamente por dueños de Formosa: filtrá por zona,
            precio y comodidades hasta encontrar la que se ajusta a tu cuatrimestre.
          </p>
        </div>
      </div>

      <BarraFiltros filtros={filtros} onCambiar={cambiarFiltros} />

      <div className="seccion-encabezado">
        <h2>Propiedades disponibles</h2>
        {paginacion && <span className="etiqueta">{paginacion.total} resultados</span>}
      </div>

      {cargando && <p className="estado-carga">Buscando propiedades…</p>}

      {!cargando && error && (
        <div className="mensaje-alerta mensaje-alerta--error">{error}</div>
      )}

      {!cargando && !error && propiedades.length === 0 && (
        <div className="estado-vacio">
          <h3>No encontramos nada con esos filtros</h3>
          <p>Probá ampliar el precio máximo o quitar alguno de los filtros.</p>
        </div>
      )}

      {!cargando && !error && propiedades.length > 0 && (
        <>
          <div className="grilla-propiedades">
            {propiedades.map((propiedad) => (
              <TarjetaPropiedad key={propiedad.id} propiedad={propiedad} />
            ))}
          </div>

          {paginacion && paginacion.totalPages > 1 && (
            <div className="paginacion">
              <button
                type="button"
                className="boton boton--secundario boton--chico"
                disabled={pagina <= 1}
                onClick={() => setPagina((p) => p - 1)}
              >
                ← Anterior
              </button>
              <span>
                Página {paginacion.page} de {paginacion.totalPages}
              </span>
              <button
                type="button"
                className="boton boton--secundario boton--chico"
                disabled={pagina >= paginacion.totalPages}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
