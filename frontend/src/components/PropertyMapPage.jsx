import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Link, useSearchParams } from "react-router-dom";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { textoDisponibilidad } from "../utils/formato";
import { useLocationSharing } from "../context/LocationContext.jsx";

const SEARCH_RADII_KM = [0.5, 1, 1.5];

function formatDistance(distanceKm) {
  if (distanceKm === 0.5) return "500 m";
  return `${String(distanceKm).replace(".", ",")} km`;
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

function FocusSelectedProperty({ propiedad }) {
  const map = useMap();

  useEffect(() => {
    if (!propiedad?.coordenadas?.length) return;

    map.flyTo(propiedad.coordenadas, 15, { duration: 1.2 });
  }, [map, propiedad]);

  return null;
}

function FocusUserLocation({ coordinates, active }) {
  const map = useMap();

  useEffect(() => {
    if (!active || !coordinates) return;

    map.flyTo(coordinates, 15, { duration: 1.2 });
  }, [active, coordinates, map]);

  return null;
}

function FocusSelectedInstitution({ institution, active }) {
  const map = useMap();

  useEffect(() => {
    if (active && institution?.coordenadas) {
      map.flyTo(institution.coordenadas, 15, { duration: 1.2 });
    }
  }, [active, institution, map]);

  return null;
}

function FitVisibleInstitutions({ institutions, active, selectedInstitution }) {
  const map = useMap();

  useEffect(() => {
    if (!active || selectedInstitution) return;

    const points = institutions
      .map((institution) => institution.coordenadas)
      .filter(
        (coordinates) =>
          Array.isArray(coordinates) && coordinates.every(Number.isFinite),
      );

    if (points.length) {
      map.fitBounds(points, { padding: [32, 32], maxZoom: 14 });
    }
  }, [active, institutions, map, selectedInstitution]);

  return null;
}

function FocusSelectedStop({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates) map.flyTo(coordinates, 16, { duration: 1 });
  }, [coordinates, map]);

  return null;
}

function PropertyMapPage({
  propiedades,
  instituciones,
  errorInstituciones,
  cargandoInstituciones,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showProperties, setShowProperties] = useState(true);
  const [showInstitutions, setShowInstitutions] = useState(false);
  const {
    coordinates: userLocation,
    isSharing: isSharingLocation,
    error: locationError,
    startSharing,
    stopSharing,
  } = useLocationSharing();
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [searchRadiusKm, setSearchRadiusKm] = useState(0.5);
  const [showFartherOptions, setShowFartherOptions] = useState(false);
  const [selectedStopKey, setSelectedStopKey] = useState(null);
  const isUsingUserLocation = Boolean(userLocation);
  const selectedInstitutionId = searchParams.get("institucion");
  const selectedInstitution =
    instituciones.find(
      (institution) => String(institution.id) === selectedInstitutionId,
    ) || null;
  const selectedStop = selectedInstitution?.busStops.find(
    (stop) => `${stop.name}-${stop.address}` === selectedStopKey,
  );
  const availableProperties = useMemo(
    () =>
      propiedades
        .filter(
          (propiedad) =>
            propiedad.estado === "available" && propiedad.coordenadas,
        )
        .map((propiedad) => ({
          ...propiedad,
          distancia: userLocation
            ? distanceInKm(userLocation, propiedad.coordenadas)
            : null,
        }))
        .sort((first, second) =>
          userLocation ? first.distancia - second.distancia : 0,
        ),
    [propiedades, userLocation],
  );
  const nearbyProperties = isUsingUserLocation
    ? availableProperties.filter(
        (propiedad) => propiedad.distancia <= searchRadiusKm,
      )
    : availableProperties;
  const fartherProperties = isUsingUserLocation
    ? availableProperties.filter(
        (propiedad) => propiedad.distancia > searchRadiusKm,
      )
    : [];
  const displayedProperties = showFartherOptions
    ? availableProperties
    : nearbyProperties;
  const mapCenter =
    (showProperties && userLocation) ||
    selectedInstitution?.coordenadas ||
    (showInstitutions && instituciones[0]?.coordenadas) ||
    availableProperties[0]?.coordenadas ||
    [-26.1922042, -58.2002557];

  const selectedProperty =
    availableProperties.find(
      (propiedad) => propiedad.id === selectedPropertyId,
    ) || null;

  useEffect(() => {
    startSharing();
  }, [startSharing]);

  const selectInstitution = (institutionId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("institucion", String(institutionId));
    setSearchParams(nextParams);
    setShowInstitutions(true);
    setSelectedStopKey(null);
  };

  const selectStop = (stop) => {
    setSelectedStopKey(`${stop.name}-${stop.address}`);
  };

  const handleUserLocationAction = () => {
    if (isSharingLocation) {
      stopSharing();
      return;
    }

    if (startSharing()) {
      setShowFartherOptions(false);
    }
  };

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">
          Alquileres Formosa
        </Link>
        <div className="map-selected-institution is-overview">
          <span>SECCIÓN ACTUAL</span>
          <strong>Alquileres e instituciones</strong>
        </div>
        <Link className="button button-primary" to="/">
          Volver al inicio
        </Link>
      </header>

      <main className="map-page" id="mapa">
        <div className="map-page-heading">
          <div>
            <span className="section-kicker">MAPA INTERACTIVO</span>
            <h1>Explorá alquileres e instituciones en Formosa.</h1>
            <p className="route-description">
              Activá una o ambas capas para encontrar alquileres disponibles,
              instituciones educativas y sus paradas cercanas.
            </p>
          </div>
          <div className="map-header-actions">
            <button
              type="button"
              className="map-distance-toggle"
              onClick={handleUserLocationAction}
            >
              {isSharingLocation
                ? "Desactivar ubicación"
                : "Activar ubicación"}
            </button>
          </div>
        </div>

        {locationError && (
          <p className="location-consent-error" role="alert">
            {locationError}
          </p>
        )}
        {isSharingLocation && !userLocation && !locationError && (
          <p className="muted" role="status">
            Buscando tu ubicación…
          </p>
        )}

        <div
          className="map-layer-filters"
          role="group"
          aria-label="Filtros del mapa"
        >
          <button
            type="button"
            className={`map-layer-filter ${showProperties ? "is-active" : ""}`}
            aria-pressed={showProperties}
            onClick={() => setShowProperties((active) => !active)}
          >
            Alquileres
            <span>{availableProperties.length}</span>
          </button>
          <button
            type="button"
            className={`map-layer-filter ${showInstitutions ? "is-active" : ""}`}
            aria-pressed={showInstitutions}
            onClick={() => setShowInstitutions((active) => !active)}
          >
            Instituciones
            <span>
              {cargandoInstituciones ? "…" : instituciones.length}
            </span>
          </button>
        </div>

        {errorInstituciones && (
          <p className="error-message" role="alert">
            {errorInstituciones}
          </p>
        )}

        <div className="map-page-layout">
          <div className="leaflet-map-wrapper">
            <MapContainer
              center={mapCenter}
              zoom={userLocation ? 14 : 13}
              scrollWheelZoom
              className="leaflet-map"
            >
              <FocusSelectedProperty propiedad={selectedProperty} />
              <FocusUserLocation
                coordinates={userLocation}
                active={showProperties && isUsingUserLocation}
              />
              <FocusSelectedInstitution
                institution={selectedInstitution}
                active={showInstitutions}
              />
              <FitVisibleInstitutions
                institutions={instituciones}
                active={showInstitutions}
                selectedInstitution={selectedInstitution}
              />
              <FocusSelectedStop coordinates={selectedStop?.coordenadas} />
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {userLocation && (
                <CircleMarker
                  center={userLocation}
                  pathOptions={{
                    color: "#ffffff",
                    fillColor: "#2476d2",
                    fillOpacity: 1,
                    weight: 3,
                  }}
                  radius={9}
                >
                  <Popup>Tu ubicación actual</Popup>
                </CircleMarker>
              )}

              {showProperties &&
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
                        {propiedad.distancia == null
                          ? "Alquiler disponible"
                          : `${propiedad.distancia.toFixed(1)} km de tu ubicación`}
                        <br />
                        {textoDisponibilidad(propiedad.estado)}
                      </Popup>
                    </Marker>
                  );
                })}

              {showInstitutions &&
                instituciones.map((institution) => {
                  const isSelected =
                    institution.id === selectedInstitution?.id;

                  return (
                    <CircleMarker
                      key={institution.id}
                      center={institution.coordenadas}
                      pathOptions={{
                        color: "#ffffff",
                        fillColor: isSelected ? "#ff8a1c" : "#255e55",
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

              {showInstitutions &&
                selectedInstitution?.busStops.map((stop) => (
                  <CircleMarker
                    key={`${stop.name}-${stop.address}`}
                    center={stop.coordenadas}
                    pathOptions={{
                      color: "#ffffff",
                      fillColor:
                        selectedStopKey === `${stop.name}-${stop.address}`
                          ? "#ff8a1c"
                          : "#849d74",
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

          <aside className="map-results">
            {!showProperties && !showInstitutions && (
              <p className="map-empty-message">
                Activá Alquileres o Instituciones para mostrar resultados.
              </p>
            )}

            {showProperties && (
              <div className="map-nearby-block">
                <span className="section-kicker">
                  {userLocation
                    ? "ALQUILERES CERCANOS A TU UBICACIÓN"
                    : "ALQUILERES DISPONIBLES"}
                </span>
                <h2>
                  {displayedProperties.length} alquileres
                  {userLocation ? " cercanos" : " disponibles"}
                </h2>

                {userLocation ? (
                  <>
                    <div className="map-radius-control">
                      <span className="section-kicker">RADIO DE BÚSQUEDA</span>
                      <div
                        className="map-radius-options"
                        role="group"
                        aria-label="Radio de búsqueda de alquileres"
                      >
                        {SEARCH_RADII_KM.map((radius) => (
                          <button
                            key={radius}
                            type="button"
                            className={`map-radius-option ${searchRadiusKm === radius ? "is-selected" : ""}`}
                            aria-pressed={searchRadiusKm === radius}
                            onClick={() => {
                              setSearchRadiusKm(radius);
                              setShowFartherOptions(false);
                            }}
                          >
                            {formatDistance(radius)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!nearbyProperties.length && !showFartherOptions && (
                      <div className="map-empty-message">
                        No hay alquileres disponibles a menos de{" "}
                        {formatDistance(searchRadiusKm)}.
                      </div>
                    )}
                  </>
                ) : (
                  <p className="map-empty-message">
                    Activá tu ubicación para encontrar primero los alquileres
                    más cercanos.
                  </p>
                )}

                {!displayedProperties.length ? (
                  <p className="map-empty-message">
                    No hay alquileres disponibles para mostrar.
                  </p>
                ) : (
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
                        <strong>
                          {propiedad.distancia == null
                            ? "Activá ubicación"
                            : `${propiedad.distancia.toFixed(1)} km`}
                        </strong>
                        <small>
                          {propiedad.barrio} ·{" "}
                          {propiedad.precio
                            ? `$${Number(propiedad.precio).toLocaleString("es-AR")}`
                            : "Precio a consultar"}
                        </small>
                      </button>
                    );
                  })
                )}

                {userLocation && fartherProperties.length > 0 && (
                  <button
                    type="button"
                    className="map-distance-toggle"
                    onClick={() => setShowFartherOptions((current) => !current)}
                  >
                    {showFartherOptions
                      ? `Volver a ${formatDistance(searchRadiusKm)}`
                      : `Ver más lejanos (${fartherProperties.length})`}
                  </button>
                )}
              </div>
            )}

            {showInstitutions && (
              <div className="map-institutions-block">
                <span className="section-kicker">INSTITUCIONES EDUCATIVAS</span>
                <h2>{instituciones.length} instituciones</h2>
                {cargandoInstituciones && (
                  <p className="map-empty-message">
                    Cargando instituciones…
                  </p>
                )}
                {!cargandoInstituciones &&
                  !instituciones.length &&
                  !errorInstituciones && (
                    <p className="map-empty-message">
                      Todavía no hay instituciones disponibles.
                    </p>
                  )}
                {instituciones.map((institution) => {
                  const isSelected =
                    selectedInstitution?.id === institution.id;

                  return (
                    <div
                      className="map-institution-result"
                      key={institution.id}
                    >
                      <button
                        type="button"
                        className={`map-result-item ${isSelected ? "is-selected" : ""}`}
                        aria-pressed={isSelected}
                        onClick={() => selectInstitution(institution.id)}
                      >
                        <span>{institution.name}</span>
                        <strong>{institution.type}</strong>
                      </button>
                      {isSelected && institution.busStops.length > 0 && (
                        <div className="map-institution-stops">
                          <span className="section-kicker">
                            PARADAS CERCANAS
                          </span>
                          {institution.busStops.map((stop) => {
                            const stopKey = `${stop.name}-${stop.address}`;

                            return (
                              <button
                                key={stopKey}
                                type="button"
                                className={`map-institution-stop ${selectedStopKey === stopKey ? "is-selected" : ""}`}
                                onClick={() => selectStop(stop)}
                              >
                                <strong>{stop.name}</strong>
                                <small>{stop.address}</small>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PropertyMapPage;
