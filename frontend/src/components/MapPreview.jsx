import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function FitInstitutions({ instituciones }) {
  const map = useMap()

  useEffect(() => {
    if (instituciones.length) {
      map.fitBounds(instituciones.map((institucion) => institucion.coordenadas), {
        padding: [24, 24],
        maxZoom: 14,
      })
    }
  }, [instituciones, map])

  return null
}

function MapPreview({ propiedades, instituciones }) {
  const propiedadesDisponibles = propiedades.filter((propiedad) => propiedad.estado === 'available' && propiedad.coordenadas)

  return (
    <section className="map-preview"><div className="map-preview-header"><div><span className="section-kicker">UBICACIÓN Y CERCANÍA</span><h2>Explorá Formosa en el mapa</h2><p>Consultá las instituciones educativas y los alquileres disponibles en una misma vista.</p></div><Link className="button button-accent" to="/mapa">Ver instituciones</Link></div><div className="map-preview-frame"><MapContainer center={[-26.1849, -58.1731]} zoom={13} scrollWheelZoom={false} className="preview-leaflet-map"><FitInstitutions instituciones={instituciones} /><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{instituciones.map((institucion) => <CircleMarker key={institucion.id} center={institucion.coordenadas} pathOptions={{ color: '#c96b4b', fillColor: '#c96b4b', fillOpacity: 0.85 }} radius={8}><Popup><strong>{institucion.nombre}</strong><br />{institucion.tipo}</Popup></CircleMarker>)}{propiedadesDisponibles.map((propiedad) => <CircleMarker key={propiedad.id} center={propiedad.coordenadas} pathOptions={{ color: '#255e55', fillColor: '#255e55', fillOpacity: 0.8 }} radius={6}><Popup><strong>{propiedad.titulo}</strong><br /><Link to={`/alquileres/${propiedad.id}`}>Ver propiedad</Link></Popup></CircleMarker>)}</MapContainer></div><div className="map-preview-legend"><span><i className="legend-dot institution-dot" /> Instituciones educativas</span><span><i className="legend-dot property-dot" /> Alquileres disponibles</span></div></section>
  )
}

export default MapPreview