import { Link } from "react-router-dom";
import { formatearPrecio, textoAmbientes, textoEstado } from "../utils/formato.js";

export default function TarjetaPropiedad({ propiedad, acciones }) {
  const primeraImagen = propiedad.images?.[0]?.url;

  return (
    <article className="tarjeta-propiedad">
      <div className="tarjeta-propiedad__imagen-wrap">
        {primeraImagen ? (
          <img src={primeraImagen} alt={propiedad.title} loading="lazy" />
        ) : (
          <div className="tarjeta-propiedad__imagen-vacia">Sin foto todavía</div>
        )}
      </div>

      <div className="tarjeta-propiedad__cuerpo">
        <div className="tarjeta-propiedad__meta">
          <span className="etiqueta etiqueta--terracota">{propiedad.city}</span>
          <span className="etiqueta etiqueta--ocre">{textoAmbientes(propiedad.bedrooms)}</span>
          <span className={`etiqueta ${propiedad.status === "rented" ? "etiqueta--ciruela" : "etiqueta--oliva"}`}>
            {textoEstado(propiedad.status)}
          </span>
        </div>

        <h3 className="tarjeta-propiedad__titulo">
          <Link to={`/propiedades/${propiedad.id}`}>{propiedad.title}</Link>
        </h3>

        <p className="tarjeta-propiedad__precio">{formatearPrecio(propiedad.price)} /mes</p>
        <p className="tarjeta-propiedad__ubicacion">
          {propiedad.address} {propiedad.is_furnished ? "· Amoblado" : ""}
        </p>

        {acciones && <div className="tarjeta-propiedad__acciones">{acciones}</div>}
      </div>

      <div className="tarjeta-propiedad__pie">
        <span>Publicado por {propiedad.owner?.name || "propietario"}</span>
      </div>
    </article>
  );
}
