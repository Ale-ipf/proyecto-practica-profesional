import express from 'express';
import { obtenerAlquileres, crearAlquiler, editarPrecio, borrarAlquiler } from '../controllers/alquileres.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', obtenerAlquileres);
router.post('/', upload.single('foto'), crearAlquiler);
router.post('/editar-precio', editarPrecio);
router.post('/borrar', borrarAlquiler);

export default router;