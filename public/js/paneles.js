import { obtenerUsuarioActual } from './auth.js';

// --- LÓGICA PANEL DUEÑO ---
export async function inicializarPanelDueno() {
    const dataUser = await obtenerUsuarioActual();

    if (!dataUser.logueado || dataUser.usuario.rol !== 'dueno') {
        alert('Debes iniciar sesión como Dueño para ver esta página.');
        window.location.href = '/login.html';
        return;
    }

    document.getElementById('bienvenida-email').innerText = dataUser.usuario.email;
    document.getElementById('info-email').innerText = dataUser.usuario.email;

    cargarMisPublicaciones(dataUser.usuario.email);
}

async function cargarMisPublicaciones(emailDueno) {
    try {
        const res = await fetch('/alquileres');
        const alquileres = await res.json();
        const misPublicaciones = alquileres.filter(a => a.dueno === emailDueno);
        
        renderizarMisAlquileres(misPublicaciones);
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
    }
}

function renderizarMisAlquileres(lista) {
    const contenedor = document.getElementById('contenedor-mis-alquileres');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted fs-5">Aún no tenés alquileres publicados.</p>
                <button class="btn btn-outline-warning text-dark fw-bold" onclick="document.getElementById('tab-nuevo-alquiler').click()">
                    ¡Publicá tu primer alquiler acá! ➕
                </button>
            </div>`;
        return;
    }

    lista.forEach(a => {
        contenedor.innerHTML += `
            <div class="col-md-4">
                <div class="card h-100 panel-premium shadow-sm overflow-hidden border">
                    <img src="${a.imagen}" class="card-img-top" alt="Foto">
                    <div class="card-body p-3">
                        <span class="badge bg-warning text-dark mb-2">Barrio ${a.barrio}</span>
                        <h5 class="fw-bold mb-1">${a.titulo}</h5>
                        <p class="text-success fw-bold fs-4 mb-2">$${a.precio.toLocaleString('es-AR')}</p>
                        <div class="d-flex gap-2 mt-3">
                            <button onclick="window.modificarPrecio(${a.id}, ${a.precio})" class="btn btn-sm btn-outline-warning w-50 fw-bold text-dark">Editar $</button>
                            <button onclick="window.borrarAlquiler(${a.id})" class="btn btn-sm btn-outline-danger w-50 fw-bold">Borrar</button>
                        </div>
                    </div>
                </div>
            </div>`;
    });
}

// --- LÓGICA PANEL ESTUDIANTE ---
export async function inicializarPanelEstudiante() {
    const dataUser = await obtenerUsuarioActual();

    if (!dataUser.logueado) {
        alert('Debes iniciar sesión para acceder.');
        window.location.href = '/login.html';
        return;
    }

    if (dataUser.usuario.rol === 'dueno') {
        window.location.href = '/perfil-dueno.html';
        return;
    }

    // Insertar datos del estudiante
    const elemBienvenida = document.getElementById('bienvenida-email');
    const elemInfo = document.getElementById('info-email');
    
    if (elemBienvenida) elemBienvenida.innerText = dataUser.usuario.email;
    if (elemInfo) elemInfo.innerText = dataUser.usuario.email;

    // Cargar tarjetas de favoritos/alquileres guardados
    cargarFavoritosEstudiante();
}

async function cargarFavoritosEstudiante() {
    const contenedor = document.getElementById('contenedor-favoritos');
    if (!contenedor) return;

    try {
        const resFavs = await fetch('/usuarios/favoritos');
        const favoritosIds = await resFavs.json();

        const resAlq = await fetch('/alquileres');
        const todos = await resAlq.json();

        const misFavs = todos.filter(a => favoritosIds.includes(Number(a.id)));

        if (misFavs.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-4">
                    <p class="text-muted fs-5">Aún no guardaste ninguna propiedad favorita.</p>
                    <a href="/" class="btn btn-outline-primary fw-bold">Explorar Alquileres</a>
                </div>`;
            return;
        }

        contenedor.innerHTML = misFavs.map(a => `
            <div class="col-md-4 mb-3">
                <div class="card h-100 panel-premium shadow-sm overflow-hidden border">
                    <img src="${a.imagen}" class="card-img-top" alt="Foto">
                    <div class="card-body p-3">
                        <span class="badge bg-warning text-dark mb-2">Barrio ${a.barrio}</span>
                        <h5 class="fw-bold mb-1">${a.titulo}</h5>
                        <p class="text-success fw-bold fs-4 mb-2">$${a.precio.toLocaleString('es-AR')}</p>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error al cargar favoritos:', error);
    }
}