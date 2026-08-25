import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/auth.routes.js';
import alquileresRoutes from './src/routes/alquileres.routes.js';

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
    secret: 'clave_secreta_fsa_alquileres',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 día
}));

// Montar Rutas Modulares
app.use('/', authRoutes);
app.use('/alquileres', alquileresRoutes);

// Ruta temporal de favoritos para evitar errores en el panel de estudiantes
app.get('/usuarios/favoritos', (req, res) => {
    res.json([]);
});

// Arrancar Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});