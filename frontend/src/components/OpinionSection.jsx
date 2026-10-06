import { useMemo, useState } from 'react'

const opinionesBase = [
  { autor: 'María G.', fecha: 'Hace 2 semanas', texto: 'La ubicación es excelente y el espacio se ve muy luminoso. La información del anuncio fue clara.', puntuacion: 5 },
  { autor: 'Lucas R.', fecha: 'Hace 1 mes', texto: 'Buena opción para quienes buscan estar cerca de servicios y transporte.', puntuacion: 4 },
]

function OpinionsSection({ propiedad }) {
  const [opiniones, setOpiniones] = useState(opinionesBase)
  const [nuevaOpinion, setNuevaOpinion] = useState({ nombre: '', texto: '', puntuacion: 5 })

  const promedio = useMemo(() => (opiniones.reduce((total, opinion) => total + opinion.puntuacion, 0) / opiniones.length).toFixed(1), [opiniones])

  const actualizarOpinion = (event) => setNuevaOpinion({ ...nuevaOpinion, [event.target.name]: event.target.name === 'puntuacion' ? Number(event.target.value) : event.target.value })

  const publicarOpinion = (event) => {
    event.preventDefault()
    if (!nuevaOpinion.nombre.trim() || !nuevaOpinion.texto.trim()) return
    setOpiniones([{ ...nuevaOpinion, autor: nuevaOpinion.nombre.trim(), fecha: 'Recién publicada' }, ...opiniones])
    setNuevaOpinion({ nombre: '', texto: '', puntuacion: 5 })
  }

  return (
    <section className="opinions-section">
      <div className="opinions-header"><div><span className="section-kicker">EXPERIENCIAS REALES</span><h2>Opiniones sobre esta propiedad</h2><p className="muted small-text">Conocé la experiencia de otras personas interesadas en este alquiler.</p></div><div className="rating-summary"><strong>{promedio}</strong><span className="stars" aria-label={`${promedio} de 5 estrellas`}>★★★★★</span><small>{opiniones.length} opiniones</small></div></div>
      <div className="opinions-layout">
        <div className="opinions-list">{opiniones.map((opinion, index) => <article className="opinion-card" key={`${opinion.autor}-${index}`}><div className="opinion-card-header"><div className="avatar">{opinion.autor.charAt(0).toUpperCase()}</div><div><strong>{opinion.autor}</strong><span>{opinion.fecha}</span></div><span className="opinion-stars" aria-label={`${opinion.puntuacion} de 5 estrellas`}>{'★'.repeat(opinion.puntuacion)}{'☆'.repeat(5 - opinion.puntuacion)}</span></div><p>{opinion.texto}</p></article>)}</div>
        <form className="opinion-form" onSubmit={publicarOpinion}><span className="section-kicker">COMPARTÍ TU EXPERIENCIA</span><h3>Dejá una opinión</h3><label>Tu nombre<input name="nombre" value={nuevaOpinion.nombre} onChange={actualizarOpinion} placeholder="Ej: Ana P." required /></label><label>Tu opinión<textarea name="texto" value={nuevaOpinion.texto} onChange={actualizarOpinion} placeholder={`¿Qué te parece ${propiedad.titulo.toLowerCase()}?`} rows="4" required /></label><label>Puntuación<select name="puntuacion" value={nuevaOpinion.puntuacion} onChange={actualizarOpinion}><option value="5">★★★★★ Excelente</option><option value="4">★★★★ Muy buena</option><option value="3">★★★ Buena</option><option value="2">★★ Regular</option><option value="1">★ Puede mejorar</option></select></label><button className="button button-primary" type="submit">Publicar opinión</button></form>
      </div>
    </section>
  )
}

export default OpinionsSection