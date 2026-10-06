import { Link } from 'react-router-dom'

function PropertyCard({ propiedad, usuario, favoritos, onToggleFavorite }) {
  const esFavorito = favoritos.includes(Number(propiedad.id))
  const puedeEditar = usuario && (usuario.email === propiedad.dueno || usuario.id === propiedad.propietario?.id)
  const textoAmbientes = propiedad.ambientes === 3 ? '3 ambientes' : propiedad.ambientes === 2 ? '2 ambientes' : 'Monoambiente'

  return (
    <article className="property-card">
      {usuario?.rol === 'estudiante' && <button className="favorite-button" onClick={() => onToggleFavorite(propiedad.id)} title={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'} aria-label={esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'}>{esFavorito ? '⭐' : '☆'}</button>}
      <Link className="property-image-link" to={`/alquileres/${propiedad.id}`}><img src={propiedad.imagen} alt={`Foto de ${propiedad.titulo}`} /></Link>
      <div className="property-body"><div className="badges"><span>{`Barrio ${propiedad.barrio}`}</span><span>{textoAmbientes}</span><span>{propiedad.tipoInmueble === 'Inmobiliaria' ? '🏢 Inmobiliaria' : '🙋‍♂️ Dueño directo'}</span></div><Link className="property-title-link" to={`/alquileres/${propiedad.id}`}><h3>{propiedad.titulo}</h3></Link><p className="property-description">{propiedad.descripcion}</p><p className="property-address">⌖ {propiedad.direccion}</p><p className="price">${Number(propiedad.precio).toLocaleString('es-AR')} <small>/ mes</small></p><div className="property-features"><span>{propiedad.amoblado ? '✓ Amoblado' : '✓ Sin amoblar'}</span><span>{propiedad.tieneAire ? '✓ Aire acondicionado' : '✓ Buena ventilación'}</span></div><Link className="detail-link" to={`/alquileres/${propiedad.id}`}>Ver información completa →</Link>{puedeEditar && <div className="owner-actions"><Link className="button button-small button-warning" to={`/alquileres/${propiedad.id}/editar`}>Modificar datos</Link><form action="/alquileres/borrar" method="POST"><input type="hidden" name="idAlquiler" value={propiedad.id} /><button className="button button-small button-danger" type="submit">Borrar</button></form></div>}</div>
      <footer>👤 Publicado por: <strong>{propiedad.propietario?.nombre || propiedad.dueno}</strong></footer>
    </article>
  )
}

export default PropertyCard