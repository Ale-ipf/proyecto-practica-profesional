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

const startServer = async () => {
  await testConnection();
  // Evitamos ALTER TABLE automático en desarrollo porque MySQL puede fallar con cambios de JSON
  // sobre tablas ya creadas. sync() solo crea las tablas si faltan y no rompe la estructura existente.
  await sequelize.sync();
  await seedInstitutions();
  console.log("✅ Modelos sincronizados con la base de datos.");

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
