export const STUDENT_NAVIGATION = [
  { key: "dashboard", label: "Mi panel", icon: "home", to: "/panel-estudiante" },
  { key: "profile", label: "Mi perfil", icon: "user", to: "/panel-estudiante?section=profile" },
  { key: "personal", label: "Datos personales", icon: "user", to: "/panel-estudiante?section=personal" },
  { key: "properties", label: "Buscar alquileres", icon: "search", to: "/alquileres" },
  { key: "crime-map", label: "Mapa del delito", icon: "map", to: "/mapa-del-delito" },
  { key: "institutions", label: "Instituciones educativas", icon: "school", to: "/mapa?capa=instituciones#mapa" },
  { key: "guide", label: "Guía asistida", icon: "guide", to: "/guia-asistida" },
  { key: "safety", label: "Consejos de seguridad", icon: "shield", to: "/consejos-seguridad" },
  { key: "app", label: "Ajustes de la app", icon: "settings", to: "/panel-estudiante?section=app" },
  { key: "privacy", label: "Privacidad", icon: "lock", to: "/panel-estudiante?section=privacy" },
];

export const OWNER_NAVIGATION = [
  { key: "dashboard", label: "Mi panel", icon: "home", to: "/panel-dueno" },
  { key: "profile", label: "Mi perfil", icon: "user", to: "/perfil-dueno" },
  { key: "properties", label: "Mis propiedades", icon: "building", to: "/panel-dueno#propiedades" },
  { key: "publish", label: "Publicar propiedad", icon: "plus", to: "/alquileres/nuevo" },
  { key: "management", label: "Gestión de alquileres", icon: "settings", to: "/panel-dueno#propiedades" },
  { key: "personal", label: "Datos personales", icon: "user", to: "/perfil-dueno#datos-personales" },
];
