/**
 * Envuelve un controller async para no repetir try/catch en cada uno.
 * Si la función lanza un error (throw), se pasa automáticamente a next(err),
 * y termina resuelto por el middleware global de errores.
 *
 * Uso: export const getUsers = asyncHandler(async (req, res) => { ... });
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
