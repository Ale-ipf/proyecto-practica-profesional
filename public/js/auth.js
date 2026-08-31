export async function obtenerUsuarioActual() {
    try {
        const res = await fetch('/quien-soy');
        return await res.json();
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return { logueado: false };
    }
}

export async function renderizarBarraSesion(contenedorId = 'contenedor-sesion') {
    const divSesion = document.getElementById(contenedorId);
    if (!divSesion) return;

    const data = await obtenerUsuarioActual();

    if (data.logueado) {
        const esDueno = data.usuario.rol === 'dueno';
        const urlPerfil = esDueno ? '/perfil-dueno.html' : '/perfil-estudiante.html';
        const textoBoton = esDueno ? '👤 Mi Panel de Dueño' : '🎓 Mi Panel Estudiantil';

        divSesion.innerHTML = `
            <span class="me-2 fw-semibold text-dark">Hola, ${data.usuario.email}</span>
            <a href="${urlPerfil}" class="btn btn-sm btn-warning text-dark fw-bold me-2">${textoBoton}</a>
            <a href="/logout" class="btn btn-sm btn-outline-danger fw-semibold">Cerrar Sesión</a>
        `;
    } else {
        divSesion.innerHTML = `
            <a href="/login.html" class="btn btn-sm btn-outline-primary me-2 fw-semibold">Iniciar Sesión</a>
            <a href="/registro.html" class="btn btn-sm btn-warning text-dark fw-bold">Registrarse</a>
        `;
    }
}