import { apiRequest } from "./client.js";

export const listarPersonasDelAlquiler = (propertyId, period) =>
  apiRequest(`/properties/${propertyId}/tenants?period=${encodeURIComponent(period)}`, {
    auth: true,
  });

export const agregarPersonaAlAlquiler = (propertyId, email) =>
  apiRequest(`/properties/${propertyId}/tenants`, {
    method: "POST",
    body: { email },
    auth: true,
  });

export const eliminarPersonaDelAlquiler = (propertyId, tenantId) =>
  apiRequest(`/properties/${propertyId}/tenants/${tenantId}`, {
    method: "DELETE",
    auth: true,
  });

export const actualizarPagoDelAlquiler = (propertyId, tenantId, period, paid) =>
  apiRequest(`/properties/${propertyId}/tenants/${tenantId}/payment`, {
    method: "PUT",
    body: { period, paid },
    auth: true,
  });
