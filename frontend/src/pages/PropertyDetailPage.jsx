import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerPropiedad } from "../api/properties.js";
import { ApiRequestError } from "../api/client.js";
import { formatearPrecio, textoAmbientes, textoEstado } from "../utils/formato.js";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [propiedad, setPropiedad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    obtenerPropiedad(id)
      .then((data) => setPropiedad(data.property))
      .catch((err) =>
        setError(err instanceof ApiRequestError ? err.message : "No pudimos cargar esta propiedad."),
      )
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <p className="estado-carga">Cargando propiedad…</p>;

  if (error || !propiedad) {
    return (
      <div className="estado-vacio">
        <h3>No encontramos esta propiedad</h3>
        <p>{error || "Puede que ya no esté disponible."}</p>
        <Link to="/alquileres" className="boton boton--primario" style={{ marginTop: 16 }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const imagen = propiedad.images?.[0]?.url;

  return (
    <div>
      <Link to="/alquileres" className="enlace-volver">
        ← Volver al catálogo
      </Link>

      <div className="detalle-propiedad">
        <div>
          <div className="detalle-propiedad__imagen">
            {imagen ? (
              <img src={imagen} alt={propiedad.title} />
            ) : (
              <div className="tarjeta-propiedad__imagen-vacia" style={{ height: "100%" }}>
                Sin foto todavía
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <h1>{propiedad.title}</h1>
            <p>{propiedad.description}</p>
          </div>
        </div>

        <aside className="detalle-propiedad__ficha">
          <p className="detalle-propiedad__precio">{formatearPrecio(propiedad.price)}</p>
          <span className="etiqueta etiqueta--oliva">/ mes</span>

          <dl>
            <dt>Dirección</dt>
            <dd>{propiedad.address}</dd>
            <dt>Ciudad</dt>
            <dd>{propiedad.city}</dd>
            <dt>Ambientes</dt>
            <dd>{textoAmbientes(propiedad.bedrooms)}</dd>
            <dt>Amoblado</dt>
            <dd>{propiedad.is_furnished ? "Sí" : "No"}</dd>
            <dt>Estado</dt>
            <dd>{textoEstado(propiedad.status)}</dd>
          </dl>

          <p style={{ marginTop: 20, fontSize: "0.9rem" }}>
            Publicado por <strong>{propiedad.owner?.name}</strong>
            <br />
            <a href={`mailto:${propiedad.owner?.email}`}>{propiedad.owner?.email}</a>
          </p>
        </aside>
      </div>
    </div>
  );
}
