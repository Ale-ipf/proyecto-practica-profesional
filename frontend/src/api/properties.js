import { apiRequest, getToken } from "./client.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Arma el query string a partir de un objeto, ignorando valores vacíos.
const construirQuery = (filtros = {}) => {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      params.set(clave, valor);
    }
  });
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const listarPropiedades = (filtros = {}) =>
  apiRequest(`/properties${construirQuery(filtros)}`, { auth: true });

export const obtenerPropiedad = (id) =>
  apiRequest(`/properties/${id}`, { auth: true });

export const listarMisPropiedades = () =>
  apiRequest("/properties/mine/list", { auth: true });

export const crearPropiedad = (datos) =>
  apiRequest("/properties", { method: "POST", body: datos, auth: true });

export const actualizarPropiedad = (id, datos) =>
  apiRequest(`/properties/${id}`, { method: "PUT", body: datos, auth: true });

export const eliminarPropiedad = (id) =>
  apiRequest(`/properties/${id}`, { method: "DELETE", auth: true });

export const agregarImagenes = (propertyId, urls) =>
  apiRequest(`/properties/${propertyId}/images`, {
    method: "POST",
    body: { urls },
    auth: true,
  });

export const subirImagenesPropiedad = async (propertyId, files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append("images", file));

  const token = getToken();
  const response = await fetch(`${API_URL}/properties/${propertyId}/images/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || "No pudimos subir la imagen.");
  }
  return data;
};

export const eliminarImagen = (propertyId, imageId) =>
  apiRequest(`/properties/${propertyId}/images/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
