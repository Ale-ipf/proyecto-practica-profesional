import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import './src/models/index.js';


import authRoutes from './src/routes/auth.routes.js';
import alquileresRoutes from './src/routes/alquileres.routes.js';
import { sequelize } from './src/config/db.js'; // Conexión a Sequelize

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración para __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares Globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_secreta_fsa_alquileres',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 día
}));

// Montar Rutas Modulares
app.use('/api/auth', authRoutes); // Recomendado usar prefijo /api
app.use('/api/alquileres', alquileresRoutes);

// Iniciar servidor y sincronizar Base de Datos
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Crea o actualiza tablas según los modelos
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Base de datos conectada y tablas sincronizadas.');
  } catch (error) {
    console.error('Error con la base de datos:', error);
  }
});