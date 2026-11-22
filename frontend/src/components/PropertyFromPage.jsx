import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LocationPicker from './LocationPicker'
import DashboardLayout from './DashboardLayout.jsx'
import { OWNER_NAVIGATION } from './dashboardNavigation.js'
import { useAuth } from '../context/useAuth.js'

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
  allows_pets: '',
  has_wifi: null,
  has_cable: null,
  has_fan: null,
  has_air_conditioning: null,
  is_shared: '',
  owner_type: 'direct',
  status: 'available',
}

function PropertyFormPage({ usuario, propiedad, onSave }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
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
    allows_pets: propiedad.allows_pets == null ? '' : String(propiedad.allows_pets),
    has_wifi: propiedad.has_wifi ?? null,
    has_cable: propiedad.has_cable ?? null,
    has_fan: propiedad.has_fan ?? null,
    has_air_conditioning: propiedad.has_air_conditioning ?? null,
    is_shared: propiedad.is_shared == null ? '' : String(propiedad.is_shared),
    owner_type: propiedad.owner_type || 'direct',
    status: propiedad.status || 'available',
  } : initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(propiedad?.images?.[0]?.url || '')

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

  const selectImage = (event) => {
    const file = event.target.files?.[0] || null
    setImageFile(file)
    setError('')

    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageFile(null)
        setError('Seleccioná un archivo de imagen válido.')
        event.target.value = ''
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageFile(null)
        setError('La imagen no puede superar los 5 MB.')
        event.target.value = ''
        return
      }
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(propiedad?.images?.[0]?.url || '')
    }
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
        imageFile,
        existingImageUrl: propiedad?.images?.[0]?.url || '',
        existingImageIds: propiedad?.images?.map((image) => image.id) || [],
        bedrooms: Number(form.bedrooms),
        available_spots: Number(form.available_spots),
        is_furnished: Boolean(form.is_furnished),
        allows_pets: form.allows_pets === '' ? null : form.allows_pets === 'true',
        has_wifi: form.has_wifi,
        has_cable: form.has_cable,
        has_fan: form.has_fan,
        has_air_conditioning: form.has_air_conditioning,
        is_shared: form.is_shared === '' ? null : form.is_shared === 'true',
        owner_type: form.owner_type,
        status: form.status,
      })
      navigate(location.state?.returnTo || '/panel-dueno')
    } catch (requestError) {
      setError(requestError.message || 'No pudimos guardar la propiedad.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout
      user={usuario}
      roleLabel="Cuenta de propietario"
      navigation={OWNER_NAVIGATION}
      activeKey="publish"
      onLogout={logout}
    >
      <main className="route-page property-form-page">
        <span className="eyebrow">PANEL DE PROPIETARIO · {usuario.name}</span>
        <h1>{propiedad ? 'Modificar alquiler' : 'Agregar un nuevo alquiler'}</h1>
        <p className="route-description">
          {propiedad
            ? 'Actualizá la información visible de tu publicación.'
            : 'Publicá una propiedad y empezá a recibir consultas.'}
        </p>
        <form className="property-form" onSubmit={submit}>
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
              Cupos disponibles
              <input type="number" min="0" step="1" name="available_spots" value={form.available_spots} onChange={update} required />
              <small>Ingresá 0 si ya no hay espacios libres.</small>
            </label>
            <label>
              Tipo de anunciante
              <select name="owner_type" value={form.owner_type} onChange={update}>
                <option value="direct">Dueño directo</option>
                <option value="agency">Inmobiliaria</option>
              </select>
            </label>
            <label>
              ¿Acepta mascotas?
              <select name="allows_pets" value={form.allows_pets} onChange={update}>
                <option value="">Sin especificar</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </label>
            <label>
              Modalidad del alquiler
              <select name="is_shared" value={form.is_shared} onChange={update}>
                <option value="">Sin especificar</option>
                <option value="false">Solo</option>
                <option value="true">Compartido</option>
              </select>
            </label>
            <label>
              Estado
              <select name="status" value={form.status} onChange={update}>
                <option value="available">Disponible</option>
                <option value="rented">Alquilado</option>
              </select>
            </label>
          </div>
          <label>
            Ubicación en el mapa
            <span>Hacé clic sobre el mapa para marcar el alquiler.</span>
            <LocationPicker latitude={form.latitude} longitude={form.longitude} onSelect={selectLocation} />
          </label>
          <p className="selected-location" aria-live="polite">
            {form.latitude && form.longitude
              ? `Ubicación seleccionada: ${form.latitude}, ${form.longitude}`
              : 'Todavía no seleccionaste una ubicación.'}
          </p>
          <label>
            Imagen del alquiler
            <input
              type="file"
              name="imageFile"
              accept="image/jpeg,image/png,image/webp"
              onChange={selectImage}
            />
            <small>Seleccioná una imagen desde tu dispositivo. Máximo 5 MB.</small>
          </label>
          {imagePreview && (
            <img className="property-form-image-preview" src={imagePreview} alt="Vista previa de la imagen del alquiler" />
          )}
          <label>
            Descripción
            <textarea name="description" value={form.description} onChange={update} placeholder="Contá qué hace especial a esta propiedad" rows="5" required />
          </label>
          <div className="property-form-options">
            <label className="checkbox-label">
              <input type="checkbox" name="is_furnished" checked={form.is_furnished} onChange={update} />
              Amoblado
            </label>
            {[
              ['has_wifi', 'Wi-Fi'],
              ['has_cable', 'Cable'],
              ['has_fan', 'Ventilador'],
              ['has_air_conditioning', 'Aire acondicionado'],
            ].map(([name, label]) => (
              <label className="checkbox-label" key={name}>
                <input
                  type="checkbox"
                  name={name}
                  checked={form[name] === true}
                  onChange={update}
                />
                {label}
              </label>
            ))}
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : propiedad ? 'Guardar cambios' : 'Publicar alquiler'}
          </button>
        </form>
      </main>
    </DashboardLayout>
  )
}

export default PropertyFormPage