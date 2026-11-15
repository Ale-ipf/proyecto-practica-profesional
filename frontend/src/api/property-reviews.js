import { apiRequest } from "./client.js";

export const obtenerResumenDuenio = (propertyId) =>
  apiRequest(`/properties/${propertyId}/owner-profile`, { auth: true });

export const guardarValoracionPropiedad = (propertyId, datos) =>
  apiRequest(`/properties/${propertyId}/reviews/me`, {
    method: "PUT",
    body: datos,
    auth: true,
  });
