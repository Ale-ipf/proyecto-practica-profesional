import db from '../config/db.js';

export const registrar = async (req, res) => {
    const { email, password, rol } = req.body;
    
    if (!email || !password || !rol) {
        return res.send('<h3>Faltan campos obligatorios. <a href="/registro.html">Volver</a></h3>');
    }

    try {
        const [existe] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.send('<h3>El email ya está registrado. <a href="/registro.html">Volver</a></h3>');
        }

        await db.query('INSERT INTO usuarios (email, password, rol) VALUES (?, ?, ?)', [email, password, rol]);
        res.redirect('/login.html');
    } catch (error) {
        console.error("Error en el registro:", error);
        res.status(500).send('<h3>Error interno del servidor al registrar.</h3>');
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [usuariosEncontrados] = await db.query(
            'SELECT * FROM usuarios WHERE email = ? AND password = ?', 
            [email, password]
        );

        if (usuariosEncontrados.length === 0) {
            return res.send('<h3>Credenciales incorrectas. <a href="/login.html">Volver</a></h3>');
        }

        const usuario = usuariosEncontrados[0];
        const rolDefinido = (usuario.rol && usuario.rol.trim() !== '') ? usuario.rol : 'estudiante';

        req.session.usuarioLogueado = {
            id: usuario.id,
            email: usuario.email,
            rol: rolDefinido
        };

        if (rolDefinido === 'dueno') {
            res.redirect('/perfil-dueno.html');
        } else {
            res.redirect('/perfil-estudiante.html');
        }

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).send('<h3>Error interno del servidor al iniciar sesión.</h3>');
    }
};

export const logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

export const quienSoy = (req, res) => {
    if (req.session.usuarioLogueado) {
        res.json({
            logueado: true,
            usuario: {
                email: req.session.usuarioLogueado.email,
                rol: req.session.usuarioLogueado.rol
            }
        });
    } else {
        res.json({ logueado: false });
    }
};