import db from '../config/db.js';

export const obtenerAlquileres = async (req, res) => {
    try {
        const [filas] = await db.query(`
            SELECT a.id, a.titulo, a.precio, a.barrio, a.ambientes, 
                   a.tipoInmueble, a.tieneAire, a.imagen, u.email AS dueno 
            FROM alquileres a
            JOIN usuarios u ON a.usuario_id = u.id
            ORDER BY a.id DESC
        `);
        
        const alquileresFormateados = filas.map(a => ({
            ...a,
            tieneAire: Boolean(a.tieneAire)
        }));

        res.json(alquileresFormateados);
    } catch (error) {
        console.error("Error al obtener alquileres:", error);
        res.status(500).json({ error: "Error al obtener las publicaciones" });
    }
};

export const crearAlquiler = async (req, res) => {
    const usuario = req.session.usuarioLogueado;
    
    if (!usuario || usuario.rol !== 'dueno') {
        return res.status(403).send('No tenés permisos para publicar. Debes ser dueño.');
    }

    const { titulo, precio, barrio, ambientes, tipoInmueble, tieneAire } = req.body;
    const rutaImagen = req.file ? `/uploads/${req.file.filename}` : "/uploads/default-depto.jpg";

    try {
        await db.query(
            `INSERT INTO alquileres 
            (titulo, precio, barrio, ambientes, tipoInmueble, tieneAire, imagen, usuario_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                Number(precio),
                barrio,
                Number(ambientes),
                tipoInmueble || "Directo",
                tieneAire === 'si' || tieneAire === true ? 1 : 0,
                rutaImagen,
                usuario.id
            ]
        );

        res.redirect('/perfil-dueno.html');
    } catch (error) {
        console.error("Error al guardar alquiler:", error);
        res.status(500).send('<h3>Error interno al publicar el alquiler.</h3>');
    }
};

export const editarPrecio = async (req, res) => {
    const usuario = req.session.usuarioLogueado;
    const { idAlquiler, nuevoPrecio } = req.body;

    if (!usuario) return res.status(401).json({ exito: false, mensaje: "No logueado" });

    try {
        const [filas] = await db.query('SELECT * FROM alquileres WHERE id = ?', [Number(idAlquiler)]);
        if (filas.length === 0) return res.status(404).json({ exito: false, mensaje: "No se encontró el alquiler" });

        if (filas[0].usuario_id !== usuario.id) {
            return res.status(403).json({ exito: false, mensaje: "No eres el dueño de esta publicación" });
        }

        await db.query('UPDATE alquileres SET precio = ? WHERE id = ?', [Number(nuevoPrecio), Number(idAlquiler)]);
        res.json({ exito: true });
    } catch (error) {
        console.error("Error al editar precio:", error);
        res.status(500).json({ exito: false, mensaje: "Error de servidor" });
    }
};

export const borrarAlquiler = async (req, res) => {
    const usuario = req.session.usuarioLogueado;
    const { idAlquiler } = req.body;

    if (!usuario) return res.status(401).send("No autorizado");

    try {
        const [filas] = await db.query('SELECT * FROM alquileres WHERE id = ?', [Number(idAlquiler)]);
        if (filas.length === 0) return res.status(404).send("No encontrado");

        if (filas[0].usuario_id !== usuario.id) {
            return res.status(403).send("No tienes permiso");
        }

        await db.query('DELETE FROM alquileres WHERE id = ?', [Number(idAlquiler)]);
        res.redirect('/perfil-dueno.html');
    } catch (error) {
        console.error("Error al borrar alquiler:", error);
        res.status(500).send("Error interno al eliminar");
    }
};