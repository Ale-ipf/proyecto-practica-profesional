import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listarPropiedades } from "../api/properties.js";
import { ApiRequestError } from "../api/client.js";
import TarjetaPropiedad from "../components/TarjetaPropiedad.jsx";
import BarraFiltros from "../components/BarraFiltros.jsx";

const FILTROS_INICIALES = {
  city: "",
  bedrooms: "",
  maxPrice: "",
  status: "",
  is_furnished: false,
};

export default function HomePage() {
  const [parametrosUrl] = useSearchParams();

  // Permite llegar con filtros ya aplicados, ej: /?status=available (accesos rápidos del panel de estudiante)
  const [filtros, setFiltros] = useState(() => ({
    ...FILTROS_INICIALES,
    city: parametrosUrl.get("city") || "",
    bedrooms: parametrosUrl.get("bedrooms") || "",
    maxPrice: parametrosUrl.get("maxPrice") || "",
    status: parametrosUrl.get("status") || "",
    is_furnished: parametrosUrl.get("is_furnished") === "true",
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
