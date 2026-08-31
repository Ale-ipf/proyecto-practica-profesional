import { Usuario } from '../models/index.js';
import bcrypt from 'bcrypt';

// Registro de usuario
export const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol, telefono } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario en la base de datos
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordHash,
      rol: rol || 'estudiante',
      telefono,
      fotoPerfil: req.file ? `/uploads/${req.file.filename}` : null // Por si querés usar multer en el registro
    });

    return res.status(201).json({
      mensaje: 'Usuario registrado con éxito',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Inicio de sesión
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas (usuario no encontrado).' });
    }

    // Validar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas (contraseña incorrecta).' });
    }

    // Guardar datos esenciales en la sesión
    req.session.usuarioId = usuario.id;
    req.session.rol = usuario.rol;
    req.session.nombre = usuario.nombre;

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      rol: usuario.rol,
      redirect: usuario.rol === 'dueno' ? '/perfil-dueno.html' : '/perfil-estudiante.html'
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cerrar sesión
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
  });
};

// Verificar sesión actual (para el front)
export const verificarSesion = (req, res) => {
  if (req.session.usuarioId) {
    return res.status(200).json({
      autenticado: true,
      usuario: {
        id: req.session.usuarioId,
        nombre: req.session.nombre,
        rol: req.session.rol
      }
    });
  }
  return res.status(401).json({ autenticado: false });
};