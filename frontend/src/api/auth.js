import { apiRequest } from "./client.js";

export const registrarUsuario = (datos) =>
  apiRequest("/auth/register", { method: "POST", body: datos });

export const iniciarSesion = (datos) =>
  apiRequest("/auth/login", { method: "POST", body: datos });

export const obtenerPerfilPropio = () => apiRequest("/auth/me", { auth: true });
