import { apiRequest } from "./client.js";

export const obtenerMiPerfilEstudiante = () =>
  apiRequest("/students/me", { auth: true });

export const actualizarMiPerfilEstudiante = (datos) =>
  apiRequest("/students/me", { method: "PUT", body: datos, auth: true });

export const solicitarVerificacionEmail = (email) =>
  apiRequest("/students/me/email-verification", {
    method: "POST",
    body: { email },
    auth: true,
  });

export const confirmarVerificacionEmail = (code) =>
  apiRequest("/students/me/email-verification/confirm", {
    method: "POST",
    body: { code },
    auth: true,
  });

export const solicitarVerificacionTelefono = (phone) =>
  apiRequest("/students/me/phone-verification", {
    method: "POST",
    body: { phone },
    auth: true,
  });

export const confirmarVerificacionTelefono = (code) =>
  apiRequest("/students/me/phone-verification/confirm", {
    method: "POST",
    body: { code },
    auth: true,
  });
