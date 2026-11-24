# Alquileres Formosa — Frontend

Aplicación web de Alquileres Formosa, construida con React y Vite. Permite explorar propiedades, consultar mapas e instituciones y usar herramientas para estudiantes y propietarios. Se comunica con la API REST del backend.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0` (requisito de Vite 8).
- npm.
- Backend iniciado y accesible desde el navegador. Por defecto, la API se espera en `http://localhost:3000/api`.

## Instalación y desarrollo

Desde la raíz del repositorio:

```bash
cd frontend
npm ci
```

Configurá la URL de la API copiando el archivo de ejemplo:

```bash
cp .env.example .env
```

En PowerShell de Windows, podés usar:

```powershell
Copy-Item .env.example .env
```

Editá `VITE_API_URL` en `.env` si el backend usa otra dirección. El valor por defecto es:

```env
VITE_API_URL=http://localhost:3000/api
```

Iniciá el servidor de desarrollo:

```bash
npm run dev
```

Vite sirve la aplicación en `http://localhost:5173`.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run lint` | Ejecuta ESLint sobre el frontend. |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Sirve localmente el contenido generado en `dist/`. |

## Funcionalidades

- Catálogo de alquileres con filtros y paginación.
- Detalle, mapa y reseñas de propiedades.
- Registro e inicio de sesión para estudiantes y propietarios.
- Panel de estudiante con perfil, favoritos y alquileres compartidos.
- Panel de propietario para administrar publicaciones y personas del alquiler, y registrar pagos.
- Foro compartido por alquiler.
- Mapa de propiedades, instituciones educativas y datos de seguridad.
- Guía asistida, consejos de seguridad y asistente de ayuda.
- Tema claro y oscuro, con preferencia guardada en el navegador.

## Rutas

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` y `/alquileres` | Público | Inicio y catálogo de alquileres. |
| `/alquileres/:id` | Público | Detalle de una propiedad. |
| `/alquileres/:id/foro` | Estudiantes y propietarios | Foro compartido de la propiedad. |
| `/alquileres/:id/gestion` | Propietario de la publicación | Personas, pagos e información del alquiler. |
| `/alquileres/nuevo` | Propietario | Publicar una propiedad. |
| `/alquileres/:id/editar` | Propietario de la publicación | Editar una propiedad. |
| `/panel-estudiante` | Estudiante | Panel y perfil de estudiante. |
| `/panel-dueno` | Propietario | Panel de publicaciones. |
| `/perfil-dueno` | Propietario | Perfil público y datos del propietario. |
| `/mapa` | Público | Mapa de alquileres e instituciones. |
| `/mapa-del-delito` | Usuario autenticado | Mapa de datos de seguridad. |
| `/guia-asistida` | Público | Recomendaciones de alquiler según preferencias. |
| `/consejos-seguridad` | Público | Consejos para alquilar de forma segura. |
| `/instituciones` | Público | Redirige al mapa de instituciones. |
| `/login-and-registration` | Público | Inicio de sesión y registro. |

`/acceder`, `/login` y `/registro` son rutas de compatibilidad que redirigen al flujo de acceso actual.

## Estructura del código

```text
src/
  api/          Clientes para autenticación, propiedades, reseñas, foro y perfiles
  components/   Formularios, mapas, tarjetas, paneles y componentes compartidos
  context/      Sesión, tema y ubicación
  data/         Datos usados por la interfaz
  pages/        Vistas principales de la aplicación
  styles/       Estilos globales, del tema y específicos por vista
  utils/        Funciones auxiliares
```

## Estilos

Los estilos están escritos en CSS y se importan desde `src/styles/App.css`. Las reglas se organizan así:

- `base.css`: variables de color, tipografía y reglas base compartidas.
- `home.css` y `forms.css`: catálogo, formularios y controles comunes.
- Hojas como `PropertyForum.css`, `OwnerPropertyManagement.css` y `PropertyMapPage.css`: estilos específicos de cada área.
- `responsive.css`: ajustes para distintos tamaños de pantalla.
- `dashboard.css`: paneles de estudiante y propietario.
- `redesign.css`: ajustes visuales generales que se aplican al final de la cascada.
- `theme.css`: colores del tema claro. El tema oscuro es el predeterminado; la selección se guarda en `localStorage`.

Los colores compartidos se definen como variables CSS en `base.css`; el tema claro actualiza varias de ellas en `theme.css`. Para agregar estilos a una página, preferí clases propias de esa vista y mantené los cambios adaptables a móvil. Evitá selectores globales como `main`, `label` o `input` cuando el cambio sea específico: pueden modificar otras páginas; en ese caso, limitá el selector al contenedor de la vista.

La URL base de la API se configura con `VITE_API_URL`. El cliente agrega el token de sesión a las solicitudes que requieren autenticación.
