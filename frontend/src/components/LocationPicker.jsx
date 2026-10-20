import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const formosaCenter = [-26.1849, -58.1731]

function LocationClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng])
    },
  })

  return null
}

function LocationPicker({ latitude, longitude, onSelect }) {
  const selectedLocation = latitude !== '' && longitude !== ''
    ? [Number(latitude), Number(longitude)]
    : null

  return (
    <div className="location-picker">
      <MapContainer
        center={selectedLocation || formosaCenter}
        zoom={selectedLocation ? 16 : 13}
        scrollWheelZoom
        className="location-picker-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationClickHandler onSelect={onSelect} />
        {selectedLocation && (
          <CircleMarker
            center={selectedLocation}
            pathOptions={{ color: '#255e55', fillColor: '#255e55', fillOpacity: 0.9 }}
            radius={9}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default LocationPicker
