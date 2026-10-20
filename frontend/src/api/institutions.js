import { apiRequest } from "./client.js";

export const listarInstituciones = () => apiRequest("/institutions");
