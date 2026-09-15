const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TOKEN_KEY = "alquileres_formosa_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Error normalizado para poder mostrar el mensaje del backend
 * (incluye los detalles de express-validator cuando existen).
 */
export class ApiRequestError extends Error {
  constructor(message, status, fieldErrors = []) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Wrapper de fetch: arma la URL completa, agrega el header de auth si hay
 * token guardado, y traduce las respuestas de error del backend
 * (middlewares/error.middleware.js y validate.middleware.js) a ApiRequestError.
 */
export const apiRequest = async (path, { method = "GET", body, auth = false } = {}) => {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || "Ocurrió un error inesperado. Probá de nuevo.";
    const fieldErrors = data?.errors || [];
    throw new ApiRequestError(message, response.status, fieldErrors);
  }

  return data;
};
