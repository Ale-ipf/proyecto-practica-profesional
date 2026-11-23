import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function distanceInKm(first, second) {
  const [lat1, lon1] = first;
  const [lat2, lon2] = second;
  const earthRadius = 6371;
  const latDistance = ((lat2 - lat1) * Math.PI) / 180;
  const lonDistance = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(latDistance / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(lonDistance / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceToInstitution(coordenadas, institucion) {
  const referencePoints = institucion.paradas?.length
    ? institucion.paradas.map((parada) => parada.coordenadas)
    : [institucion.coordenadas];

  return Math.min(
    ...referencePoints.map((point) => distanceInKm(point, coordenadas)),
  );
}

function InstitutionCarousel({ instituciones, propiedades }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const institucion = instituciones[selectedIndex];
  const nearbyProperties = useMemo(
    () =>
      institucion
        ? propiedades
            .filter(
              (propiedad) =>
                propiedad.estado === "available" && propiedad.coordenadas,
            )
            .map((propiedad) => ({
              ...propiedad,
              distancia: distanceToInstitution(
                propiedad.coordenadas,
                institucion,
              ),
            }))
            .sort((first, second) => first.distancia - second.distancia)
            .slice(0, 3)
        : [],
    [institucion, propiedades],
  );
  const totalSlides = instituciones.length;
  const changeSlide = (direction) =>
    setSelectedIndex(
      (current) => (current + direction + totalSlides) % totalSlides,
    );

  return (
    <section className="institution-carousel">
      <div className="carousel-copy">
        <span className="section-kicker">INSTITUCIONES EDUCATIVAS</span>
        <h2>Conocé las instituciones de Formosa</h2>
        <p>
          Explorá la información de cada institución y conocé los alquileres
          disponibles en sus alrededores.
        </p>
        <div className="carousel-controls">
          <button
            type="button"
            onClick={() => changeSlide(-1)}
            aria-label="Elemento anterior"
          >
            ←
          </button>
          <div className="carousel-dots">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                className={index === selectedIndex ? "active" : ""}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Ver institución ${index + 1}`}
                aria-current={index === selectedIndex ? "true" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => changeSlide(1)}
            aria-label="Siguiente elemento"
          >
            →
          </button>
        </div>
      </div>
      <div className="institution-slide" aria-live="polite">
        <div
          className={`institution-badge${String(institucion.abreviatura || "").length > 5 ? " is-long" : String(institucion.abreviatura || "").length > 3 ? " is-medium" : ""}`}
          title={institucion.nombre}
        >
          {institucion.abreviatura}
        </div>
        <div>
          <span className="institution-type">{institucion.tipo}</span>
          <h3>{institucion.nombre}</h3>
          <p>{institucion.descripcion}</p>
        </div>
        <div className="nearby-properties">
          <span className="nearby-label">Alquileres cercanos</span>
          {nearbyProperties.length > 0 ? (
            nearbyProperties.map((propiedad) => (
              <Link
                className="nearby-property"
                key={propiedad.id}
                to={`/alquileres/${propiedad.id}`}
              >
                <span>{propiedad.titulo}</span>
                <strong>{propiedad.distancia.toFixed(1)} km</strong>
              </Link>
            ))
          ) : (
            <span className="nearby-empty">
              No hay alquileres cercanos publicados por ahora.
            </span>
          )}
        </div>
        <Link
          className="button button-accent"
          to={`/mapa?capa=instituciones&institucion=${encodeURIComponent(institucion.id)}#mapa`}
        >
          Ver en el mapa
        </Link>
      </div>
    </section>
  );
}

export default InstitutionCarousel;
