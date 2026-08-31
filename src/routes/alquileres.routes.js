import { Router } from 'express';
import { 
  obtenerAlquileres, 
  crearAlquiler, 
  obtenerMisAlquileres, 
  eliminarAlquiler 
} from '../controllers/alquileres.controller.js';
import upload from '../middlewares/upload.middleware.js';

const router = Router();

router.get('/', obtenerAlquileres);
router.get('/mis-alquileres', obtenerMisAlquileres);
router.post('/', upload.single('imagen'), crearAlquiler);
router.delete('/:id', eliminarAlquiler);

export default router;