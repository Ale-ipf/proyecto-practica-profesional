import { Link } from 'react-router-dom'
import OpinionsSection from './OpinionSection'

function PropertyDetails({ propiedad }) {
  const textoAmbientes = propiedad.ambientes === 3 ? '3 ambientes' : propiedad.ambientes === 2 ? '2 ambientes' : 'Monoambiente'

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">Alquileres Formosa</Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link to="/">Alquileres</Link>
          <Link to="/mapa">Mapa</Link>
        </nav>
        <Link className="button button-primary" to="/">Volver al listado</Link>
      </header>
      <main className="property-details-page">
        <Link className="back-link" to="/">← Volver a los alquileres</Link>
        <section className="property-details-hero">
          <div className="property-details-image"><img src={propiedad.imagen} alt={`Foto de ${propiedad.titulo}`} /><span className="detail-status">Disponible</span></div>
          <div className="property-details-summary"><span className="section-kicker">DETALLE DEL ALQUILER</span><div className="badges"><span>{`Barrio ${propiedad.barrio}`}</span><span>{textoAmbientes}</span><span>{propiedad.amoblado ? 'Amoblado' : 'Sin amoblar'}</span></div><h1>{propiedad.titulo}</h1><p className="property-address">⌖ {propiedad.direccion}</p><p className="detail-price">${Number(propiedad.precio).toLocaleString('es-AR')} <small>/ mes</small></p><p className="property-description detail-description">{propiedad.descripcion}</p></div>
        </section>
        <section className="property-details-content">
          <div className="detail-info-panel"><span className="section-kicker">CARACTERÍSTICAS</span><h2>Todo lo que necesitás saber</h2><div className="detail-features"><span><strong>{textoAmbientes}</strong>Ambientes</span><span><strong>{propiedad.amoblado ? 'Sí' : 'No'}</strong>Amoblado</span><span><strong>{propiedad.tieneAire ? 'Sí' : 'No'}</strong>Aire acondicionado</span><span><strong>{propiedad.barrio}</strong>Zona</span></div></div>
          <aside className="contact-owner-panel"><span className="section-kicker">PUBLICADO POR</span><h2>{propiedad.propietario?.nombre || propiedad.dueno}</h2><p className="muted small-text">{propiedad.propietario?.presentacion || 'Propietario verificado de Alquileres Formosa.'}</p><div className="owner-public-details"><span>☎ {propiedad.propietario?.telefono || 'Teléfono disponible al consultar'}</span><span>⌖ {propiedad.propietario?.ciudad || 'Formosa Capital'}</span></div></aside>
        </section>
        <section className="map-section"><div className="map-heading"><div><span className="section-kicker">UBICACIÓN DE REFERENCIA</span><h2>Conocé la zona</h2><p className="muted small-text">Mapa orientativo de la ciudad. La ubicación exacta se confirma al coordinar la visita.</p></div><span className="map-location">⌖ Formosa, Argentina</span></div><div className="map-frame"><iframe title="Mapa de referencia de Formosa" src="https://www.google.com/maps?q=Formosa%2C%20Argentina&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe></div></section>
        <OpinionsSection propiedad={propiedad} />
      </main>
    </div>
  )
}

export default PropertyDetails