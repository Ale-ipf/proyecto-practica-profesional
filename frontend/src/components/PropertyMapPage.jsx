import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { textoDisponibilidad } from '../utils/formato'

function FitInstitutions({ instituciones }) {
  const map = useMap()

  useEffect(() => {
    if (instituciones.length) {
      map.fitBounds(instituciones.map((institucion) => institucion.coordenadas), {
        padding: [32, 32],
        maxZoom: 14,
      })
    }
  }, [instituciones, map])

  return null
}

function distanceInKm(first, second) {
  const [lat1, lon1] = first
  const [lat2, lon2] = second
  const earthRadius = 6371
  const latDistance = ((lat2 - lat1) * Math.PI) / 180
  const lonDistance = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(latDistance / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(lonDistance / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function PropertyMapPage({ propiedades, instituciones }) {
  const [searchParams] = useSearchParams()
  const selectedInstitution = instituciones.find((item) => String(item.id) === searchParams.get('institucion')) || instituciones[0]
  const nearbyProperties = useMemo(() => propiedades.filter((propiedad) => propiedad.estado === 'available' && propiedad.coordenadas).map((propiedad) => ({ ...propiedad, distancia: distanceInKm(selectedInstitution.coordenadas, propiedad.coordenadas) })).sort((first, second) => first.distancia - second.distancia), [propiedades, selectedInstitution])

  return <div className="app-shell route-page-shell"><header className="site-header"><Link className="brand-title" to="/">Alquileres Formosa</Link><nav className="main-nav"><Link to="/alquileres">Alquileres</Link><Link to="/mapa">Mapa</Link></nav><Link className="button button-primary" to="/alquileres">Volver a los alquileres</Link></header><main className="map-page"><div className="map-page-heading"><div><span className="section-kicker">MAPA INTERACTIVO</span><h1>Encontrá alquileres cerca de tu institución.</h1><p className="route-description">Explorá las instituciones educativas y los alquileres disponibles ordenados por cercanía.</p></div><div className="map-selected-institution"><span>{selectedInstitution.abreviatura}</span><strong>{selectedInstitution.nombre}</strong></div></div><div className="map-page-layout"><div className="leaflet-map-wrapper"><MapContainer center={selectedInstitution.coordenadas} zoom={14} scrollWheelZoom className="leaflet-map"><FitInstitutions instituciones={instituciones} /><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{instituciones.map((institucion) => <Marker key={institucion.id} position={institucion.coordenadas}><Popup><strong>{institucion.nombre}</strong><br />{institucion.tipo}</Popup></Marker>)}{nearbyProperties.map((propiedad) => <Marker key={propiedad.id} position={propiedad.coordenadas}><Popup><strong>{propiedad.titulo}</strong><br />{propiedad.distancia.toFixed(1)} km de {selectedInstitution.abreviatura}<br />{textoDisponibilidad(propiedad.estado, propiedad.cuposDisponibles)}<br /><Link to={`/alquileres/${propiedad.id}`}>Ver propiedad</Link></Popup></Marker>)}</MapContainer></div><aside className="map-results"><span className="section-kicker">PROPIEDADES CERCANAS</span><h2>{nearbyProperties.length} opciones encontradas</h2>{nearbyProperties.length ? nearbyProperties.map((propiedad) => <Link className="map-result-item" key={propiedad.id} to={`/alquileres/${propiedad.id}`}><span>{propiedad.titulo}</span><strong>{propiedad.distancia.toFixed(1)} km</strong><small>{textoDisponibilidad(propiedad.estado, propiedad.cuposDisponibles)}</small><small>${Number(propiedad.precio).toLocaleString('es-AR')} / mes</small></Link>) : <p className="map-empty-message">Todavía no hay alquileres con ubicación marcada. Los dueños pueden agregarla o actualizarla al editar su publicación.</p>}</aside></div></main></div>
}

export default PropertyMapPage