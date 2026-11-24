import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import OwnerProfileSummary from './OwnerProfileSummary'
import { textoDisponibilidad } from '../utils/formato'
import { obtenerAccesoGarantia, obtenerDescargaDocumentoGarantia, solicitarAccesoGarantia } from '../api/guarantee-documents.js'

function GuaranteeAccessPanel({ propertyId }) {
  const [access, setAccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  const refresh = async () => setAccess(await obtenerAccesoGarantia(propertyId))

  useEffect(() => {
    let active = true
    obtenerAccesoGarantia(propertyId)
      .then((result) => { if (active) setAccess(result) })
      .catch((requestError) => { if (active) setError(requestError.message || 'No pudimos consultar el acceso.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [propertyId])

  const requestAccess = async () => {
    setWorking(true); setError('')
    try { await solicitarAccesoGarantia(propertyId); await refresh() }
    catch (requestError) { setError(requestError.message || 'No pudimos enviar la solicitud.') }
    finally { setWorking(false) }
  }

  const openDocument = async (document) => {
    setError('')
    try {
      const result = await obtenerDescargaDocumentoGarantia(propertyId, document.id)
      window.open(result.url, '_blank', 'noopener,noreferrer')
    } catch (requestError) { setError(requestError.message || 'No pudimos abrir el documento.') }
  }

  const status = access?.request?.status
  const label = (type) => type === 'title_deed' ? 'Escritura o título' : type === 'domain_report' ? 'Informe de dominio' : 'Consentimiento de titulares'

  return (
    <section className="property-guarantee-share" aria-labelledby="property-guarantee-title">
      <div>
        <span className="section-kicker">GARANTÍA PROPIETARIA</span>
        <h2 id="property-guarantee-title">Documentación de la garantía</h2>
        <p>Solicitá acceso al dueño. Si lo aprueba, podrás revisar los archivos durante 24 horas.</p>
      </div>
      {error && <p className="guarantee-message is-error" role="alert">{error}</p>}
      {status === 'approved' ? (
        <>
          <p className="guarantee-message" role="status">Acceso vigente hasta {new Date(access.request.expiresAt).toLocaleString('es-AR')}.</p>
          <ul className="property-guarantee-files">
            {(access.documents || []).map((document) => (
              <li key={document.id}>
                <span>{label(document.documentType)} · {document.originalName}</span>
                <button className="button button-accent" type="button" onClick={() => openDocument(document)}>Abrir documento</button>
              </li>
            ))}
          </ul>
        </>
      ) : status === 'pending' ? (
        <p className="guarantee-message" role="status">Solicitud enviada. Revisá esta propiedad más tarde para ver la respuesta.</p>
      ) : (
        <button className="button button-primary" type="button" onClick={requestAccess} disabled={loading || working}>
          {loading ? 'Consultando acceso…' : working ? 'Enviando solicitud…' : status === 'rejected' ? 'Volver a solicitar acceso' : 'Solicitar acceso'}
        </button>
      )}
    </section>
  )
}

function PropertyDetails({ propiedad, tieneSesion = false, esEstudiante, esFavorito, onToggleFavorite, esPropietario = false }) {
  const [imageError, setImageError] = useState(false)
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
          {esEstudiante && <Link to="/guia-asistida">Guía asistida</Link>}
        </nav>
        <Link className="button button-primary" to="/alquileres">Volver al listado</Link>
      </header>
      <main className="property-details-page">
        <Link className="back-link" to="/alquileres">← Volver a los alquileres</Link>
        {esPropietario && <Link className="button button-primary" to={`/alquileres/${propiedad.id}/gestion`}>Administrar publicación</Link>}
        <section className="property-details-hero">
          <div className="property-details-image">
            {propiedad.imagen && !imageError ? (
              <img
                src={propiedad.imagen}
                alt={`Foto de ${propiedad.titulo}`}
                loading="eager"
                decoding="async"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="property-details-image-placeholder">
                <span aria-hidden="true">⌂</span>
                Sin foto disponible
              </div>
            )}
            <span className={`detail-status${sinDisponibilidad ? ' detail-status-full' : ''}`} role="status">{textoDisponibilidad(propiedad.estado, propiedad.cuposDisponibles)}</span>
          </div>
          <div className="property-details-summary"><span className="section-kicker">DETALLE DEL ALQUILER</span><div className="badges"><span>{`Barrio ${propiedad.barrio}`}</span><span>{textoAmbientes}</span><span>{propiedad.amoblado ? 'Amoblado' : 'Sin amoblar'}</span></div><h1>{propiedad.titulo}</h1><p className="property-address">⌖ {propiedad.direccion}</p><p className="detail-price">${Number(propiedad.precio).toLocaleString('es-AR')} <small>/ mes</small></p><p className="property-description detail-description">{propiedad.descripcion}</p>{esEstudiante && <button className="button button-accent favorite-toggle" type="button" onClick={onToggleFavorite} aria-pressed={esFavorito}>{esFavorito ? '⭐ Quitar de favoritos' : '☆ Agregar a favoritos'}</button>}</div>
        </section>
        <section className="property-details-content">
          <div className="detail-info-panel"><span className="section-kicker">CARACTERÍSTICAS</span><h2>Todo lo que necesitás saber</h2><div className="detail-features"><span><strong>{textoAmbientes}</strong>Ambientes</span><span><strong>{propiedad.amoblado ? 'Sí' : 'No'}</strong>Amoblado</span><span><strong>{propiedad.tieneAire ? 'Sí' : 'No'}</strong>Aire acondicionado</span><span><strong>{propiedad.barrio}</strong>Zona</span><span><strong>{Number(propiedad.cuposDisponibles ?? 1)}</strong>Espacios libres</span></div></div>
          {esEstudiante ? (
            <OwnerProfileSummary propertyId={propiedad.id} />
          ) : (
            <aside className="contact-owner-panel">
              <span className="section-kicker">PUBLICADO POR</span>
              <h2>
                {tieneSesion
                  ? propiedad.propietario?.nombre || propiedad.dueno
                  : "Información reservada"}
              </h2>
              <p className="muted small-text">
                {tieneSesion
                  ? "Iniciá sesión como estudiante para ver el perfil resumido y sus valoraciones."
                  : "Registrate o iniciá sesión para ver los datos del propietario."}
              </p>
              <Link className="button button-accent" to="/login-and-registration">
                {tieneSesion ? "Iniciar sesión" : "Iniciar sesión o registrarme"}
              </Link>
              <Link className="safety-help-link" to="/consejos-seguridad">
                ¿Cómo sé si es seguro?
              </Link>
            </aside>
          )}
        </section>
        {esEstudiante && <GuaranteeAccessPanel propertyId={propiedad.id} />}
        <section className="map-section"><div className="map-heading"><div><span className="section-kicker">UBICACIÓN DE REFERENCIA</span><h2>Conocé la zona</h2><p className="muted small-text">Mapa orientativo de la ubicación publicada. La ubicación exacta se confirma al coordinar la visita.</p></div><span className="map-location">⌖ {ubicacion}</span></div><div className="map-frame"><iframe title={`Mapa de ${propiedad.titulo}`} src={mapaUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe></div></section>
      </main>
    </div>
  )
}

export default PropertyDetails
