import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./src/models/associations.js";
import { PropertyModel } from "./src/models/property.model.js";
import { RentPaymentModel } from "./src/models/rent-payment.model.js";
import { sequelize, testConnection } from "./src/config/database.js";
import { errorHandler, notFound } from "./src/middlewares/error.middleware.js";
import router from "./src/routes/index.routes.js";
import { seedInstitutions } from "./src/seeders/institution.seed.js";
import { seedDemoRentalData } from "./src/seeders/demo-rental.seed.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

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

const ensurePropertyOptionalColumns = async () => {
  const [tables] = await sequelize.query(
    "SELECT TABLE_NAME AS tableName FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('Properties') LIMIT 1",
  );
  if (tables.length === 0) return;

  const tableName = tables[0].tableName;
  const [columns] = await sequelize.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER('Properties')",
  );
  const existingColumns = new Set(columns.map(({ COLUMN_NAME }) => COLUMN_NAME.toLowerCase()));
  const queryInterface = sequelize.getQueryInterface();

  for (const [attributeName, attribute] of Object.entries(PropertyModel.rawAttributes)) {
    const columnName = attribute.field || attributeName;
    if (["id", "userId", "createdAt", "updatedAt"].includes(attributeName)) continue;
    if (existingColumns.has(columnName.toLowerCase())) continue;
    // Para campos obligatorios sin valor predeterminado no se puede inventar
    // un dato válido para registros existentes; esos requieren una migración propia.
    if (!attribute.allowNull && attribute.defaultValue === undefined) continue;
    const definition = { type: attribute.type, allowNull: attribute.allowNull };
    if (attribute.defaultValue !== undefined) definition.defaultValue = attribute.defaultValue;
    await queryInterface.addColumn(tableName, columnName, definition);
    console.log(`✅ Se agregó la columna Properties.${columnName}.`);
  }
};

const ensureRentPaymentMethodColumn = async () => {
  const expectedTableName = RentPaymentModel.getTableName();
  const [tables] = await sequelize.query(
    "SELECT TABLE_NAME AS tableName FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER(:tableName) LIMIT 1",
    { replacements: { tableName: expectedTableName } },
  );
  if (tables.length === 0) return;

  const tableName = tables[0].tableName;
  const [columns] = await sequelize.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND LOWER(TABLE_NAME) = LOWER(:tableName)",
    { replacements: { tableName: expectedTableName } },
  );
  if (columns.some(({ COLUMN_NAME }) => COLUMN_NAME.toLowerCase() === "paymentmethod")) return;

  const attribute = RentPaymentModel.rawAttributes.paymentMethod;
  await sequelize.getQueryInterface().addColumn(tableName, "paymentMethod", {
    type: attribute.type,
    allowNull: true,
    defaultValue: null,
  });
  console.log(`✅ Se agregó la columna ${tableName}.paymentMethod.`);
};

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
  await sequelize.sync();
  await ensurePropertyOptionalColumns();
  await ensureRentPaymentMethodColumn();
  await seedInstitutions();
  await seedDemoRentalData();
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
    console.error(
      "❌ No se pudo cerrar la conexión a la base de datos:",
      closeError,
    );
  }
  process.exitCode = 1;
});
