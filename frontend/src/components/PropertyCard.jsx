import { useState } from 'react'
import { Link } from 'react-router-dom'

function PropertyCard({ propiedad, usuario, favoritos, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const esFavorito = favoritos.includes(Number(propiedad.id))
  const puedeEditar = usuario && (usuario.email === propiedad.dueno || usuario.id === propiedad.propietario?.id)
  const textoAmbientes = propiedad.ambientes === 3 ? '3 ambientes' : propiedad.ambientes === 2 ? '2 ambientes' : 'Monoambiente'

  const eliminar = async () => {
    if (!window.confirm(`¿Querés eliminar la publicación "${propiedad.titulo}"?`)) return

    setDeleting(true)
    setDeleteError('')
    try {
      await onDelete(propiedad.id)
    } catch (error) {
      setDeleteError(error.message || 'No pudimos eliminar la publicación.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className="property-card">
      {usuario?.role === 'student' && esFavorito && <span className="favorite-indicator" aria-label="Alquiler guardado en favoritos" title="Guardado en favoritos">⭐</span>}
      <Link className="property-image-link" to={`/alquileres/${propiedad.id}`}><img src={propiedad.imagen} alt={`Foto de ${propiedad.titulo}`} /></Link>
      <div className="property-body"><div className="badges"><span>{`Barrio ${propiedad.barrio}`}</span><span>{textoAmbientes}</span><span>{propiedad.tipoInmueble === 'Inmobiliaria' ? '🏢 Inmobiliaria' : '🙋‍♂️ Dueño directo'}</span></div><Link className="property-title-link" to={`/alquileres/${propiedad.id}`}><h3>{propiedad.titulo}</h3></Link><p className="property-description">{propiedad.descripcion}</p><p className="property-address">⌖ {propiedad.direccion}</p><p className="price">${Number(propiedad.precio).toLocaleString('es-AR')} <small>/ mes</small></p><div className="property-features"><span>{propiedad.amoblado ? '✓ Amoblado' : '✓ Sin amoblar'}</span><span>{propiedad.tieneAire ? '✓ Aire acondicionado' : '✓ Buena ventilación'}</span></div><Link className="detail-link" to={`/alquileres/${propiedad.id}`}>Ver información completa →</Link>{puedeEditar && <div className="owner-actions"><Link className="button button-small button-warning" to={`/alquileres/${propiedad.id}/editar`}>Modificar datos</Link><button className="button button-small button-danger" type="button" onClick={eliminar} disabled={deleting}>{deleting ? 'Eliminando…' : 'Borrar'}</button></div>}{deleteError && <p className="error-message" role="alert">{deleteError}</p>}</div>
      <footer>👤 Publicado por: <strong>{propiedad.propietario?.nombre || propiedad.dueno}</strong></footer>
    </article>
  )
}

export default PropertyCard