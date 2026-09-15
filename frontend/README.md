# Alquileres Formosa — Frontend

Frontend en React (Vite) para la plataforma de alquileres para estudiantes de Formosa.
Consume la API en `backend/` (Express + JWT + Sequelize/MySQL).

Paleta propia **"Atardecer Litoraleño"**: terracota, ocre y ciruela — sin azules —
inspirada en el atardecer sobre el río Paraguay. Ver `src/styles/tokens.css`.

## Requisitos

- Node.js 18+
- El backend corriendo (por defecto en `http://localhost:3000`)

## Cómo correrlo

```bash
npm install
cp .env.example .env   # ajustar VITE_API_URL si el backend corre en otro puerto/host
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Estructura

```
src/
  api/          # llamadas fetch a la API (auth, properties, students)
  components/   # componentes reutilizables (Navbar, tarjetas, formularios, tabs...)
  context/      # AuthContext: sesión, login/registro/logout, token JWT
  pages/        # una página por ruta
  styles/       # tokens.css (paleta/tipografía) + hojas de estilo por área
```

## Rutas principales

| Ruta                  | Acceso              | Descripción                              |
| --------------------- | -------------------- | ----------------------------------------- |
| `/`                   | Pública              | Catálogo con filtros y paginación         |
| `/propiedades/:id`    | Pública              | Detalle de una propiedad                  |
| `/ingresar`           | Pública              | Login                                     |
| `/crear-cuenta`       | Pública              | Registro (elige rol estudiante/dueño)     |
| `/panel-dueno`        | Owner                | Mis propiedades, publicar, cuenta         |
| `/panel-estudiante`   | Student              | Mi perfil, accesos rápidos de búsqueda    |
| `/institucional`      | Pública              | Quiénes somos                             |
| `/contacto`           | Pública              | Datos de contacto                         |

## Build de producción

```bash
npm run build   # genera dist/
npm run preview # sirve el build localmente
```
