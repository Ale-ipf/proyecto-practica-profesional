import { apiRequest } from "./client.js";

export const listarInstituciones = () => apiRequest("/institutions");

export function normalizarInstituciones(institutions) {
  return (institutions || []).map((institution) => {
    let busStops = institution.busStops;

    if (typeof busStops === "string") {
      try {
        busStops = JSON.parse(busStops);
      } catch {
        busStops = [];
      }
    }

    return {
      ...institution,
      coordenadas: [Number(institution.latitude), Number(institution.longitude)],
      busStops: (Array.isArray(busStops) ? busStops : []).map((stop) => ({
        ...stop,
        coordenadas: [Number(stop.latitude), Number(stop.longitude)],
      })),
    };
  });
}
