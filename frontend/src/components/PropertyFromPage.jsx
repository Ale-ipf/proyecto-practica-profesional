import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
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
  const { actualizarTelefonoWhatsApp } = useAuth()
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState(usuario.whatsappPhone || '')
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
      const telefonoActual = String(usuario.whatsappPhone || '').replace(/\D/g, '')
      const telefonoIngresado = telefonoWhatsApp.trim().replace(/\D/g, '')
      if (telefonoActual !== telefonoIngresado) {
        await actualizarTelefonoWhatsApp(telefonoWhatsApp.trim())
      }

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
    <div className="app-shell route-page-shell owner-form-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">Alquileres Formosa</Link>
        <Link className="button button-accent" to="/panel-dueno">← Volver al panel</Link>
      </header>
      <main className="route-page property-form-page owner-property-form-page">
        <span className="eyebrow">NUEVA PUBLICACIÓN · {usuario.name}</span>
        <h1>{propiedad ? "Modificar alquiler" : "Agregar alquiler"}</h1>
        <p className="route-description">
          {propiedad
            ? "Actualizá la información visible de tu publicación."
            : "Completá los datos para que estudiantes encuentren tu propiedad."}
        </p>

        <form className="property-form owner-property-form" onSubmit={submit}>
          <section className="owner-form-photo">
            <span className="section-kicker">IMAGEN PRINCIPAL</span>
            <h2>Foto del alquiler</h2>
            <p>Agregá un enlace a una foto para mostrar tu propiedad en el catálogo.</p>
            <label>
              URL de la foto
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={update}
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </label>
            {form.imageUrl ? (
              <img
                className="property-form-image-preview"
                src={form.imageUrl}
                alt="Vista previa de la imagen del alquiler"
              />
            ) : (
              <div className="owner-form-photo__empty">
                <span aria-hidden="true">↑</span>
                <strong>La foto aparecerá acá</strong>
                <small>Ingresá el enlace a una imagen pública.</small>
              </div>
            )}
          </section>

          <section className="owner-form-details">
            <span className="section-kicker">INFORMACIÓN DEL ALQUILER</span>
            <h2>Datos de la propiedad</h2>
            <div className="property-form-grid">
              <label>
                Título
                <input name="title" value={form.title} onChange={update} placeholder="Ej: Departamento luminoso" required />
              </label>
              <label>
                Precio mensual
                <input type="number" min="0" name="price" value={form.price} onChange={update} required />
              </label>
              <label>
                Dirección
                <input name="address" value={form.address} onChange={update} placeholder="Ej: Av. principal 123" required />
              </label>
              <label>
                Ciudad
                <input name="city" value={form.city} onChange={update} placeholder="Formosa" required />
              </label>
              <label>
                Ambientes
                <select name="bedrooms" value={form.bedrooms} onChange={update}>
                  <option value="1">Monoambiente</option>
                  <option value="2">2 ambientes</option>
                  <option value="3">3 ambientes</option>
                </select>
              </label>
              <label>
                Espacios disponibles
                <input type="number" min="0" step="1" name="available_spots" value={form.available_spots} onChange={update} required />
                <small>Ingresá 0 si ya no hay espacios libres.</small>
              </label>
              <label>
                Estado
                <select name="status" value={form.status} onChange={update}>
                  <option value="available">Disponible</option>
                  <option value="rented">Alquilado</option>
                </select>
              </label>
            </div>
            <label className="owner-form-description">
              Descripción
              <textarea
                name="description"
                value={form.description}
                onChange={update}
                placeholder="Contá qué hace especial a esta propiedad"
                rows="5"
                required
              />
            </label>
            <div className="property-form-options">
              <label className="checkbox-label">
                <input type="checkbox" name="is_furnished" checked={form.is_furnished} onChange={update} />
                Amoblado
              </label>
            </div>
          </section>

          <section className="owner-form-location">
            <span className="section-kicker">UBICACIÓN</span>
            <h2>Marcá la propiedad en el mapa</h2>
            <label>
              Ubicación en el mapa
              <span>Hacé clic sobre el mapa para señalar el alquiler.</span>
              <LocationPicker latitude={form.latitude} longitude={form.longitude} onSelect={selectLocation} />
            </label>
            <p className="selected-location" aria-live="polite">
              {form.latitude && form.longitude
                ? `Ubicación seleccionada: ${form.latitude}, ${form.longitude}`
                : "Todavía no seleccionaste una ubicación."}
            </p>
          </section>

          <section className="owner-form-whatsapp">
            <span className="section-kicker">CONTACTO</span>
            <h2>Tu número de WhatsApp</h2>
            <p>
              Los estudiantes podrán escribirte directamente desde la publicación. Este número también
              se guardará en tu perfil para tus próximos alquileres.
            </p>
            <label htmlFor="property-owner-whatsapp">
              Número con código de país
              <input
                id="property-owner-whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={22}
                value={telefonoWhatsApp}
                onChange={(event) => setTelefonoWhatsApp(event.target.value)}
                placeholder="+54 9 3704 123456"
                aria-describedby="property-owner-whatsapp-help"
              />
            </label>
            <small id="property-owner-whatsapp-help">
              Incluí el código de país y el prefijo, por ejemplo +54 9 para celulares argentinos.
            </small>
          </section>

          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="owner-form-actions">
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "Guardando…" : propiedad ? "Guardar cambios" : "Publicar alquiler"}
            </button>
            <Link className="button button-accent" to="/panel-dueno">Cancelar</Link>
          </div>
        </form>
      </main>
    </div>
  )
}

export default PropertyFormPage