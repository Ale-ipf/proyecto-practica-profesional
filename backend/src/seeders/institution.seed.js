import { InstitutionModel } from "../models/institution.model.js";

const initialInstitutions = [
  {
    id: "unaf",
    abbreviation: "UNaF",
    name: "Universidad Nacional de Formosa",
    type: "Universidad",
    description: "Institución universitaria de referencia en Formosa Capital.",
    verified: true,
    source:
      "Fuente institucional oficial de la universidad y registros públicos disponibles.",
    latitude: -26.1922042,
    longitude: -58.2002557,
  },
  {
    id: "ucasalf",
    abbreviation: "UCASAL",
    name: "Universidad Católica de Salta",
    type: "Universidad",
    description: "Sede universitaria de la UCASAL en Formosa.",
    verified: true,
    source:
      "Fuente institucional oficial de la universidad y datos de sede reconocidos.",
    latitude: -26.1838,
    longitude: -58.1742,
  },
  {
    id: "ucp-formosa",
    abbreviation: "UCP",
    name: "Universidad de la Cuenca del Plata - Sede Formosa",
    type: "Universidad",
    description: "Sede universitaria en Formosa con ubicación en Maipú 4625.",
    verified: true,
    source:
      "Fuente institucional oficial de la universidad y datos de sede verificados.",
    latitude: -26.1934981,
    longitude: -58.2156561,
  },
  {
    id: "siglo21-formosa",
    abbreviation: "Siglo 21",
    name: "Universidad Siglo 21 Formosa",
    type: "Universidad",
    description: "Sede local de Universidad Siglo 21 en San Martín 1202.",
    latitude: -26.1862471,
    longitude: -58.1621505,
  },
  {
    id: "instituto-santa-rita",
    abbreviation: "Santa Rita",
    name: "Instituto Superior Santa Rita",
    type: "Instituto",
    description: "Instituto ubicado en Hipólito Yrigoyen 478, Formosa.",
    latitude: -26.1870276,
    longitude: -58.16814,
  },
  {
    id: "kennedy-formosa",
    abbreviation: "Kennedy",
    name: "Universidad Kennedy Formosa",
    type: "Universidad",
    description:
      "Punto local de atención de Universidad Kennedy en España 220; modalidad a distancia.",
    latitude: -26.1817273,
    longitude: -58.1669939,
  },
  {
    id: "iac-formosa",
    abbreviation: "IAC",
    name: "IAC",
    type: "Instituto de Tecnología",
    description: "Instituto de tecnología ubicado en 9 de Julio 218, Formosa.",
    latitude: -26.1791861,
    longitude: -58.1764652,
  },
  {
    id: "ipf",
    abbreviation: "IPF",
    name: "Instituto Politécnico Formosa",
    type: "Instituto",
    description:
      "Instituto técnico y de formación profesional ubicado en la zona sur de Formosa, con acceso desde distintas paradas de colectivo.",
    verified: true,
    source:
      "Fuente institucional oficial del instituto y datos de ubicación del establecimiento.",
    latitude: -26.0798894,
    longitude: -58.2771714,
    busStops: [
      {
        name: "HOMU",
        address: "Av. Gendarmería Nacional 860",
        latitude: -26.177272,
        longitude: -58.2083594,
      },
      {
        name: "IPV",
        address: "Av. Gendarmería Nacional",
        latitude: -26.1856,
        longitude: -58.2156,
      },
      {
        name: "SHELL",
        address: "Av. Gendarmería Nacional",
        latitude: -26.188431,
        longitude: -58.21474,
      },
      {
        name: "Madero Cruz",
        address: "Colectora / Av. Circunvalación",
        latitude: -26.195772,
        longitude: -58.213181,
      },
      {
        name: "Plaza San Martín",
        address: "José María Uriburu 898",
        latitude: -26.186219,
        longitude: -58.173542,
      },
      {
        name: "Plaza temática",
        address: "Av. Juan Domingo Perón 264",
        latitude: -26.174093,
        longitude: -58.178967,
      },
      {
        name: "Circuito 5",
        address: "RN11 y Av. Circunvalación",
        latitude: -26.14124,
        longitude: -58.193159,
      },
      {
        name: "Nanqom",
        address: "RN11",
        latitude: -26.11795,
        longitude: -58.224032,
      },
    ],
  },
  {
    id: "isfd-formosa",
    abbreviation: "ISFD",
    name: "Instituto Superior de Formación Docente",
    type: "Instituto",
    description:
      "Institución de formación docente ubicada en el centro de Formosa.",
    verified: true,
    source:
      "Fuente institucional oficial del establecimiento y datos de la sede.",
    latitude: -26.189,
    longitude: -58.1796,
    busStops: [],
  },
];

const normalizeBusStops = (busStops) => {
  if (Array.isArray(busStops)) return busStops;

  if (typeof busStops === "string") {
    try {
      const parsed = JSON.parse(busStops);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

export const seedInstitutions = async () => {
  await InstitutionModel.destroy({ where: { id: ["uplab", "isf"] } });

  for (const institution of initialInstitutions) {
    const [savedInstitution, created] = await InstitutionModel.findOrCreate({
      where: { id: institution.id },
      defaults: institution,
    });

    const savedBusStops = normalizeBusStops(savedInstitution.busStops);
    const shouldUpdateCoordinates =
      Number(savedInstitution.latitude) !== institution.latitude ||
      Number(savedInstitution.longitude) !== institution.longitude;
    const shouldUpdateBusStops =
      JSON.stringify(savedBusStops) !==
      JSON.stringify(institution.busStops || []);

    if (!created && (shouldUpdateCoordinates || shouldUpdateBusStops)) {
      await savedInstitution.update({
        latitude: institution.latitude,
        longitude: institution.longitude,
        busStops: institution.busStops || [],
      });
    }
  }
};
