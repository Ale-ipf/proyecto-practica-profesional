import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./src/models/associations.js";
import { sequelize, testConnection } from "./src/config/database.js";
import { errorHandler, notFound } from "./src/middlewares/error.middleware.js";
import router from "./src/routes/index.routes.js";
import { seedInstitutions } from "./src/seeders/institution.seed.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando 🚀" });
});

// Rutas de la API (auth, students, properties, ...)
app.use("/api", router);

// Cualquier ruta no definida cae acá (siempre después de las rutas)
app.use(notFound);

// Manejo global de errores (siempre al final de todo)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const normalizeInstitutionBusStops = async () => {
  const [columns] = await sequelize.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('Institutions') AND COLUMN_NAME = 'busStops'",
  );

  if (columns.length === 0) return;

  const [rows] = await sequelize.query(
    "SELECT COUNT(*) AS invalidCount FROM `Institutions` WHERE `busStops` IS NULL OR JSON_VALID(`busStops`) = 0",
  );
  const invalidCount = Number(rows[0].invalidCount);

  if (invalidCount === 0) return;

  await sequelize.query(
    "UPDATE `Institutions` SET `busStops` = JSON_ARRAY() WHERE `busStops` IS NULL OR JSON_VALID(`busStops`) = 0",
  );

  console.warn(
    `⚠️ Se normalizaron ${invalidCount} valores inválidos de Institutions.busStops.`,
  );
};

const startServer = async () => {
  await testConnection();
  await normalizeInstitutionBusStops();
  await sequelize.sync({ alter: true });
  await seedInstitutions();
  console.log("✅ Modelos sincronizados con la base de datos.");

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer().catch(async (error) => {
  console.error("❌ No se pudo iniciar el servidor:", error);
  try {
    await sequelize.close();
  } catch (closeError) {
    console.error("❌ No se pudo cerrar la conexión a la base de datos:", closeError);
  }
  process.exitCode = 1;
});
