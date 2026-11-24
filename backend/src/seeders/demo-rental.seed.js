import { hashPassword } from "../helpers/password.helper.js";
import { PropertyForumMessageModel } from "../models/property-forum-message.model.js";
import { PropertyModel } from "../models/property.model.js";
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

const demoMessages = [
  { category: "notice", content: "Foro de demostración: acá se pueden publicar avisos importantes para las personas asociadas a este alquiler." },
  { category: "announcement", content: "El horario de visitas de prueba es de lunes a viernes, de 10 a 17 h. Coordinemos por este foro." },
  { category: "general", content: "¿La conexión Wi-Fi está incluida en el precio publicado?" },
  { category: "issue", content: "Mensaje de ejemplo para probar el reporte de un inconveniente de mantenimiento." },
];

export const seedDemoRentalData = async () => {
  if (process.env.NODE_ENV === "production" || process.env.SEED_DEMO_RENTALS === "false") {
    return;
  }

  const password = await hashPassword(process.env.DEMO_SEED_PASSWORD || "DemoAlquiler2026!");
  const [owner] = await UserModel.findOrCreate({
    where: { email: DEMO_OWNER_EMAIL },
    defaults: {
      name: "Propietario de demostración",
      email: DEMO_OWNER_EMAIL,
      password,
      role: "owner",
      dni: "00000000",
      phone: "0000000000",
      emailVerified: true,
      phoneVerified: true,
    },
  });
  const [student] = await UserModel.findOrCreate({
    where: { email: DEMO_STUDENT_EMAIL },
    defaults: {
      name: "Estudiante de demostración",
      email: DEMO_STUDENT_EMAIL,
      password,
      role: "student",
      emailVerified: true,
      phoneVerified: true,
    },
  });
  await StudentModel.findOrCreate({ where: { userId: student.id }, defaults: { userId: student.id } });

  const properties = [];
  for (const fixture of demoProperties) {
    const [property] = await PropertyModel.findOrCreate({
      where: { title: fixture.title, userId: owner.id },
      defaults: { ...fixture, userId: owner.id },
    });
    properties.push(property);
  }

  const forumProperty = properties.find((property) => property.title === "DEMO · Casa compartida cerca de la UNaF");
  await PropertyTenantModel.findOrCreate({
    where: { propertyId: forumProperty.id, userId: student.id },
    defaults: { propertyId: forumProperty.id, userId: student.id },
  });

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
