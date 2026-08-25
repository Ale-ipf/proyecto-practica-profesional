import express from 'express';
import { registrar, login, logout, quienSoy } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/registro', registrar);
router.post('/login', login);
router.get('/logout', logout);
router.get('/quien-soy', quienSoy);

export default router;