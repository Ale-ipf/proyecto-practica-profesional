# Instrucciones de Desarrollo: Mapeo de Datos Criminales de Formosa en Leaflet

## 1. Contexto del Proyecto y Limitaciones de Datos
Estamos desarrollando una aplicación web cartográfica para visualizar el **Primer Mapa del Delito de la Ciudad de Formosa (Año 2024)**, basado en un informe independiente y vecinal presentado ante el Concejo Deliberante. 

### Restricciones Críticas de los Datos:
- No existen coordenadas geográficas (`lat/lng`) precisas por cada delito debido a la falta de una API oficial.
- El informe destaca datos macro-cualitativos agregados por sectores, principalmente enfocados en el **Centro de la Ciudad** y el **Circuito 5 (Zona Norte)**.
- Estadísticas core a incluir en las métricas informativas:
  * Promedio: 1 robo denunciado cada 98 habitantes en la capital.
  * Cifra Negra (Subdenuncia): Se estima que el 55% de las víctimas no denuncia (aproximadamente 3.000 denuncias formales vs. 6.000 casos reales proyectados).

---

## 2. Requerimientos Técnicos (Stack)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+).
- **Librería de Mapas:** Leaflet.js v1.9.4 (vía CDN o NPM).
- **Estrategia Cartográfica:** Visualización basada en Polígonos/Coropletas (GeoJSON) representativos de las zonas analizadas, evitando marcadores puntuales inexactos.

---

## 3. Estructura de Datos Recomendada (`delitos-data.js`)
El agente debe estructurar o consumir un objeto GeoJSON con las coordenadas aproximadas que delimitan los sectores de Formosa Capital e integran las variables del informe:

```javascript
const geojsonFormosaDelitos = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "ZONA-CENTRO",
        "zona": "Centro de la Ciudad",
        "delito_principal": "Arrebatos en la vía pública (Motochorros / Descuidistas)",
        "incidencia_nominal": "Alta",
        "denuncias_anuales_est": 1100,
        "descripcion": "Concentración crítica de robos en modalidad peatonal. Promedio general de la capital: 1 robo cada 98 habitantes."
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-58.1770, -26.1770],
          [-58.1630, -26.1770],
          [-58.1630, -26.1900],
          [-58.1770, -26.1900],
          [-58.1770, -26.1770]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "ZONA-C5",
        "zona": "Circuito 5 (Zona Norte)",
        "delito_principal": "Delitos complejos y multivariados (Ingreso a propiedades y hurtos)",
        "incidencia_nominal": "Muy Alta",
        "denuncias_anuales_est": 1938,
        "descripcion": "Zona con mayor diversidad y recurrencia de hechos delictivos directos a la propiedad privada según encuestas vecinales."
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-58.2100, -26.1300],
          [-58.1600, -26.1300],
          [-58.1600, -26.1600],
          [-58.2100, -26.1600],
          [-58.2100, -26.1300]
        ]]
      }
    }
  ]
};
```

---

## 4. Requerimientos de Lógica y UI (JavaScript + Leaflet)

### A. Inicialización del Mapa
- Centrar la vista inicial de Leaflet en Formosa Capital: `[-26.1849, -58.1731]` con un nivel de zoom de `13`.
- Utilizar una capa base clara (ej. OpenStreetMap estándar o CartoDB Positron) para que resalten los polígonos de calor criminal.

### B. Estilización Dinámica (Coropletas)
- Crear una función de estilos que asigne colores según la propiedad `incidencia_nominal`:
  * `Muy Alta` -> Rojo Intenso (`#d9534f`)
  * `Alta` -> Naranja/Amarillo Oscuro (`#f0ad4e`)
- Opacidad inicial del relleno fijada en `0.5`.

### C. Interactividad Obligatoria
- **Mouseover / Mouseout:** Al pasar el cursor sobre un polígono, aumentar la opacidad del relleno a `0.75` para dar feedback visual. Al quitarlo, restablecer el estilo original.
- **Popups:** Al hacer clic en un sector, desplegar un Popup estilizado que muestre de forma ordenada:
  * Nombre de la zona (`properties.zona`).
  * Tipología de delito predominante.
  * Nota metodológica del informe Herrera (2024).

### D. Feature Especial: "Simulación de la Cifra Negra (Subdenuncia)"
- Añadir un control de interfaz (ej. un botón flotante HTML o un checkbox).
- **Comportamiento esperado:** Al activar el switch "Visualizar Cifra Negra (+55%)", la aplicación debe recalcular dinámicamente los estilos de los polígonos:
  * Multiplicar los valores numéricos visibles en pantalla para reflejar la proyección real (duplicar las denuncias estimadas).
  * Cambiar el `fillOpacity` o los colores de los polígonos a tonos más oscuros/críticos para representar el impacto del delito no denunciado.

---

## 5. Bloque de Transparencia Académica (Control de Leyenda)
El agente debe incluir obligatoriamente una leyenda fija o tarjeta flotante en la UI (`L.control`) que aclare las fuentes:
> *"Nota del Proyecto: Ante la ausencia de un Mapa del Delito oficial por parte del Estado provincial, los datos de esta app corresponden al relevamiento legislativo independiente (Año 2024). Las fronteras de los polígonos son aproximaciones cualitativas con fines analíticos."*
