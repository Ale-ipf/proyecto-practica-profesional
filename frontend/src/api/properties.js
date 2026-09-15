import { apiRequest } from "./client.js";

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
  apiRequest(`/properties${construirQuery(filtros)}`);

export const obtenerPropiedad = (id) => apiRequest(`/properties/${id}`);

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

export const eliminarImagen = (propertyId, imageId) =>
  apiRequest(`/properties/${propertyId}/images/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
