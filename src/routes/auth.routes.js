import { Router } from 'express';
import { registrar, login, logout, verificarSesion } from '../controllers/auth.controller.js';
import upload from '../middlewares/upload.middleware.js'; // Opcional si querés foto en registro

const router = Router();

router.post('/registro', upload.single('fotoPerfil'), registrar);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verificar', verificarSesion);

export default router;