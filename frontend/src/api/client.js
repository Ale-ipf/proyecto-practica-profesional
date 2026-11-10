const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/+$/, "");

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
    this.name = "ApiRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const normalizarErroresCampo = (errores) => {
  if (Array.isArray(errores)) {
    return errores.map((error) => {
      if (!error || typeof error !== "object") {
        return { field: "general", message: String(error || "Dato inválido.") };
      }

      return {
        field: error.field || error.path || error.param || "general",
        message: error.message || error.msg || "Dato inválido.",
      };
    });
  }

  if (errores && typeof errores === "object") {
    return Object.entries(errores).flatMap(([field, messages]) =>
      (Array.isArray(messages) ? messages : [messages]).map((message) => ({
        field,
        message: String(message),
      })),
    );
  }

  return [];
};

const mensajeDeError = (data, status, statusText, responseText) => {
  const mensaje = data?.message || data?.error;
  if (typeof mensaje === "string" && mensaje.trim()) return mensaje.trim();
  if (Array.isArray(mensaje)) {
    return mensaje.map((item) => item?.message || item?.msg || String(item)).join("\n");
  }

  const texto = responseText?.trim();
  if (texto && !texto.startsWith("<")) return texto.slice(0, 500);
  return `El servidor respondió con el estado ${status}${statusText ? ` (${statusText})` : ""}.`;
};

/**
 * Wrapper de fetch: arma la URL completa, agrega el header de auth si hay
 * token guardado, y traduce las respuestas de error del backend
 * (middlewares/error.middleware.js y validate.middleware.js) a ApiRequestError.
 */
export const apiRequest = async (path, { method = "GET", body, auth = false } = {}) => {
  const url = `${API_URL}/${path.replace(/^\/+/, "")}`;
  const headers = {};

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let serializedBody;
  try {
    serializedBody = body !== undefined ? JSON.stringify(body) : undefined;
  } catch (error) {
    throw new ApiRequestError(
      `No se pudieron preparar los datos de la solicitud: ${error.message}`,
      0,
    );
  }

  let response;
  try {
    response = await fetch(url, { method, headers, body: serializedBody });
  } catch (error) {
    const detalle = error instanceof Error ? ` Detalle técnico: ${error.message}` : "";
    throw new ApiRequestError(
      `No se pudo conectar con la API en ${API_URL}. Verificá que el backend esté iniciado y que VITE_API_URL apunte a la dirección correcta. Si el backend está activo, revisá también la conexión o la configuración CORS.${detalle}`,
      0,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let responseText;
  try {
    responseText = await response.text();
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : "";
    throw new ApiRequestError(
      `La API respondió con el estado ${response.status}, pero no se pudo leer su respuesta.${detail}`,
      response.status,
    );
  }
  let data = null;

  if (responseText && contentType.includes("json")) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new ApiRequestError(
        `La API respondió con datos JSON inválidos (estado ${response.status}).`,
        response.status,
      );
    }
  } else if (response.ok && responseText) {
    throw new ApiRequestError(
      `La API devolvió un formato inesperado (estado ${response.status}). Revisá que VITE_API_URL apunte al backend.`,
      response.status,
    );
  }

  if (!response.ok) {
    const fieldErrors = normalizarErroresCampo(data?.errors);
    const message = mensajeDeError(data, response.status, response.statusText, responseText);
    const detalles = fieldErrors.map(({ field, message: errorMessage }) => `• ${field}: ${errorMessage}`);
    throw new ApiRequestError([message, ...detalles].join("\n"), response.status, fieldErrors);
  }

  return data;
};
