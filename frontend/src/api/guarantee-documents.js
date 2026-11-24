import { apiRequest, getToken } from "./client.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const listarDocumentosGarantia = (propertyId) =>
  apiRequest(`/properties/${propertyId}/guarantee-documents`, { auth: true });

export const listarSolicitudesAccesoGarantia = (propertyId) =>
  apiRequest(`/properties/${propertyId}/guarantee-access-requests`, { auth: true });

export const decidirSolicitudAccesoGarantia = (propertyId, requestId, status) =>
  apiRequest(`/properties/${propertyId}/guarantee-access-requests/${requestId}`, {
    method: "PATCH", body: { status }, auth: true,
  });

export const obtenerAccesoGarantia = (propertyId) =>
  apiRequest(`/properties/${propertyId}/guarantee-access`, { auth: true });

export const solicitarAccesoGarantia = (propertyId) =>
  apiRequest(`/properties/${propertyId}/guarantee-access`, { method: "POST", auth: true });

export const subirDocumentoGarantia = async (propertyId, documentType, file) => {
  const form = new FormData();
  form.append("documentType", documentType);
  form.append("authorizationConfirmed", "true");
  form.append("document", file);
  const token = getToken();
  const response = await fetch(`${API_URL}/properties/${propertyId}/guarantee-documents`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || "No pudimos guardar el documento.");
  return result;
};

export const obtenerDescargaDocumentoGarantia = (propertyId, documentId) =>
  apiRequest(`/properties/${propertyId}/guarantee-documents/${documentId}/download`, { auth: true });

export const eliminarDocumentoGarantia = (propertyId, documentId) =>
  apiRequest(`/properties/${propertyId}/guarantee-documents/${documentId}`, {
    method: "DELETE",
    auth: true,
  });
