import { useEffect, useState } from "react";
import "../styles/FeatureCarousel.css";

const studentFeatures = [
  {
    label: "ALQUILERES",
    title: "Opciones para encontrar tu próximo hogar",
    description:
      "Conocé las publicaciones disponibles y compará ubicación, precio, ambientes y comodidades para tener más elementos al momento de elegir.",
    details: ["Ubicación y zona", "Precio y ambientes", "Características del anuncio"],
  },
  {
    label: "GUÍA ASISTIDA",
    title: "Una búsqueda pensada según tus prioridades",
    description:
      "La guía organiza criterios como presupuesto, lugar de estudio y preferencias para ayudarte a evaluar qué aspectos considerar en una vivienda.",
    details: ["Preferencias de búsqueda", "Cercanía a instituciones", "Recomendaciones para comparar"],
  },
  {
    label: "PANEL",
    title: "Tu información organizada en un solo lugar",
    description:
      "El panel reúne las opciones y herramientas de tu cuenta. Su contenido se adapta al perfil de estudiante o propietario.",
    details: ["Datos de tu cuenta", "Accesos a tus herramientas", "Gestión de publicaciones o alquileres"],
  },
  {
    label: "MAPAS",
    title: "Ubicaciones y referencias para conocer la zona",
    description:
      "Los mapas presentan información geográfica de alquileres, instituciones educativas y datos de seguridad para ayudar a contextualizar cada zona.",
    details: ["Alquileres y sus alrededores", "Instituciones educativas", "Información de seguridad"],
  },
];

const ownerFeatures = [
  {
    label: "PUBLICACIONES",
    title: "Mostrá tus alquileres a estudiantes de Formosa",
    description: "Creá publicaciones con precio, ubicación, disponibilidad y servicios para que cada estudiante encuentre la opción adecuada.",
    details: ["Publicá un inmueble", "Actualizá disponibilidad", "Administrá tus anuncios"],
  },
  {
    label: "GARANTÍA",
    title: "Prepará la documentación antes de compartirla",
    description: "Guardá por propiedad la escritura, el informe de dominio y el consentimiento de titulares, y respondé las solicitudes de acceso.",
    details: ["Archivos privados", "Solicitudes por propiedad", "Acceso aprobado por 24 horas"],
  },
  {
    label: "GESTIÓN",
    title: "Organizá el seguimiento de tus alquileres",
    description: "Agregá estudiantes a tus publicaciones y registrá el pago mensual indicando efectivo o transferencia.",
    details: ["Personas asociadas", "Estado mensual", "Foro privado del alquiler"],
  },
  {
    label: "ASISTENTE",
    title: "Encontrá ayuda para cada tarea del propietario",
    description: "Consultá cómo publicar, preparar documentos, responder solicitudes o administrar tus alquileres.",
    details: ["Orientación sobre la app", "Accesos directos", "Ayuda disponible desde cualquier pantalla"],
  },
];

export default function FeatureCarousel({ audience = "student" }) {
  const features = audience === "owner" ? ownerFeatures : studentFeatures;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const feature = features[selectedIndex];
  const changeSlide = (direction) =>
    setSelectedIndex(
      (current) => (current + direction + features.length) % features.length,
    );

  useEffect(() => {
    if (
      isPaused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % features.length);
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [isPaused, selectedIndex]);

  return (
    <section
      className="feature-carousel"
      aria-label="Información sobre la plataforma"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="feature-carousel__copy">
        <span className="section-kicker">CONOCÉ LA PLATAFORMA</span>
        <div className="feature-carousel__slide" key={selectedIndex}>
          <span className="feature-carousel__counter">
            {String(selectedIndex + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
          </span>
          <h1>{feature.title}</h1>
          <p>{feature.description}</p>
        </div>
        <div className="feature-carousel__controls" aria-label="Cambiar información">
          <button
            type="button"
            onClick={() => changeSlide(-1)}
            aria-label="Información anterior"
          >
            ←
          </button>
          <div className="feature-carousel__dots">
            {features.map((item, index) => (
              <button
                key={item.label}
                className={index === selectedIndex ? "is-active" : ""}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Ver información: ${item.label.toLocaleLowerCase("es-AR")}`}
                aria-current={index === selectedIndex ? "true" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => changeSlide(1)}
            aria-label="Siguiente información"
          >
            →
          </button>
        </div>
      </div>
      <div
        className="feature-carousel__details"
        aria-live="polite"
        key={`details-${selectedIndex}`}
      >
        <span className="feature-carousel__label">{feature.label}</span>
        <ul>
          {feature.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
