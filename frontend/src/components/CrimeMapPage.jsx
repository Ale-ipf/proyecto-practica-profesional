import { useEffect, useState } from "react";
import L from "leaflet";
import { Link } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { notaMetodologica, zonasDelito } from "../delitos-data";

const centroFormosa = [-26.1849, -58.1731];
const formatoNumero = new Intl.NumberFormat("es-AR");

const focosCalorIlustrativos = [
  { lat: -26.181, lng: -58.174, radius: 54, incidencia: "Alta" },
  { lat: -26.183, lng: -58.17, radius: 48, incidencia: "Alta" },
  { lat: -26.186, lng: -58.168, radius: 46, incidencia: "Alta" },
  { lat: -26.188, lng: -58.174, radius: 42, incidencia: "Alta" },
  { lat: -26.179, lng: -58.168, radius: 40, incidencia: "Alta" },
  { lat: -26.14, lng: -58.196, radius: 48, incidencia: "Muy alta" },
  { lat: -26.145, lng: -58.187, radius: 56, incidencia: "Muy alta" },
  { lat: -26.151, lng: -58.18, radius: 52, incidencia: "Muy alta" },
  { lat: -26.135, lng: -58.176, radius: 43, incidencia: "Muy alta" },
  { lat: -26.155, lng: -58.198, radius: 46, incidencia: "Muy alta" },
  { lat: -26.143, lng: -58.168, radius: 42, incidencia: "Muy alta" },
];

function FitCrimeZones() {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(
      L.latLngBounds(zonasDelito.map((zona) => zona.puntoRepresentativo)),
      {
      padding: [24, 24],
      maxZoom: 13,
      },
    );
  }, [map]);

  return null;
}

function CrimeHeatmapOverlay() {
  const map = useMap();

  useEffect(() => {
    let pane = map.getPane("crimeHeatPane");
    if (!pane) {
      pane = map.createPane("crimeHeatPane");
      pane.style.zIndex = "350";
    }

    const canvas = L.DomUtil.create("canvas", "crime-heat-canvas", pane);
    const context = canvas.getContext("2d");
    if (!context) {
      canvas.remove();
      throw new Error("No se pudo inicializar la capa del mapa de calor.");
    }

    const draw = () => {
      const size = map.getSize();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(size.x * pixelRatio);
      canvas.height = Math.round(size.y * pixelRatio);
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
      L.DomUtil.setPosition(canvas, map.containerPointToLayerPoint([0, 0]));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, size.x, size.y);

      const zoomScale = Math.pow(2, map.getZoom() - 13);
      focosCalorIlustrativos.forEach((foco) => {
        const point = map.latLngToContainerPoint([foco.lat, foco.lng]);
        const radius = Math.max(18, Math.min(150, foco.radius * zoomScale));
        const gradient = context.createRadialGradient(
          point.x,
          point.y,
          radius * 0.04,
          point.x,
          point.y,
          radius,
        );

        if (foco.incidencia === "Muy alta") {
          gradient.addColorStop(0, "rgba(255, 42, 0, 0.88)");
          gradient.addColorStop(0.2, "rgba(255, 112, 0, 0.78)");
          gradient.addColorStop(0.42, "rgba(255, 225, 0, 0.68)");
        } else {
          gradient.addColorStop(0, "rgba(255, 190, 0, 0.72)");
          gradient.addColorStop(0.2, "rgba(255, 225, 0, 0.68)");
          gradient.addColorStop(0.42, "rgba(110, 220, 30, 0.58)");
        }

        gradient.addColorStop(0.64, "rgba(20, 205, 95, 0.46)");
        gradient.addColorStop(0.82, "rgba(0, 160, 235, 0.3)");
        gradient.addColorStop(1, "rgba(35, 85, 255, 0)");
        context.fillStyle = gradient;
        context.fillRect(
          point.x - radius,
          point.y - radius,
          radius * 2,
          radius * 2,
        );
      });
    };

    map.on("moveend zoomend resize", draw);
    draw();

    return () => {
      map.off("moveend zoomend resize", draw);
      canvas.remove();
    };
  }, [map]);

  return null;
}

function CrimeMapPage() {
  const [modoMapa, setModoMapa] = useState("zonas");

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">
          Alquileres Formosa
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link to="/alquileres">Alquileres</Link>
          <Link to="/mapa">Mapa de alquileres</Link>
        </nav>
        <Link className="button button-primary" to="/alquileres">
          Volver a los alquileres
        </Link>
      </header>

      <main className="crime-map-page">
        <section className="crime-map-heading">
          <span className="section-kicker">INFORMACIÓN TERRITORIAL · FORMOSA</span>
          <h1>Mapa orientativo del delito</h1>
          <p>
            Visualización por sectores basada en las estimaciones del documento
            vecinal de referencia. No representa ubicaciones precisas de hechos
            individuales.
          </p>
        </section>

        <section className="crime-map-metrics" aria-label="Indicadores citados">
          <article className="crime-metric">
            <span className="section-kicker">PROMEDIO INFORMADO</span>
            <strong>1 cada 98</strong>
            <p>habitantes, según el documento de referencia.</p>
          </article>
          <article className="crime-metric">
            <span className="section-kicker">CIFRA NEGRA ESTIMADA</span>
            <strong>55%</strong>
            <p>de víctimas no denunciaría, según esa misma fuente.</p>
          </article>
          <article className="crime-metric">
            <span className="section-kicker">ESCENARIO ILUSTRATIVO</span>
            <strong>≈3.000</strong>
            <p>denuncias formales estimadas en el documento.</p>
          </article>
        </section>

        <section className="crime-map-panel">
          <div className="crime-map-toolbar">
            <div>
              <span className="section-kicker">SECTORES ANALIZADOS</span>
              <h2>
                {modoMapa === "zonas"
                  ? "Zonas de incidencia cualitativa"
                  : "Estimaciones agregadas por zona"}
              </h2>
            </div>
            <div className="crime-map-modes" role="group" aria-label="Tipo de visualización">
              <button
                type="button"
                aria-pressed={modoMapa === "zonas"}
                className={modoMapa === "zonas" ? "is-selected" : ""}
                onClick={() => setModoMapa("zonas")}
              >
                Zonas
              </button>
              <button
                type="button"
                aria-pressed={modoMapa === "cantidades"}
                className={modoMapa === "cantidades" ? "is-selected" : ""}
                onClick={() => setModoMapa("cantidades")}
              >
                Cantidades
              </button>
            </div>
          </div>

          <p className="crime-view-note">
            {modoMapa === "zonas"
              ? "El degradado es una representación cualitativa de los sectores informados; sus focos son ilustrativos, no ubicaciones ni densidades reales de delitos."
              : "Cada círculo resume una estimación del sector completo. Su posición es representativa y no indica dónde ocurrieron los hechos."}
          </p>

          <div className="crime-map-layout">
            <div className="crime-map-frame">
              <MapContainer
                center={centroFormosa}
                zoom={13}
                scrollWheelZoom
                className="crime-leaflet-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FitCrimeZones />
                {modoMapa === "zonas" && <CrimeHeatmapOverlay />}
                {modoMapa === "cantidades" &&
                  zonasDelito.map((zona) => (
                    <Marker
                      key={`${zona.id}-cantidad`}
                      position={zona.puntoRepresentativo}
                      icon={L.divIcon({
                        className: "crime-count-marker",
                        html: `<span>${formatoNumero.format(zona.denunciasAnualesEstimadas)}</span>`,
                        iconSize: [92, 48],
                        iconAnchor: [46, 24],
                      })}
                    >
                      <Popup>
                        <div className="crime-popup">
                          <strong>{zona.nombre}</strong>
                          <span>
                            Denuncias anuales estimadas:{" "}
                            {formatoNumero.format(
                              zona.denunciasAnualesEstimadas,
                            )}
                          </span>
                          <span>
                            Punto representativo del sector; no corresponde
                            a una ubicación de hechos.
                          </span>
                          <small>{notaMetodologica}</small>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>

            <aside className="crime-zones-panel">
              <h2>Referencias por sector</h2>
              {zonasDelito.map((zona) => (
                <article className="crime-zone-summary" key={zona.id}>
                  <div className="crime-zone-title">
                    <span
                      className={`crime-zone-swatch ${zona.incidencia === "Muy alta" ? "is-highest" : ""}`}
                      aria-hidden="true"
                    />
                    <h3>{zona.nombre}</h3>
                  </div>
                  <span className="crime-zone-level">
                    Incidencia {zona.incidencia.toLowerCase()}
                  </span>
                  <p>{zona.delitoPrincipal}</p>
                  <strong>
                    ≈
                    {formatoNumero.format(zona.denunciasAnualesEstimadas)}{" "}
                    <span>
                      denuncias estimadas/año
                    </span>
                  </strong>
                </article>
              ))}
              <p className="crime-zones-disclaimer">{notaMetodologica}</p>
            </aside>
          </div>
          <div className="crime-map-legend">
            {modoMapa === "zonas" ? (
              <>
                <span>Menor énfasis visual</span>
                <i className="crime-heat-legend" aria-hidden="true" />
                <span>Mayor énfasis visual</span>
                <span className="crime-legend-note">
                  Intensidad ilustrativa; no representa cantidades.
                </span>
              </>
            ) : (
              <>
                <i className="crime-legend-swatch is-highest" aria-hidden="true" />
                <span>Estimación agregada del sector</span>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default CrimeMapPage;
