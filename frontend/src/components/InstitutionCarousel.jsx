import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { imagenHero } from '../data/appData'

function distanceInKm(first, second) {
  const [lat1, lon1] = first
  const [lat2, lon2] = second
  const earthRadius = 6371
  const latDistance = ((lat2 - lat1) * Math.PI) / 180
  const lonDistance = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(latDistance / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(lonDistance / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function InstitutionCarousel({ instituciones, propiedades }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const institucion = instituciones[selectedIndex - 1]
  const nearbyProperties = useMemo(() => institucion ? propiedades.filter((propiedad) => propiedad.estado === 'available' && propiedad.coordenadas).map((propiedad) => ({ ...propiedad, distancia: distanceInKm(institucion.coordenadas, propiedad.coordenadas) })).sort((first, second) => first.distancia - second.distancia).slice(0, 3) : [], [institucion, propiedades])
  const totalSlides = instituciones.length + 1
  const changeSlide = (direction) => setSelectedIndex((current) => (current + direction + totalSlides) % totalSlides)

  return (
    <section className="institution-carousel"><div className="carousel-copy"><span className="section-kicker">{selectedIndex === 0 ? 'ALQUILERES EN FORMOSA' : 'ALQUILERES CERCA DE INSTITUCIONES'}</span><h2>{selectedIndex === 0 ? 'Encontrá un lugar que se sienta como tuyo.' : 'Elegí dónde estudiar, nosotros te acercamos tu próximo hogar.'}</h2><p>{selectedIndex === 0 ? 'Explorá propiedades verificadas, compará precios y elegí tu próximo hogar de forma simple.' : 'Seleccioná una institución educativa y descubrí los alquileres disponibles más cercanos.'}</p>{selectedIndex === 0 && <div className="hero-stats"><span><strong>+120</strong> propiedades</span><span><strong>4</strong> barrios</span><span><strong>100%</strong> local</span></div>}<div className="carousel-controls"><button type="button" onClick={() => changeSlide(-1)} aria-label="Elemento anterior">←</button><div className="carousel-dots">{Array.from({ length: totalSlides }, (_, index) => <button key={index} className={index === selectedIndex ? 'active' : ''} type="button" onClick={() => setSelectedIndex(index)} aria-label={`Ver elemento ${index + 1}`} />)}</div><button type="button" onClick={() => changeSlide(1)} aria-label="Siguiente elemento">→</button></div></div>{selectedIndex === 0 ? <div className="hero-image-wrap"><img src={imagenHero} alt="Monoambiente luminoso disponible para alquilar" /><span className="image-label">Espacios listos para habitar</span></div> : <div className="institution-slide"><div className="institution-badge">{institucion.abreviatura}</div><div><span className="institution-type">{institucion.tipo}</span><h3>{institucion.nombre}</h3><p>{institucion.descripcion}</p></div><div className="nearby-properties"><span className="nearby-label">Más cercanos</span>{nearbyProperties.map((propiedad) => <Link className="nearby-property" key={propiedad.id} to={`/alquileres/${propiedad.id}`}><span>{propiedad.titulo}</span><strong>{propiedad.distancia.toFixed(1)} km</strong></Link>)}</div><Link className="button button-accent" to={`/mapa?institucion=${institucion.id}`}>Ver en el mapa</Link></div>}</section>
  )
}

export default InstitutionCarousel