/**
 * Error personalizado para manejar respuestas de error de forma consistente
 * en toda la API. Se lanza desde los controllers (throw new ApiError(...))
 * y lo captura el middleware global de errores (errorHandler).
 */
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
