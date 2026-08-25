// src/middlewares/auth.middleware.js
const esDueno = (req, res, next) => {
    if (req.session.usuarioLogueado && req.session.usuarioLogueado.rol === 'dueno') {
        return next();
    }
    return res.status(403).json({ mensaje: 'Acceso denegado: Se requiere rol de dueño.' });
};

const estaAutenticado = (req, res, next) => {
    if (req.session.usuarioLogueado) {
        return next();
    }
    return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
};

module.exports = { esDueno, estaAutenticado };