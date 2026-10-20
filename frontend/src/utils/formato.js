export const formatearPrecio = (precio) =>
  Number(precio).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

export const textoAmbientes = (bedrooms) => {
  const cantidad = Number(bedrooms) || 1;
  if (cantidad === 1) return "Monoambiente";
  return `${cantidad} dormitorios`;
};

export const textoEstado = (status) =>
  status === "rented" ? "Alquilado" : "Disponible";

export const textoDisponibilidad = (status, availableSpots) => {
  if (status === "rented") return "Alquilado";

  const cantidad = Number(availableSpots);
  if (Number.isFinite(cantidad) && cantidad <= 0) return "Completo";

  const cupos = Number.isFinite(cantidad) ? cantidad : 1;
  return `${cupos} ${cupos === 1 ? "espacio libre" : "espacios libres"}`;
};
