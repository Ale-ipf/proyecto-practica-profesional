import { apiRequest } from "./client.js";

export const obtenerMiPerfilEstudiante = () =>
  apiRequest("/students/me", { auth: true });

export const actualizarMiPerfilEstudiante = (datos) =>
  apiRequest("/students/me", { method: "PUT", body: datos, auth: true });
