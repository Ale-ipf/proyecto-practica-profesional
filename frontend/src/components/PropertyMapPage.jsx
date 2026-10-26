import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { textoDisponibilidad } from '../utils/formato'

function FitSelectedInstitution({ institucion }) {
  const map = useMap()

  useEffect(() => {
    const focusPoints = institucion.paradas?.length
      ? institucion.paradas.map((parada) => parada.coordenadas)
      : [institucion.coordenadas]

    map.fitBounds(focusPoints, {
      padding: [32, 32],
      maxZoom: 14,
    })
  }, [institucion, map])

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

function distanceToInstitution(coordenadas, institucion) {
  const referencePoints = institucion.paradas?.length
    ? institucion.paradas.map((parada) => parada.coordenadas)
    : [institucion.coordenadas]

  return Math.min(...referencePoints.map((point) => distanceInKm(point, coordenadas)))
}

function PropertyMapPage({ propiedades, instituciones }) {
  const [searchParams] = useSearchParams()
  const selectedInstitution = instituciones.find((item) => String(item.id) === searchParams.get('institucion')) || instituciones[0]
  const nearbyProperties = useMemo(() => propiedades.filter((propiedad) => propiedad.estado === 'available' && propiedad.coordenadas).map((propiedad) => ({ ...propiedad, distancia: distanceToInstitution(propiedad.coordenadas, selectedInstitution) })).sort((first, second) => first.distancia - second.distancia), [propiedades, selectedInstitution])

  return <div className="app-shell route-page-shell"><header className="site-header"><Link className="brand-title" to="/">Alquileres Formosa</Link><nav className="main-nav"><Link to="/alquileres">Alquileres</Link><Link to="/mapa">Mapa</Link></nav><Link className="button button-primary" to="/alquileres">Volver a los alquileres</Link></header><main className="map-page"><div className="map-page-heading"><div><span className="section-kicker">MAPA INTERACTIVO</span><h1>Encontrá alquileres cerca de tu institución.</h1><p className="route-description">Explorá las instituciones educativas y los alquileres disponibles ordenados por cercanía.</p></div><div className="map-selected-institution"><span>{selectedInstitution.abreviatura}</span><strong>{selectedInstitution.nombre}</strong></div></div><div className="map-page-layout"><div className="leaflet-map-wrapper"><MapContainer center={selectedInstitution.paradas?.[0]?.coordenadas || selectedInstitution.coordenadas} zoom={14} scrollWheelZoom className="leaflet-map"><FitSelectedInstitution institucion={selectedInstitution} /><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />{instituciones.map((institucion) => <Marker key={institucion.id} position={institucion.coordenadas}><Popup><strong>{institucion.nombre}</strong><br />{institucion.tipo}</Popup></Marker>)}{(selectedInstitution.paradas || []).map((parada) => <Marker key={`${selectedInstitution.id}-${parada.name}`} position={parada.coordenadas}><Popup><strong>Parada del colectivo: {parada.name}</strong><br />{parada.address}<br />Servicio hacia {selectedInstitution.abreviatura}</Popup></Marker>)}{nearbyProperties.map((propiedad) => <Marker key={propiedad.id} position={propiedad.coordenadas}><Popup><strong>{propiedad.titulo}</strong><br />{propiedad.distancia.toFixed(1)} km de {selectedInstitution.paradas?.length ? 'la parada más cercana' : selectedInstitution.abreviatura}<br />{textoDisponibilidad(propiedad.estado, propiedad.cuposDisponibles)}<br /><Link to={`/alquileres/${propiedad.id}`}>Ver propiedad</Link></Popup></Marker>)}</MapContainer></div><aside className="map-results"><span className="section-kicker">{selectedInstitution.paradas?.length ? 'PROPIEDADES CERCANAS A LAS PARADAS' : 'PROPIEDADES CERCANAS'}</span><h2>{nearbyProperties.length} opciones encontradas</h2>{nearbyProperties.length ? nearbyProperties.map((propiedad) => <Link className="map-result-item" key={propiedad.id} to={`/alquileres/${propiedad.id}`}><span>{propiedad.titulo}</span><strong>{propiedad.distancia.toFixed(1)} km</strong><small>{textoDisponibilidad(propiedad.estado, propiedad.cuposDisponibles)}</small><small>${Number(propiedad.precio).toLocaleString('es-AR')} / mes</small></Link>) : <p className="map-empty-message">Todavía no hay alquileres con ubicación marcada. Los dueños pueden agregarla o actualizarla al editar su publicación.</p>}</aside></div></main></div>
}

export default PropertyMapPage