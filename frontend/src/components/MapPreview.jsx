import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { textoDisponibilidad } from "../utils/formato";

function FitProperties({ properties }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length) {
      map.fitBounds(
        properties.map((property) => property.coordenadas),
        {
          padding: [24, 24],
          maxZoom: 14,
        },
      );
    }
  }, [properties, map]);

  return null;
}

function MapPreview({ propiedades }) {
  const propiedadesDisponibles = propiedades.filter(
    (propiedad) => propiedad.estado === "available" && propiedad.coordenadas,
  );

  return (
    <section className="map-preview">
      <div className="map-preview-header">
        <div>
          <span className="section-kicker">UBICACIÓN Y CERCANÍA</span>
          <h2>Alquileres disponibles en el mapa</h2>
          <p>
            Consultá las publicaciones y abrí cada alquiler para ver sus
            detalles.
          </p>
        </div>
        <Link className="button button-accent" to="/mapa">
          Ver mapa de alquileres
        </Link>
      </div>
      <div className="map-preview-frame">
        <MapContainer
          center={[-26.1849, -58.1731]}
          zoom={13}
          scrollWheelZoom={false}
          className="preview-leaflet-map"
        >
          <FitProperties properties={propiedadesDisponibles} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {propiedadesDisponibles.map((propiedad) => (
            <CircleMarker
              key={propiedad.id}
              center={propiedad.coordenadas}
              pathOptions={{
                color: "#255e55",
                fillColor: "#255e55",
                fillOpacity: 0.8,
              }}
              radius={6}
            >
              <Popup>
                <strong>{propiedad.titulo}</strong>
                <br />
                {textoDisponibilidad(
                  propiedad.estado,
                  propiedad.cuposDisponibles,
                )}
                <br />
                <Link to={`/alquileres/${propiedad.id}`}>Ver propiedad</Link>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="map-preview-legend">
        <span>
          <i className="legend-dot property-dot" /> Alquileres disponibles
        </span>
      </div>
    </section>
  );
}

export default MapPreview;
