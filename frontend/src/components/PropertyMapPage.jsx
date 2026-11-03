import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Link } from "react-router-dom";
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

function PropertyMapPage({ propiedades }) {
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
  const [locationPromptOpen, setLocationPromptOpen] = useState(true);
  const isUsingUserLocation = Boolean(userLocation);
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
  const mapCenter = userLocation ||
    availableProperties[0]?.coordenadas || [-26.1922042, -58.2002557];

  const selectedProperty =
    availableProperties.find(
      (propiedad) => propiedad.id === selectedPropertyId,
    ) || null;

  const handleUserLocationAction = () => {
    if (isSharingLocation) {
      stopSharing();
      return;
    }

    setLocationPromptOpen(true);
  };

  const handleEnableLocation = () => {
    if (startSharing()) {
      setShowFartherOptions(false);
      setLocationPromptOpen(false);
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
          <strong>Alquileres</strong>
        </div>
        <Link className="button button-primary" to="/alquileres">
          Volver a los alquileres
        </Link>
      </header>

      {locationPromptOpen && !isSharingLocation && (
        <div className="location-consent-backdrop">
          <section
            className="location-consent-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-consent-title"
            aria-describedby="location-consent-description"
          >
            <span className="section-kicker">TU UBICACIÓN</span>
            <h2 id="location-consent-title">¿Querés activar tu ubicación?</h2>
            <p id="location-consent-description">
              Podemos marcar tu posición actual en el mapa. Solo pediremos
              permiso al navegador si elegís activarla; no guardamos tu
              ubicación.
            </p>
            {locationError && (
              <p className="location-consent-error" role="alert">
                {locationError}
              </p>
            )}
            <div className="location-consent-actions">
              <button
                type="button"
                className="location-consent-later"
                onClick={() => setLocationPromptOpen(false)}
              >
                Ahora no
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={handleEnableLocation}
              >
                Activar ubicación
              </button>
            </div>
          </section>
        </div>
      )}

      <main className="map-page">
        <div className="map-page-heading">
          <div>
            <span className="section-kicker">MAPA INTERACTIVO</span>
            <h1>Encontrá alquileres cerca de vos.</h1>
            <p className="route-description">
              Explorá los alquileres disponibles y, si compartís tu ubicación,
              ordenalos por cercanía.
            </p>
          </div>
          <div className="map-header-actions">
            {!locationPromptOpen && (
              <button
                type="button"
                className="map-distance-toggle"
                onClick={handleUserLocationAction}
              >
                {isSharingLocation
                  ? "Desactivar ubicación"
                  : "Activar ubicación"}
              </button>
            )}
          </div>
        </div>

        {locationError && !locationPromptOpen && (
          <p className="location-consent-error" role="alert">
            {locationError}
          </p>
        )}
        {isSharingLocation && !userLocation && !locationError && (
          <p className="muted" role="status">
            Buscando tu ubicación…
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
                active={isUsingUserLocation}
              />
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

              {displayedProperties.map((propiedad) => {
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
            </MapContainer>
          </div>

          <aside className="map-results">
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
                  Activá tu ubicación para encontrar primero los alquileres más
                  cercanos.
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
          </aside>
        </div>
      </main>
    </div>
  );
}

export default PropertyMapPage;
