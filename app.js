import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize, testConnection } from "./src/config/database.js";
import { errorHandler, notFound } from "./src/middlewares/error.middleware.js";
import router from "./src/routes/index.routes.js";

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
  // Crea/actualiza las tablas en la base de datos según los modelos.
  // alter: true ajusta las tablas existentes sin borrar los datos (ideal en desarrollo).
  await sequelize.sync({ alter: true });
  console.log("✅ Modelos sincronizados con la base de datos.");

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
