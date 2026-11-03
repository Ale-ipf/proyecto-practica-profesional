import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Link, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { textoDisponibilidad } from "../utils/formato";

const MAX_RECOMMENDATION_DISTANCE_KM = 2;

function FitSelectedInstitution({ institucion, instituciones, hasSelection }) {
  const map = useMap();

  useEffect(() => {
    const focusPoints = hasSelection
      ? [
          ...(institucion.coordenadas ? [institucion.coordenadas] : []),
          ...normalizeParadas(institucion.paradas).map(
            (parada) => parada.coordenadas,
          ),
        ]
      : instituciones.map((item) => item.coordenadas).filter(Boolean);

    if (focusPoints.length > 0) {
      map.fitBounds(focusPoints, {
        padding: [32, 32],
        maxZoom: 14,
      });
    }
  }, [institucion, instituciones, hasSelection, map]);

  return null;
}

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

function normalizeParadas(paradas) {
  if (Array.isArray(paradas)) return paradas;

  if (typeof paradas === "string") {
    try {
      const parsed = JSON.parse(paradas);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function FocusSelectedStop({ stop }) {
  const map = useMap();

  useEffect(() => {
    if (!stop?.coordenadas?.length) return;

    map.flyTo(stop.coordenadas, 15, { duration: 1.2 });
  }, [map, stop]);

  return null;
}

function FocusSelectedProperty({ propiedad }) {
  const map = useMap();

  useEffect(() => {
    if (!propiedad?.coordenadas?.length) return;

    map.flyTo(propiedad.coordenadas, 15, { duration: 1.2 });
  }, [map, propiedad]);

  return null;
}

function getStopKey(stop) {
  if (stop?.isPrincipal) return "__principal__";
  return `${stop?.name ?? "parada"}-${stop?.address ?? "sin-direccion"}`;
}

function createStopMarkerIcon(isSelected) {
  return L.divIcon({
    className: "custom-stop-marker-wrapper",
    html: `<div class="custom-stop-pin ${isSelected ? "is-selected" : ""}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

function PropertyMapPage({ propiedades, instituciones }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stopsOpen, setStopsOpen] = useState(true);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [fartherOptionsStopId, setFartherOptionsStopId] = useState(null);
  const selectedInstitutionId = searchParams.get("institucion");
  const selectedInstitution =
    instituciones.find((item) => String(item.id) === selectedInstitutionId) ||
    instituciones[0] ||
    {};
  const hasSelection = Boolean(selectedInstitutionId);
  const visibleInstitutions = hasSelection
    ? [selectedInstitution]
    : instituciones;
  const paradas = normalizeParadas(selectedInstitution?.paradas);
  const principalOption = selectedInstitution.coordenadas
    ? {
        name: "Sede principal",
        address: selectedInstitution.nombre,
        coordenadas: selectedInstitution.coordenadas,
        isPrincipal: true,
      }
    : null;
  const visibleStops = hasSelection
    ? principalOption
      ? [principalOption, ...paradas]
      : paradas
    : [];
  const selectedStop = selectedStopId
    ? visibleStops.find((stop) => getStopKey(stop) === selectedStopId) || null
    : null;
  const referenceCoordinates =
    selectedStop?.coordenadas || selectedInstitution.coordenadas;
  const availableProperties = useMemo(
    () =>
      propiedades
        .filter(
          (propiedad) =>
            propiedad.estado === "available" && propiedad.coordenadas,
        )
        .map((propiedad) => ({
          ...propiedad,
          distancia: distanceInKm(referenceCoordinates, propiedad.coordenadas),
        }))
        .sort((first, second) => first.distancia - second.distancia),
    [propiedades, referenceCoordinates],
  );
  const nearbyProperties = availableProperties.filter(
    (propiedad) => propiedad.distancia <= MAX_RECOMMENDATION_DISTANCE_KM,
  );
  const fartherProperties = availableProperties.filter(
    (propiedad) => propiedad.distancia > MAX_RECOMMENDATION_DISTANCE_KM,
  );
  const showFartherProperties = Boolean(
    selectedStopId && fartherOptionsStopId === selectedStopId,
  );
  const displayedProperties = showFartherProperties
    ? availableProperties
    : nearbyProperties;
  const mapCenter = hasSelection
    ? visibleStops[0]?.coordenadas ||
      selectedInstitution.coordenadas ||
      instituciones[0]?.coordenadas || [-26.1922042, -58.2002557]
    : instituciones[0]?.coordenadas || [-26.1922042, -58.2002557];

  const selectedProperty =
    availableProperties.find(
      (propiedad) => propiedad.id === selectedPropertyId,
    ) || null;

  useEffect(() => {
    if (!visibleStops.length) {
      setSelectedStopId(null);
      return;
    }

    setSelectedStopId((current) => {
      if (!current) {
        return getStopKey(visibleStops[0]);
      }

      return visibleStops.some((stop) => getStopKey(stop) === current)
        ? current
        : getStopKey(visibleStops[0]);
    });
  }, [visibleStops]);

  const handleShowAllInstitutions = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("institucion");
    setSearchParams(nextParams);
  };

  const handleSelectInstitution = (institutionId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("institucion", String(institutionId));
    setSearchParams(nextParams);
  };

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">
          Alquileres Formosa
        </Link>
        <nav className="main-nav">
          <Link to="/alquileres">Alquileres</Link>
          <Link to="/mapa">Mapa</Link>
        </nav>
        <Link className="button button-primary" to="/alquileres">
          Volver a los alquileres
        </Link>
      </header>

      <main className="map-page">
        <div className="map-page-heading">
          <div>
            <span className="section-kicker">MAPA INTERACTIVO</span>
            <h1>Encontrá alquileres cerca de tu institución.</h1>
            <p className="route-description">
              Explorá las instituciones educativas y los alquileres disponibles
              ordenados por cercanía.
            </p>
          </div>
          <div className="map-header-actions">
            <div
              className={`map-selected-institution ${hasSelection ? "" : "is-overview"}`}
            >
              <span>
                {hasSelection
                  ? selectedInstitution.abreviatura
                  : "INSTITUCIONES"}
              </span>
              <strong>
                {hasSelection
                  ? selectedInstitution.nombre
                  : "Todas las instituciones"}
              </strong>
            </div>
            {hasSelection && (
              <button
                type="button"
                className="button button-accent map-toggle-button"
                onClick={handleShowAllInstitutions}
              >
                Ver todas
              </button>
            )}
          </div>
        </div>

        <div className="map-page-layout">
          <div className="leaflet-map-wrapper">
            <MapContainer
              center={mapCenter}
              zoom={14}
              scrollWheelZoom
              className="leaflet-map"
            >
              <FitSelectedInstitution
                institucion={selectedInstitution}
                instituciones={instituciones}
                hasSelection={hasSelection}
              />
              <FocusSelectedStop stop={selectedStop} />
              <FocusSelectedProperty
                propiedad={hasSelection ? selectedProperty : null}
              />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {visibleInstitutions.map((institucion) => (
                <Marker
                  key={institucion.id}
                  position={institucion.coordenadas}
                  eventHandlers={{
                    click: () => handleSelectInstitution(institucion.id),
                  }}
                >
                  <Popup>
                    <strong>{institucion.nombre}</strong>
                    <br />
                    {institucion.tipo}
                  </Popup>
                </Marker>
              ))}

              {visibleStops.map((parada) => {
                const stopKey = getStopKey(parada);
                const isSelected = selectedStopId === stopKey;

                if (parada.isPrincipal) {
                  return null;
                }

                return (
                  <Marker
                    key={`${selectedInstitution.id}-${stopKey}`}
                    position={parada.coordenadas}
                    icon={createStopMarkerIcon(isSelected)}
                    eventHandlers={{
                      click: () => {
                        setSelectedPropertyId(null);
                        setSelectedStopId(stopKey);
                      },
                    }}
                  >
                    <Popup>
                      <strong>Parada del colectivo: {parada.name}</strong>
                      <br />
                      {parada.address}
                      <br />
                      Servicio hacia {selectedInstitution.abreviatura}
                    </Popup>
                  </Marker>
                );
              })}

              {hasSelection &&
                displayedProperties.map((propiedad) => {
                  const isSelected = selectedPropertyId === propiedad.id;

                  return (
                    <Marker
                      key={propiedad.id}
                      position={propiedad.coordenadas}
                      eventHandlers={{
                        click: () => {
                          setSelectedPropertyId(propiedad.id);
                        },
                      }}
                      icon={L.divIcon({
                        className: "custom-property-marker-wrapper",
                        html: `<div class="custom-property-pin ${isSelected ? "is-selected" : ""}"></div>`,
                        iconSize: [18, 18],
                        iconAnchor: [9, 9],
                        popupAnchor: [0, -12],
                      })}
                    >
                      <Popup>
                        <strong>{propiedad.titulo}</strong>
                        <br />
                        {propiedad.distancia.toFixed(1)} km de{" "}
                        {selectedStop?.name || selectedInstitution.abreviatura}
                        <br />
                        {textoDisponibilidad(propiedad.estado)}
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          </div>

          <aside className="map-results">
            {!hasSelection ? (
              <div className="map-nearby-block">
                <span className="section-kicker">INSTITUCIONES</span>
                <h2>{instituciones.length} instituciones</h2>
                {instituciones.map((institucion) => (
                  <button
                    key={institucion.id}
                    type="button"
                    className="map-result-item"
                    onClick={() => handleSelectInstitution(institucion.id)}
                  >
                    <span>{institucion.nombre}</span>
                    <small>{institucion.tipo}</small>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {paradas.length > 0 && (
                  <div className="map-bus-stops-block">
                    <button
                      type="button"
                      className="bus-stops-toggle"
                      onClick={() => setStopsOpen((current) => !current)}
                      aria-expanded={stopsOpen}
                    >
                      <span className="section-kicker">
                        PARADAS DE COLECTIVO
                      </span>
                      <strong>{selectedInstitution.nombre}</strong>
                      <span
                        className={`toggle-icon ${stopsOpen ? "is-open" : ""}`}
                      >
                        ▾
                      </span>
                    </button>

                    {stopsOpen && (
                      <>
                        <ul className="bus-stop-list">
                          {visibleStops.map((parada) => {
                            const stopKey = getStopKey(parada);
                            const isSelected = selectedStopId === stopKey;

                            if (parada.isPrincipal) {
                              return (
                                <li
                                  key={`${selectedInstitution.id}-principal`}
                                  className={`bus-stop-item is-principal ${isSelected ? "is-selected" : ""}`}
                                  onClick={() => {
                                    setSelectedPropertyId(null);
                                    setSelectedStopId(stopKey);
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(event) => {
                                    if (
                                      event.key === "Enter" ||
                                      event.key === " "
                                    ) {
                                      event.preventDefault();
                                      setSelectedPropertyId(null);
                                      setSelectedStopId(stopKey);
                                    }
                                  }}
                                >
                                  <strong>{parada.name}</strong>
                                  <span>{parada.address}</span>
                                </li>
                              );
                            }

                            return (
                              <li
                                key={`${selectedInstitution.id}-${stopKey}`}
                                className={`bus-stop-item ${isSelected ? "is-selected" : ""}`}
                                onClick={() => setSelectedStopId(stopKey)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    event.preventDefault();
                                    setSelectedPropertyId(null);
                                    setSelectedStopId(stopKey);
                                  }
                                }}
                              >
                                <strong>{parada.name}</strong>
                                <span>{parada.address}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                <div className="map-nearby-block">
                  <span className="section-kicker">
                    {paradas.length
                      ? `PROPIEDADES CERCANAS A ${selectedStop?.name || "LAS PARADAS"}`
                      : "PROPIEDADES CERCANAS"}
                  </span>
                  <h2>{displayedProperties.length} opciones encontradas</h2>

                  {nearbyProperties.length > 0 || showFartherProperties ? (
                    displayedProperties.map((propiedad) => {
                      const isSelected = selectedPropertyId === propiedad.id;

                      return (
                        <button
                          key={propiedad.id}
                          type="button"
                          className={`map-result-item ${isSelected ? "is-selected" : ""}`}
                          onClick={() => {
                            setSelectedPropertyId(propiedad.id);
                          }}
                        >
                          <span>{propiedad.titulo}</span>
                          <strong>{propiedad.distancia.toFixed(1)} km</strong>
                          <small>
                            {propiedad.barrio} ·{" "}
                            {propiedad.precio
                              ? `$${Number(propiedad.precio).toLocaleString("es-AR")}`
                              : "Precio a consultar"}
                          </small>
                        </button>
                      );
                    })
                  ) : (
                    <div className="map-empty-message">
                      <p>
                        No encontramos alquileres disponibles a menos de{" "}
                        {MAX_RECOMMENDATION_DISTANCE_KM} km de{" "}
                        {selectedStop?.name || selectedInstitution.abreviatura}.
                      </p>
                      {fartherProperties.length === 0 && (
                        <p>No hay otras opciones disponibles por el momento.</p>
                      )}
                    </div>
                  )}

                  {fartherProperties.length > 0 && (
                    <button
                      type="button"
                      className="map-distance-toggle"
                      onClick={() =>
                        setFartherOptionsStopId(
                          showFartherProperties ? null : selectedStopId,
                        )
                      }
                    >
                      {showFartherProperties
                        ? `Mostrar solo hasta ${MAX_RECOMMENDATION_DISTANCE_KM} km`
                        : `Ver opciones más lejanas (${fartherProperties.length})`}
                    </button>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PropertyMapPage;
