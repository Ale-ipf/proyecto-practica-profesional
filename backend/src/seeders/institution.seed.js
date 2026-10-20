import { InstitutionModel } from "../models/institution.model.js";

const initialInstitutions = [
  {
    id: "unaf",
    abbreviation: "UNaF",
    name: "Universidad Nacional de Formosa",
    type: "Universidad",
    description: "Una opción para estudiar en Formosa Capital.",
    latitude: -26.1856,
    longitude: -58.1753,
  },
  {
    id: "ucasalf",
    abbreviation: "UCASAL",
    name: "Universidad Católica de Salta",
    type: "Universidad",
    description: "Conocé alquileres cerca de la sede Formosa.",
    latitude: -26.1838,
    longitude: -58.1742,
  },
  {
    id: "ucp-formosa",
    abbreviation: "UCP",
    name: "Universidad de la Cuenca del Plata - Sede Formosa",
    type: "Universidad",
    description: "Sede Formosa, ubicada en Maipú 4625.",
    latitude: -26.1934981,
    longitude: -58.2156561,
  },
  {
    id: "uplab",
    abbreviation: "UPLaB",
    name: "Universidad Provincial de Laguna Blanca",
    type: "Universidad",
    description: "Sede universitaria en Laguna Blanca, Formosa.",
    latitude: -25.1219864,
    longitude: -58.253522,
  },
  {
    id: "isf",
    abbreviation: "ISF",
    name: "Institutos superiores de Formosa",
    type: "Instituto",
    description: "Explorá opciones educativas en la ciudad.",
    latitude: -26.1796,
    longitude: -58.1764,
  },
];

export const seedInstitutions = async () => {
  for (const institution of initialInstitutions) {
    await InstitutionModel.findOrCreate({
      where: { id: institution.id },
      defaults: institution,
    });
  }
};
