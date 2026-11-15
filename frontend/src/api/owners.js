import { apiRequest } from "./client.js";

export const obtenerMiPerfilDuenio = () =>
  apiRequest("/owners/me/profile", { auth: true });

export const actualizarMiPerfilDuenio = (datos) =>
  apiRequest("/owners/me/profile", {
    method: "PUT",
    body: datos,
    auth: true,
  });

export const solicitarVerificacionEmailDuenio = (email) =>
  apiRequest("/owners/me/email-verification", {
    method: "POST",
    body: { email },
    auth: true,
  });

export const confirmarVerificacionEmailDuenio = (code) =>
  apiRequest("/owners/me/email-verification/confirm", {
    method: "POST",
    body: { code },
    auth: true,
  });

export const solicitarVerificacionTelefonoDuenio = (phone) =>
  apiRequest("/owners/me/phone-verification", {
    method: "POST",
    body: { phone },
    auth: true,
  });

export const confirmarVerificacionTelefonoDuenio = (code) =>
  apiRequest("/owners/me/phone-verification/confirm", {
    method: "POST",
    body: { code },
    auth: true,
  });
