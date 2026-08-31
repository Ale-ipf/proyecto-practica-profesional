import { Alquiler, Usuario } from '../models/index.js';

// Obtener todos los alquileres (para el catálogo/home)
export const obtenerAlquileres = async (req, res) => {
  try {
    const alquileres = await Alquiler.findAll({
      where: { disponible: true },
      include: [{
        model: Usuario,
        as: 'dueno',
        attributes: ['id', 'nombre', 'email', 'telefono']
      }],
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json(alquileres);
  } catch (error) {
    console.error('Error al obtener alquileres:', error);
    return res.status(500).json({ error: 'Error al cargar las publicaciones.' });
  }
};

// Crear una nueva publicación (solo para dueños)
export const crearAlquiler = async (req, res) => {
  try {
    const { titulo, descripcion, precio, ubicacion, habitaciones } = req.body;

    // Verificar que haya sesión de dueño
    if (!req.session.usuarioId || req.session.rol !== 'dueno') {
      return res.status(403).json({ error: 'No tienes permiso para publicar un alquiler.' });
    }

    const nuevoAlquiler = await Alquiler.create({
      titulo,
      descripcion,
      precio,
      ubicacion,
      habitaciones,
      imagen: req.file ? `/uploads/${req.file.filename}` : null,
      duenoId: req.session.usuarioId
    });

    return res.status(201).json({
      mensaje: 'Alquiler publicado correctamente',
      alquiler: nuevoAlquiler
    });
  } catch (error) {
    console.error('Error al crear alquiler:', error);
    return res.status(500).json({ error: 'Error interno al guardar la publicación.' });
  }
};

// Obtener las publicaciones específicas del dueño logueado (para perfil-dueno.html)
export const obtenerMisAlquileres = async (req, res) => {
  try {
    if (!req.session.usuarioId) {
      return res.status(401).json({ error: 'Sesión no iniciada.' });
    }

    const misAlquileres = await Alquiler.findAll({
      where: { duenoId: req.session.usuarioId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(misAlquileres);
  } catch (error) {
    console.error('Error al obtener tus alquileres:', error);
    return res.status(500).json({ error: 'Error al recuperar tus publicaciones.' });
  }
};

// Eliminar un alquiler
export const eliminarAlquiler = async (req, res) => {
  try {
    const { id } = req.params;

    const alquiler = await Alquiler.findByPk(id);
    if (!alquiler) {
      return res.status(404).json({ error: 'Publicación no encontrada.' });
    }

    // Verificar que el alquiler pertenezca al dueño logueado
    if (alquiler.duenoId !== req.session.usuarioId) {
      return res.status(403).json({ error: 'No tienes autorización para eliminar esta publicación.' });
    }

    await alquiler.destroy();
    return res.status(200).json({ mensaje: 'Publicación eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar alquiler:', error);
    return res.status(500).json({ error: 'Error interno al intentar eliminar.' });
  }
};