import { apiRequest } from "./client.js";

export const listarMensajesDelForo = (propertyId) =>
  apiRequest(`/properties/${propertyId}/forum`, { auth: true });

export const publicarMensajeEnForo = (propertyId, datos) =>
  apiRequest(`/properties/${propertyId}/forum`, {
    method: "POST",
    body: datos,
    auth: true,
  });
