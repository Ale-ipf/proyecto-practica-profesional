import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LocationPicker from './LocationPicker'

const initialForm = {
  title: '',
  description: '',
  price: '',
  address: '',
  latitude: '',
  longitude: '',
  city: '',
  imageUrl: '',
  bedrooms: '1',
  available_spots: '1',
  is_furnished: false,
  status: 'available',
}

function PropertyFormPage({ usuario, propiedad, onSave }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(propiedad ? {
    title: propiedad.title || '',
    description: propiedad.description || '',
    price: String(propiedad.price ?? ''),
    address: propiedad.address || '',
    latitude: propiedad.latitude == null ? '' : String(propiedad.latitude),
    longitude: propiedad.longitude == null ? '' : String(propiedad.longitude),
    city: propiedad.city || '',
    imageUrl: propiedad.images?.[0]?.url || '',
    bedrooms: String(propiedad.bedrooms || 1),
    available_spots: String(propiedad.available_spots ?? 1),
    is_furnished: Boolean(propiedad.is_furnished),
    status: propiedad.status || 'available',
  } : initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (event) => {
    const { name, value, type, checked } = event.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const selectLocation = ([latitude, longitude]) => {
    setForm((current) => ({
      ...current,
      latitude: latitude.toFixed(7),
      longitude: longitude.toFixed(7),
    }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!form.latitude || !form.longitude) {
      setError('Seleccioná la ubicación del alquiler en el mapa.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        ...(propiedad ? { id: propiedad.id } : {}),
        title: form.title,
        description: form.description,
        price: Number(form.price),
        address: form.address,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        city: form.city,
        imageUrl: form.imageUrl.trim(),
        existingImageUrl: propiedad?.images?.[0]?.url || '',
        existingImageIds: propiedad?.images?.map((image) => image.id) || [],
        bedrooms: Number(form.bedrooms),
        available_spots: Number(form.available_spots),
        is_furnished: Boolean(form.is_furnished),
        status: form.status,
      })
      navigate('/panel-dueno')
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar la propiedad.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-shell route-page-shell"><header className="site-header"><Link className="brand-title" to="/">Alquileres Formosa</Link><Link className="button button-accent" to="/panel-dueno">Volver al panel</Link></header><main className="route-page property-form-page"><span className="eyebrow">PANEL DE PROPIETARIO · {usuario.name}</span><h1>{propiedad ? 'Modificar alquiler' : 'Agregar un nuevo alquiler'}</h1><p className="route-description">{propiedad ? 'Actualizá la información visible de tu publicación.' : 'Publicá una propiedad y empezá a recibir consultas.'}</p><form className="property-form" onSubmit={submit}><div className="property-form-grid"><label>Título<input name="title" value={form.title} onChange={update} placeholder="Ej: Departamento luminoso" required /></label><label>Precio mensual<input type="number" min="0" name="price" value={form.price} onChange={update} required /></label><label>Dirección<input name="address" value={form.address} onChange={update} placeholder="Ej: Av. principal 123" required /></label><label>Ciudad<input name="city" value={form.city} onChange={update} placeholder="Formosa" required /></label><label>Ambientes<select name="bedrooms" value={form.bedrooms} onChange={update}><option value="1">Monoambiente</option><option value="2">2 ambientes</option><option value="3">3 ambientes</option></select></label><label>Cupos disponibles<input type="number" min="0" step="1" name="available_spots" value={form.available_spots} onChange={update} required /><small>Ingresá 0 si ya no hay espacios libres.</small></label><label>Estado<select name="status" value={form.status} onChange={update}><option value="available">Disponible</option><option value="rented">Alquilado</option></select></label></div><label>Ubicación en el mapa<span>Hacé clic sobre el mapa para marcar el alquiler.</span><LocationPicker latitude={form.latitude} longitude={form.longitude} onSelect={selectLocation} /></label><p className="selected-location" aria-live="polite">{form.latitude && form.longitude ? `Ubicación seleccionada: ${form.latitude}, ${form.longitude}` : 'Todavía no seleccionaste una ubicación.'}</p><label>URL de la imagen<input type="url" name="imageUrl" value={form.imageUrl} onChange={update} placeholder="https://ejemplo.com/imagen.jpg" /></label>{form.imageUrl && <img className="property-form-image-preview" src={form.imageUrl} alt="Vista previa de la imagen del alquiler" />}<label>Descripción<textarea name="description" value={form.description} onChange={update} placeholder="Contá qué hace especial a esta propiedad" rows="5" required /></label><div className="property-form-options"><label className="checkbox-label"><input type="checkbox" name="is_furnished" checked={form.is_furnished} onChange={update} /> Amoblado</label></div>{error && <p className="error-message" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : propiedad ? 'Guardar cambios' : 'Publicar alquiler'}</button></form></main></div>
  )
}

export default PropertyFormPage