import { hashPassword } from "../helpers/password.helper.js";
import { PropertyForumMessageModel } from "../models/property-forum-message.model.js";
import { PropertyModel } from "../models/property.model.js";
import { PropertyImageModel } from "../models/property-image.model.js";
import { PropertyTenantModel } from "../models/property-tenant.model.js";
import { StudentModel } from "../models/student.model.js";
import { UserModel } from "../models/user.model.js";

const DEMO_OWNER_EMAIL = "demo.propietario@alquileres.test";
const DEMO_STUDENT_EMAIL = "demo.estudiante@alquileres.test";

const demoProperties = [
  {
    title: "DEMO · Monoambiente céntrico amoblado",
    description: "Monoambiente luminoso, amoblado y con aire acondicionado. Ideal para una persona que estudia o trabaja en el centro.",
    price: 220000, address: "Barrio Centro, España 845", latitude: -26.1848, longitude: -58.1762,
    city: "Formosa", bedrooms: 0, available_spots: 1, is_furnished: true,
    allows_pets: false, has_wifi: true, has_cable: false, has_fan: false,
    has_air_conditioning: true, is_shared: false, owner_type: "direct", status: "available",
  },
  {
    title: "DEMO · Departamento con patio que acepta mascotas",
    description: "Departamento de un dormitorio con patio, ventilador de techo y conexión de cable. Se aceptan mascotas pequeñas.",
    price: 285000, address: "Barrio San Miguel, Masferrer 1260", latitude: -26.1772, longitude: -58.191,
    city: "Formosa", bedrooms: 1, available_spots: 1, is_furnished: false,
    allows_pets: true, has_wifi: false, has_cable: true, has_fan: true,
    has_air_conditioning: false, is_shared: false, owner_type: "direct", status: "available",
  },
  {
    title: "DEMO · Casa compartida cerca de la UNaF",
    description: "Habitación en casa compartida con Wi-Fi, ventilador y espacios comunes. Hay lugar para convivir con otras personas.",
    price: 175000, address: "Barrio UNaF, Av. Gutnisky 3200", latitude: -26.1922, longitude: -58.2003,
    city: "Formosa", bedrooms: 2, available_spots: 3, is_furnished: true,
    allows_pets: null, has_wifi: true, has_cable: true, has_fan: true,
    has_air_conditioning: false, is_shared: true, owner_type: "direct", status: "available",
  },
  {
    title: "DEMO · Departamento amplio con todos los servicios",
    description: "Departamento de dos dormitorios con aire acondicionado y ventilador. Incluye Wi-Fi y cable; modalidad privada.",
    price: 410000, address: "Barrio Centro, Sarmiento 540", latitude: -26.1863, longitude: -58.1768,
    city: "Formosa", bedrooms: 2, available_spots: 2, is_furnished: true,
    allows_pets: true, has_wifi: true, has_cable: true, has_fan: true,
    has_air_conditioning: true, is_shared: false, owner_type: "agency", status: "available",
  },
  {
    title: "DEMO · Casa de tres ambientes sin amoblar",
    description: "Casa fresca y ventilada, con patio y espacio para dos personas. No incluye muebles ni servicios de internet.",
    price: 350000, address: "Barrio San Miguel, Av. Italia 2180", latitude: -26.1715, longitude: -58.1842,
    city: "Formosa", bedrooms: 3, available_spots: 2, is_furnished: false,
    allows_pets: true, has_wifi: false, has_cable: false, has_fan: true,
    has_air_conditioning: false, is_shared: false, owner_type: "direct", status: "available",
  },
  {
    title: "DEMO · Habitación privada con aire acondicionado",
    description: "Habitación privada amoblada en vivienda compartida. Cuenta con Wi-Fi, aire acondicionado y acepta mascotas.",
    price: 195000, address: "Barrio Guadalupe, Padre Patiño 1880", latitude: -26.195, longitude: -58.1888,
    city: "Formosa", bedrooms: 1, available_spots: 2, is_furnished: true,
    allows_pets: true, has_wifi: true, has_cable: false, has_fan: false,
    has_air_conditioning: true, is_shared: true, owner_type: "agency", status: "available",
  },
  {
    title: "DEMO · Departamento económico en alquiler",
    description: "Departamento de dos ambientes, sin amoblar, con ventilador y servicios básicos. No se especifica si acepta mascotas.",
    price: 160000, address: "Barrio Centro, Rivadavia 1125", latitude: -26.1881, longitude: -58.1735,
    city: "Formosa", bedrooms: 1, available_spots: 1, is_furnished: false,
    allows_pets: null, has_wifi: null, has_cable: null, has_fan: true,
    has_air_conditioning: false, is_shared: false, owner_type: "direct", status: "available",
  },
  {
    title: "DEMO · Alquiler ya ocupado para revisar estados",
    description: "Publicación de prueba en estado alquilado para revisar cómo se muestra la disponibilidad en el panel del dueño.",
    price: 300000, address: "Barrio San Miguel, Brandsen 950", latitude: -26.1804, longitude: -58.194,
    city: "Formosa", bedrooms: 2, available_spots: 0, is_furnished: false,
    allows_pets: false, has_wifi: true, has_cable: false, has_fan: true,
    has_air_conditioning: false, is_shared: false, owner_type: "direct", status: "rented",
  },
];

const demoPropertyImageUrls = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
];

const CABALLERO_OWNER_EMAIL = "caballero@gmail.com";
const caballeroExistingPropertyImages = [
  {
    title: "Monoambiente amoblado en Centro",
    urls: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Departamento con patio en San Miguel",
    urls: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Casa compartida cerca de la UNaF",
    urls: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Alqui 1",
    urls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "Alqui 2",
    urls: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

const caballeroProperties = [
  {
    title: "DEMO Caballero - Monoambiente amoblado en Centro",
    description: "Monoambiente luminoso y amoblado, con Wi-Fi y aire acondicionado. Cerca de comercios y transporte.",
    price: 150000, address: "Barrio Centro, España 620", latitude: -26.1845, longitude: -58.1754,
    city: "Formosa", bedrooms: 0, available_spots: 1, is_furnished: true,
    allows_pets: false, has_wifi: true, has_cable: false, has_fan: true,
    has_air_conditioning: true, is_shared: false, owner_type: "direct", status: "available",
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "DEMO Caballero - Departamento con patio en San Miguel",
    description: "Departamento de un dormitorio con patio, ventilador y cable. Se aceptan mascotas pequeñas.",
    price: 200000, address: "Barrio San Miguel, Masferrer 980", latitude: -26.1781, longitude: -58.1902,
    city: "Formosa", bedrooms: 1, available_spots: 1, is_furnished: false,
    allows_pets: true, has_wifi: false, has_cable: true, has_fan: true,
    has_air_conditioning: false, is_shared: false, owner_type: "direct", status: "available",
    images: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    title: "DEMO Caballero - Casa compartida cerca de la UNaF",
    description: "Habitación en casa compartida con Wi-Fi, ventilador y espacios comunes. Ideal para estudiantes.",
    price: 100000, address: "Barrio UNaF, Av. Gutnisky 3050", latitude: -26.1918, longitude: -58.1996,
    city: "Formosa", bedrooms: 2, available_spots: 3, is_furnished: true,
    allows_pets: null, has_wifi: true, has_cable: false, has_fan: true,
    has_air_conditioning: false, is_shared: true, owner_type: "agency", status: "available",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

const demoMessages = [
  { category: "notice", content: "Foro de demostración: acá se pueden publicar avisos importantes para las personas asociadas a este alquiler." },
  { category: "announcement", content: "El horario de visitas de prueba es de lunes a viernes, de 10 a 17 h. Coordinemos por este foro." },
  { category: "general", content: "¿La conexión Wi-Fi está incluida en el precio publicado?" },
  { category: "issue", content: "Mensaje de ejemplo para probar el reporte de un inconveniente de mantenimiento." },
];

const aleForumMessages = [
  { authorRole: "owner", category: "announcement", content: "Hola Ale. Podemos usar este foro para coordinar consultas y compartir avisos relacionados con el alquiler." },
  { authorRole: "student", category: "general", content: "Hola. Queria consultar si el Wi-Fi esta incluido y como podemos coordinar una visita." },
  { authorRole: "owner", category: "general", content: "Hola Ale. Si, el Wi-Fi esta incluido. Avisame que dia y horario te resultan comodos para coordinar la visita." },
  { authorRole: "student", category: "general", content: "Gracias. Si me surge otra consulta, la dejo por aca." },
];

export const seedDemoRentalData = async () => {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO_RENTALS === "false") {
    return;
  }

  const password = await hashPassword(process.env.DEMO_SEED_PASSWORD || "DemoAlquiler2026!");
  const [owner] = await UserModel.findOrCreate({
    where: { email: DEMO_OWNER_EMAIL },
    defaults: {
      name: "Propietario 1",
      email: DEMO_OWNER_EMAIL,
      password,
      role: "owner",
      dni: "00000000",
      phone: "0000000000",
      emailVerified: true,
      phoneVerified: true,
    },
  });
  if (owner.name !== "Propietario 1" || owner.role !== "owner") {
    await owner.update({ name: "Propietario 1", role: "owner" });
  }
  const [student] = await UserModel.findOrCreate({
    where: { email: DEMO_STUDENT_EMAIL },
    defaults: {
      name: "Lucas",
      email: DEMO_STUDENT_EMAIL,
      password,
      role: "student",
      emailVerified: true,
      phoneVerified: true,
    },
  });
  if (student.name !== "Lucas" || student.role !== "student") {
    await student.update({ name: "Lucas", role: "student" });
  }
  await StudentModel.findOrCreate({ where: { userId: student.id }, defaults: { userId: student.id } });

  const caballero = await UserModel.findOne({
    where: { email: CABALLERO_OWNER_EMAIL, role: "owner" },
  });
  if (caballero) {
    for (const fixture of caballeroExistingPropertyImages) {
      const property = await PropertyModel.findOne({
        where: { title: fixture.title, userId: caballero.id },
      });
      if (!property) continue;
      for (const url of fixture.urls) {
        await PropertyImageModel.findOrCreate({
          where: { propertyId: property.id, url },
          defaults: { propertyId: property.id, url },
        });
      }
    }

    for (const fixture of caballeroProperties) {
      const { images = [], ...propertyData } = fixture;
      const [property] = await PropertyModel.findOrCreate({
        where: { title: fixture.title, userId: caballero.id },
        defaults: { ...propertyData, userId: caballero.id },
      });
      for (const url of images) {
        await PropertyImageModel.findOrCreate({
          where: { propertyId: property.id, url },
          defaults: { propertyId: property.id, url },
        });
      }
    }
  }

  const properties = [];
  for (const [index, fixture] of demoProperties.entries()) {
    const [property] = await PropertyModel.findOrCreate({
      where: { title: fixture.title, userId: owner.id },
      defaults: { ...fixture, userId: owner.id },
    });
    await PropertyImageModel.findOrCreate({
      where: { propertyId: property.id, url: demoPropertyImageUrls[index] },
      defaults: { propertyId: property.id, url: demoPropertyImageUrls[index] },
    });
    properties.push(property);
  }

  const forumProperty = properties.find((property) => property.title === "DEMO · Casa compartida cerca de la UNaF");
  await PropertyTenantModel.findOrCreate({
    where: { propertyId: forumProperty.id, userId: student.id },
    defaults: { propertyId: forumProperty.id, userId: student.id },
  });

  const ale = await UserModel.findOne({
    where: { email: "ale@gmail.com", role: "student" },
  });
  if (ale) {
    const aleMemberships = await PropertyTenantModel.findAll({
      where: { userId: ale.id },
      attributes: ["propertyId"],
    });
    for (const membership of aleMemberships) {
      const property = await PropertyModel.findByPk(membership.propertyId);
      const propertyOwner = property
        ? await UserModel.findByPk(property.userId)
        : null;
      if (!property || !propertyOwner) continue;
      for (const fixture of aleForumMessages) {
        const author = fixture.authorRole === "owner" ? propertyOwner : ale;
        await PropertyForumMessageModel.findOrCreate({
          where: {
            propertyId: property.id,
            userId: author.id,
            content: fixture.content,
          },
          defaults: {
            propertyId: property.id,
            userId: author.id,
            category: fixture.category,
            content: fixture.content,
          },
        });
      }
    }
  }

  const messageAuthors = [owner, student];
  for (const [index, fixture] of demoMessages.entries()) {
    const author = messageAuthors[index % messageAuthors.length];
    await PropertyForumMessageModel.findOrCreate({
      where: { propertyId: forumProperty.id, userId: author.id, content: fixture.content },
      defaults: { ...fixture, propertyId: forumProperty.id, userId: author.id },
    });
  }

  console.log(`✅ Datos demo listos: ${properties.length} publicaciones y ${demoMessages.length} mensajes de foro.`);
};
