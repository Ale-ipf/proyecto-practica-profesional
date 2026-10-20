import { Link } from 'react-router-dom'
import OpinionsSection from './OpinionSection'
import { textoDisponibilidad } from '../utils/formato'

function PropertyDetails({ propiedad, esEstudiante, esFavorito, onToggleFavorite }) {
  const textoAmbientes = propiedad.ambientes === 3 ? '3 ambientes' : propiedad.ambientes === 2 ? '2 ambientes' : 'Monoambiente'
  const sinDisponibilidad = propiedad.estado === 'rented' || propiedad.cuposDisponibles === 0
  const ubicacion = [propiedad.direccion, propiedad.ciudad || propiedad.propietario?.ciudad, 'Argentina']
    .filter(Boolean)
    .join(', ')
  const mapaUrl = `https://www.google.com/maps?q=${encodeURIComponent(ubicacion)}&output=embed`

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">Alquileres Formosa</Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link to="/alquileres">Alquileres</Link>
          <Link to="/mapa">Mapa</Link>
        </nav>
        <Link className="button button-primary" to="/alquileres">Volver al listado</Link>
      </header>
      <main className="property-details-page">
        <Link className="back-link" to="/alquileres">← Volver a los alquileres</Link>
        <section className="property-details-hero">
          <div className="property-details-image"><img src={propiedad.imagen} alt={`Foto de ${propiedad.titulo}`} /><span className={`detail-status${sinDisponibilidad ? ' detail-status-full' : ''}`} role="status">{textoDisponibilidad(propiedad.estado, propiedad.cuposDisponibles)}</span></div>
          <div className="property-details-summary"><span className="section-kicker">DETALLE DEL ALQUILER</span><div className="badges"><span>{`Barrio ${propiedad.barrio}`}</span><span>{textoAmbientes}</span><span>{propiedad.amoblado ? 'Amoblado' : 'Sin amoblar'}</span></div><h1>{propiedad.titulo}</h1><p className="property-address">⌖ {propiedad.direccion}</p><p className="detail-price">${Number(propiedad.precio).toLocaleString('es-AR')} <small>/ mes</small></p><p className="property-description detail-description">{propiedad.descripcion}</p>{esEstudiante && <button className="button button-accent favorite-toggle" type="button" onClick={onToggleFavorite} aria-pressed={esFavorito}>{esFavorito ? '⭐ Quitar de favoritos' : '☆ Agregar a favoritos'}</button>}</div>
        </section>
        <section className="property-details-content">
          <div className="detail-info-panel"><span className="section-kicker">CARACTERÍSTICAS</span><h2>Todo lo que necesitás saber</h2><div className="detail-features"><span><strong>{textoAmbientes}</strong>Ambientes</span><span><strong>{propiedad.amoblado ? 'Sí' : 'No'}</strong>Amoblado</span><span><strong>{propiedad.tieneAire ? 'Sí' : 'No'}</strong>Aire acondicionado</span><span><strong>{propiedad.barrio}</strong>Zona</span><span><strong>{Number(propiedad.cuposDisponibles ?? 1)}</strong>Espacios libres</span></div></div>
          <aside className="contact-owner-panel"><span className="section-kicker">PUBLICADO POR</span><h2>{propiedad.propietario?.nombre || propiedad.dueno}</h2><p className="muted small-text">{propiedad.propietario?.presentacion || 'Propietario verificado de Alquileres Formosa.'}</p><div className="owner-public-details"><span>☎ {propiedad.propietario?.telefono || 'Teléfono disponible al consultar'}</span><span>⌖ {propiedad.propietario?.ciudad || 'Formosa Capital'}</span></div></aside>
        </section>
        <section className="map-section"><div className="map-heading"><div><span className="section-kicker">UBICACIÓN DE REFERENCIA</span><h2>Conocé la zona</h2><p className="muted small-text">Mapa orientativo de la ubicación publicada. La ubicación exacta se confirma al coordinar la visita.</p></div><span className="map-location">⌖ {ubicacion}</span></div><div className="map-frame"><iframe title={`Mapa de ${propiedad.titulo}`} src={mapaUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe></div></section>
        <OpinionsSection propiedad={propiedad} />
      </main>
    </div>
  )
}

export default PropertyDetails