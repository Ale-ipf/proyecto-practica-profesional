import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Link, useSearchParams } from "react-router-dom";
import { listarInstituciones } from "../api/institutions.js";
import { ApiRequestError } from "../api/client.js";
import "leaflet/dist/leaflet.css";

const FORMOSA_CENTER = [-26.1849, -58.1731];

function normalizeBusStops(busStops) {
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

function FitInstitutions({ instituciones, selectedInstitution }) {
  const map = useMap();

  useEffect(() => {
    const points = selectedInstitution
      ? [
          selectedInstitution.coordenadas,
          ...selectedInstitution.busStops.map((stop) => stop.coordenadas),
        ]
      : instituciones.map((institution) => institution.coordenadas);
    const validPoints = points.filter(
      (point) => Array.isArray(point) && point.every(Number.isFinite),
    );

    if (validPoints.length) {
      map.fitBounds(validPoints, { padding: [32, 32], maxZoom: 14 });
    }
  }, [instituciones, map, selectedInstitution]);

  return null;
}

function FocusSelectedStop({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates) map.flyTo(coordinates, 16, { duration: 1 });
  }, [coordinates, map]);

  return null;
}

export default function InstitutionsPage() {
  const [instituciones, setInstituciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStopKey, setSelectedStopKey] = useState(null);

  useEffect(() => {
    let cancelado = false;

    listarInstituciones()
      .then((data) => {
        if (!cancelado) {
          setInstituciones(
            (data.institutions || []).map((institution) => ({
              ...institution,
              coordenadas: [
                Number(institution.latitude),
                Number(institution.longitude),
              ],
              busStops: normalizeBusStops(institution.busStops).map((stop) => ({
                ...stop,
                coordenadas: [Number(stop.latitude), Number(stop.longitude)],
              })),
            })),
          );
        }
      })
      .catch((requestError) => {
        if (!cancelado) {
          setError(
            requestError instanceof ApiRequestError
              ? requestError.message
              : "No pudimos cargar las instituciones.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const selectedInstitutionId = searchParams.get("institucion");
  const selectedInstitution = instituciones.find(
    (institution) => String(institution.id) === selectedInstitutionId,
  );
  const selectedStop = selectedInstitution?.busStops.find(
    (stop) => `${stop.name}-${stop.address}` === selectedStopKey,
  );

  const selectInstitution = (institutionId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("institucion", String(institutionId));
    setSearchParams(nextParams);
    setSelectedStopKey(null);
    document
      .getElementById("mapa-instituciones")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectStop = (stop) => {
    setSelectedStopKey(`${stop.name}-${stop.address}`);
  };

  const showAllInstitutions = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("institucion");
    setSearchParams(nextParams);
    setSelectedStopKey(null);
  };

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">
          Alquileres Formosa
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link to="/panel-estudiante">Mi perfil</Link>
          <Link to="/mapa">Alquileres en mapa</Link>
        </nav>
        <Link className="button button-primary" to="/panel-estudiante">
          Volver al perfil
        </Link>
      </header>
      <main className="institutions-page">
        <span className="section-kicker">INSTITUCIONES EDUCATIVAS</span>
        <h1>Universidades e instituciones asociadas</h1>
        <p className="route-description">
          Explorá las sedes educativas, sus ubicaciones y las paradas cercanas.
        </p>

        <section className="institutions-map-section" id="mapa-instituciones">
          <div className="institutions-map-heading">
            <div>
              <span className="section-kicker">MAPA DE SEDES</span>
              <h2>{selectedInstitution?.name || "Instituciones en Formosa"}</h2>
              <p>
                {selectedInstitution
                  ? `Las paradas marcadas en el mapa pertenecen a ${selectedInstitution.name}.`
                  : "Seleccioná una institución para consultar sus paradas."}
              </p>
            </div>
            {selectedInstitution && (
              <button
                type="button"
                className="button button-accent"
                onClick={showAllInstitutions}
              >
                Ver todas
              </button>
            )}
          </div>

          <div className="institutions-map-frame">
            <MapContainer
              center={selectedInstitution?.coordenadas || FORMOSA_CENTER}
              zoom={13}
              scrollWheelZoom
              className="institutions-map"
            >
              <FitInstitutions
                instituciones={instituciones}
                selectedInstitution={selectedInstitution}
              />
              <FocusSelectedStop coordinates={selectedStop?.coordenadas} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {instituciones.map((institution) => {
                const isSelected = institution.id === selectedInstitution?.id;

                return (
                  <CircleMarker
                    key={institution.id}
                    center={institution.coordenadas}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor: isSelected ? "#ff8a1c" : "#c96b4b",
                      fillOpacity: 1,
                      weight: 2,
                    }}
                    radius={isSelected ? 10 : 8}
                    eventHandlers={{
                      click: () => selectInstitution(institution.id),
                    }}
                  >
                    <Popup>
                      <strong>{institution.name}</strong>
                      <br />
                      {institution.type}
                    </Popup>
                  </CircleMarker>
                );
              })}
              {selectedInstitution?.busStops.map((stop) => (
                <CircleMarker
                  key={`${stop.name}-${stop.address}`}
                  center={stop.coordenadas}
                  pathOptions={{
                    color: "#ffffff",
                    fillColor:
                      selectedStopKey === `${stop.name}-${stop.address}`
                        ? "#ff8a1c"
                        : "#255e55",
                    fillOpacity: 1,
                    weight: 2,
                  }}
                  radius={7}
                  eventHandlers={{
                    click: () => selectStop(stop),
                  }}
                >
                  <Popup>
                    <strong>{stop.name}</strong>
                    <br />
                    {stop.address}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="institutions-map-legend">
            <span>
              <i className="institution-map-dot" /> Instituciones
            </span>
            {selectedInstitution?.busStops.length > 0 && (
              <span>
                <i className="institution-map-dot is-stop" /> Paradas de{" "}
                {selectedInstitution.abbreviation}
              </span>
            )}
          </div>
        </section>

        {cargando && <p className="muted">Cargando instituciones…</p>}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {!cargando && !error && instituciones.length === 0 && (
          <p className="muted">Todavía no hay instituciones disponibles.</p>
        )}

        {!cargando && !error && instituciones.length > 0 && (
          <div className="institutions-grid">
            {instituciones.map((institucion) => (
              <article
                className={`institution-card ${selectedInstitution?.id === institucion.id ? "is-selected" : ""}`}
                key={institucion.id}
              >
                <span className="institution-card__abbreviation">
                  {institucion.abbreviation}
                </span>
                <span className="institution-card__type">
                  {institucion.type}
                </span>
                <h2>{institucion.name}</h2>
                <p>{institucion.description}</p>
                <button
                  className="button button-accent"
                  type="button"
                  aria-pressed={selectedInstitution?.id === institucion.id}
                  onClick={() => selectInstitution(institucion.id)}
                >
                  {selectedInstitution?.id === institucion.id
                    ? "Seleccionada"
                    : "Ver en el mapa"}
                </button>
                {selectedInstitution?.id === institucion.id &&
                  institucion.busStops.length > 0 && (
                    <div className="institution-stops">
                      <span className="section-kicker">
                        PARADAS DE {institucion.abbreviation}
                      </span>
                      {institucion.busStops.map((stop) => (
                        <button
                          key={`${stop.name}-${stop.address}`}
                          type="button"
                          className={`institution-stop-button ${selectedStopKey === `${stop.name}-${stop.address}` ? "is-selected" : ""}`}
                          onClick={() => selectStop(stop)}
                        >
                          <strong>{stop.name}</strong>
                          <small>{stop.address}</small>
                        </button>
                      ))}
                    </div>
                  )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
