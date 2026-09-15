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
