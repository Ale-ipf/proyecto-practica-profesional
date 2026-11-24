import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";

const STORAGE_KEY = "alquileres-formosa-assistant-history";
const HISTORY_TTL_MS = 60 * 60 * 1000;
const MAX_MESSAGES = 40;
const DEVELOPERS_EMAIL = "mailto:hola@alquileresformosa.com.ar";
const SAFE_ROUTES = [
  "/alquileres",
  "/alquileres/nuevo",
  "/guia-asistida",
  "/login-and-registration",
  "/mapa",
  "/mapa-del-delito",
  "/consejos-seguridad",
  "/instituciones",
  "/panel-estudiante",
  "/panel-dueno",
  "/panel-dueno/garantias",
  "/perfil-dueno",
];

function esRutaSegura(ruta) {
  if (typeof ruta !== "string" || !ruta.startsWith("/")) return false;
  const [pathname] = ruta.split(/[?#]/, 1);
  return SAFE_ROUTES.includes(pathname) || /^\/alquileres\/\d+\/(foro|gestion)$/.test(pathname);
}

const WELCOME_TEXT =
  "¡Hola! Puedo orientarte sobre cómo usar Alquileres Formosa, encontrar páginas y contactar al equipo de desarrollo.";

function nuevoSaludo(role) {
  const text = role === "owner"
    ? "Hola. Te ayudo a publicar y administrar alquileres, preparar garantias y responder solicitudes."
    : role === "student"
      ? "Hola. Te ayudo a buscar alquileres, revisar favoritos, entrar a Mi alquiler y consultar seguridad."
      : WELCOME_TEXT;
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    text,
  };
}

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function contieneAlguno(texto, terminos) {
  return terminos.some((termino) => texto.includes(termino));
}

function responderConsulta(consulta, role) {
  const texto = normalizar(consulta);

  if (contieneAlguno(texto, ["garantia", "documentacion", "escritura", "informe de dominio", "consentimiento", "compartir documentos"])) {
    if (role === "student" || contieneAlguno(texto, ["solicitar", "estudiante", "acceso", "ver documentos"])) {
      return {
        text: "Desde el detalle de un alquiler, solicitá acceso a la documentación de la garantía. El dueño debe aprobarlo; si lo hace, vas a poder consultar los archivos durante 24 horas.",
        actions: [{ label: "Buscar alquileres", to: "/alquileres" }],
      };
    }
    return {
      text: "Como dueño, podés guardar la documentación por propiedad en Garantías y documentos. Para compartirla, cargá la escritura o título y el informe de dominio; también podés agregar el consentimiento de los titulares. Las solicitudes pendientes se responden desde esa sección o desde tu perfil. El acceso aprobado dura 24 horas.",
      actions: [
        { label: "Garantías y documentos", to: "/panel-dueno/garantias" },
        { label: "Perfil del dueño", to: "/perfil-dueno" },
      ],
    };
  }

  if (role === "student" && contieneAlguno(texto, ["pago", "pagado", "mensualidad", "alquiler mensual", "efectivo", "transferencia"])) {
    return {
      text: "El propietario registra los pagos mensuales e indica si recibió efectivo o transferencia. Para consultar avisos del alquiler, entrá a Mi alquiler.",
      actions: [{ label: "Ir a Mi alquiler", to: "/panel-estudiante?section=rentals" }],
    };
  }

  if (contieneAlguno(texto, ["pago", "pagado", "mensualidad", "alquiler mensual", "efectivo", "transferencia"])) {
    return {
      text: "En la gestión de una publicación, el dueño puede agregar estudiantes al alquiler y registrar el estado de pago de cada mes. Al marcarlo como pagado, elige efectivo o transferencia; también puede volver a dejarlo pendiente.",
      actions: [{ label: "Panel de propietario", to: "/panel-dueno" }],
    };
  }

  if (role === "owner" && contieneAlguno(texto, ["foro", "mensaje", "mensajes", "inquilino", "inquilinos", "personas agregadas"])) {
    return {
      text: "El foro privado aparece para los estudiantes que agregues desde la gestión de la publicación. Usalo para compartir avisos y coordinar temas del alquiler.",
      actions: [{ label: "Administrar alquileres", to: "/panel-dueno#propiedades" }],
    };
  }

  if (contieneAlguno(texto, ["foro", "mensaje", "mensajes", "inquilino", "inquilinos", "personas agregadas"])) {
    return {
      text: "Cada alquiler tiene un foro privado para avisos y mensajes. El dueño agrega estudiantes desde la gestión de la publicación; las personas agregadas pueden abrir el foro desde Mis alquileres en su panel.",
      actions: [
        { label: "Mi alquiler", to: "/panel-estudiante?section=rentals" },
        { label: "Panel de propietario", to: "/panel-dueno" },
      ],
    };
  }

  if (role === "owner" && contieneAlguno(texto, ["mi alquiler", "mis alquileres", "alquiler compartido", "alquiler donde me agregaron"])) {
    return {
      text: "En el panel de propietario podés administrar las publicaciones donde registrás a tus estudiantes y los pagos mensuales.",
      actions: [{ label: "Ver mis propiedades", to: "/panel-dueno#propiedades" }],
    };
  }

  if (contieneAlguno(texto, ["mi alquiler", "mis alquileres", "alquiler compartido", "alquiler donde me agregaron"])) {
    return {
      text: "En Mi alquiler encontrás las publicaciones a las que te agregó el propietario y podés abrir el foro privado de cada una.",
      actions: [{ label: "Ir a Mi alquiler", to: "/panel-estudiante?section=rentals" }],
    };
  }

  if (role === "owner" && contieneAlguno(texto, ["publicar", "publicacion", "nuevo alquiler", "mis propiedades"])) {
    return {
      text: "Desde el panel podés publicar un inmueble nuevo o administrar tus publicaciones existentes.",
      actions: [
        { label: "Publicar propiedad", to: "/alquileres/nuevo" },
        { label: "Mis propiedades", to: "/panel-dueno#propiedades" },
      ],
    };
  }

  if (contieneAlguno(texto, ["guia", "instituto", "estudiar", "alquilar cerca", "precio sugerido"])) {
    return {
      text: "La Guía Asistida te ayuda a definir ubicación, traslado, ambientes, mascotas y presupuesto, y comparar alquileres recomendados. En el presupuesto podés elegir $100.000, $150.000, $200.000 o indicar otro monto.",
      actions: [{ label: "Abrir Guía Asistida", to: "/guia-asistida" }],
    };
  }

  if (contieneAlguno(texto, ["desarroll", "equipo", "soporte", "reportar un problema"])) {
    return {
      text: "Podés escribirle al equipo de desarrollo. Se abrirá tu aplicación de correo para enviar la consulta.",
      actions: [{ label: "Contactar desarrollo", href: DEVELOPERS_EMAIL }],
    };
  }

  if (
    contieneAlguno(texto, [
      "mas fotos",
      "mas imagenes",
      "foto",
      "imagen",
      "contactar al dueno",
      "contactar con el dueno",
      "contactar al propietario",
      "contacto del dueno",
      "contacto del propietario",
      "datos del propietario",
      "datos personales del propietario",
      "correo del propietario",
    ])
  ) {
    return {
      text: "Para ver más fotos y los datos del propietario, registrate o iniciá sesión. Después abrí la publicación que te interesa.",
      actions: [
        { label: "Iniciar sesión o registrarme", to: "/login-and-registration" },
        { label: "Ver alquileres", to: "/alquileres" },
      ],
    };
  }

  if (contieneAlguno(texto, ["registr", "crear cuenta", "iniciar sesion", "ingresar", "login"])) {
    return {
      text: "Desde Acceder podés iniciar sesión o crear una cuenta. Algunas funciones, como contactar propietarios y guardar favoritos, requieren una cuenta.",
      actions: [{ label: "Acceder o registrarme", to: "/login-and-registration" }],
    };
  }

  if (contieneAlguno(texto, ["filtro", "buscar", "busco", "encontrar", "barrio", "ambiente", "precio", "wifi", "cable", "mascota", "alquiler", "alquilar", "alquilo"])) {
    return {
      text: "En Alquileres podés filtrar por barrio y ambientes, ordenar por precio y abrir “Ver más filtros” para explorar servicios, modalidad y otras opciones.",
      actions: [{ label: "Ir a alquileres", to: "/alquileres" }],
    };
  }

  if (contieneAlguno(texto, ["guia", "instituto", "estudiar", "alquilar cerca"])) {
    return {
      text: "La Guía Asistida te ayuda a comparar opciones según ubicación, traslado, ambientes y tus preferencias.",
      actions: [{ label: "Abrir Guía Asistida", to: "/guia-asistida" }],
    };
  }

  if (contieneAlguno(texto, ["publicar", "publico", "publicacion", "soy dueno", "soy propietario", "inmobiliaria"])) {
    return {
      text: "Para publicar un alquiler, iniciá sesión con una cuenta de propietario. Desde el panel podés cargar y administrar tus publicaciones.",
      actions: [
        { label: "Acceder o registrarme", to: "/login-and-registration" },
        { label: "Panel de propietario", to: "/panel-dueno" },
      ],
    };
  }

  if (contieneAlguno(texto, ["favorito", "guardado"])) {
    return {
      text: role === "owner"
        ? "Los favoritos se guardan desde una cuenta de estudiante. Desde tu panel de propietario podés gestionar publicaciones y documentos."
        : "Las cuentas de estudiante pueden guardar alquileres como favoritos y consultarlos desde su panel.",
      actions: role === "owner"
        ? [{ label: "Panel de propietario", to: "/panel-dueno" }]
        : [
            { label: "Ver mis favoritos", to: "/alquileres?favoritos=true" },
            { label: "Panel de estudiante", to: "/panel-estudiante" },
          ],
    };
  }

  if (contieneAlguno(texto, ["mapa del delito", "delito", "seguridad"])) {
    return {
      text: "Podés consultar el mapa del delito y las recomendaciones para evaluar una zona antes de coordinar una visita.",
      actions: [
        { label: "Mapa del delito", to: "/mapa-del-delito" },
        { label: "Consejos de seguridad", to: "/consejos-seguridad" },
      ],
    };
  }

  if (contieneAlguno(texto, ["mapa", "ubicacion", "zona"])) {
    return {
      text: "El mapa muestra alquileres y puntos de interés para ayudarte a explorar las ubicaciones.",
      actions: [{ label: "Abrir el mapa", to: "/mapa" }],
    };
  }

  if (contieneAlguno(texto, ["institucion", "universidad", "unaf"])) {
    return {
      text: "Podés ver las instituciones educativas y explorar alquileres cercanos desde el mapa.",
      actions: [{ label: "Ver instituciones", to: "/instituciones" }],
    };
  }

  if (contieneAlguno(texto, ["hola", "buen dia", "buenas", "gracias"])) {
    return {
      text: "¡Estoy para ayudarte! Preguntame cómo buscar, publicar o usar alguna sección de la aplicación.",
      actions: [{ label: "Ver alquileres", to: "/alquileres" }],
    };
  }

  return {
    text: "Todavía no tengo una respuesta para esa consulta. Puedo ayudarte con alquileres, filtros, cuentas, la Guía Asistida, mapas o seguridad; también podés contactar al equipo.",
    actions: [
      { label: "Ver alquileres", to: "/alquileres" },
      { label: "Contactar desarrollo", href: DEVELOPERS_EMAIL },
    ],
  };
}

function normalizarMensajes(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (message) =>
        message &&
        typeof message.id === "string" &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.text === "string",
    )
    .map((message) => ({
      id: message.id,
      role: message.role,
      text: message.text,
      actions: Array.isArray(message.actions)
        ? message.actions.filter(
            (action) =>
              action &&
              typeof action.label === "string" &&
              (esRutaSegura(action.to) ||
                action.href === DEVELOPERS_EMAIL),
          )
        : [],
    }))
    .slice(-MAX_MESSAGES);
}

export default function AppAssistant() {
  const { usuario } = useAuth();
  const role = usuario?.role;
  const storageKey = `${STORAGE_KEY}-${role || "guest"}`;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [nuevoSaludo(role)]);
  const [draft, setDraft] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [storageReady, setStorageReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [storageError, setStorageError] = useState("");
  const messagesEndRef = useRef(null);
  const previousRole = useRef(role);

  useEffect(() => {
    if (previousRole.current === role) return;
    previousRole.current = role;
    setMessages([nuevoSaludo(role)]);
    setExpiresAt(null);
  }, [role]);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    window.addEventListener("app-assistant:open", openAssistant);
    return () => window.removeEventListener("app-assistant:open", openAssistant);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        let history;
        try {
          history = JSON.parse(saved);
        } catch {
          window.localStorage.removeItem(storageKey);
          setStorageError("No se pudo leer el historial anterior; inicié uno nuevo.");
        }

        if (history && Number(history.expiresAt) > Date.now()) {
          const restoredMessages = normalizarMensajes(history.messages);
          if (restoredMessages.length > 0) {
            setMessages(restoredMessages);
            setExpiresAt(Number(history.expiresAt));
          } else {
            window.localStorage.removeItem(storageKey);
          }
        } else if (history) {
          window.localStorage.removeItem(storageKey);
        }
      }
    } catch {
      setStorageAvailable(false);
      setStorageError("No se pudo acceder al almacenamiento local del chat.");
    } finally {
      setStorageReady(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageReady || !storageAvailable) return;
    try {
      if (expiresAt == null) {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ messages, expiresAt }),
        );
      }
    } catch {
      setStorageAvailable(false);
      setStorageError("No se pudo guardar el historial de esta conversación.");
    }
  }, [expiresAt, messages, storageAvailable, storageKey, storageReady]);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      setMessages([nuevoSaludo(role)]);
      setExpiresAt(null);
      return undefined;
    }
    const timeout = window.setTimeout(() => {
      setMessages([nuevoSaludo(role)]);
      setExpiresAt(null);
    }, remaining);
    return () => window.clearTimeout(timeout);
  }, [expiresAt, role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const enviarConsulta = (consulta) => {
    const text = consulta.trim();
    if (!text) return;
    const timestamp = Date.now();
    const response = responderConsulta(text, role);
    const nextMessages = [
      ...messages,
      { id: `user-${timestamp}`, role: "user", text },
      {
        id: `assistant-${timestamp}`,
        role: "assistant",
        text: response.text,
        actions: response.actions,
      },
    ].slice(-MAX_MESSAGES);
    setMessages(nextMessages);
    setExpiresAt(timestamp + HISTORY_TTL_MS);
    setDraft("");
  };

  const activarAccion = (action) => {
    if (action.to && esRutaSegura(action.to)) {
      navigate(action.to);
      setOpen(false);
    }
  };

  const iniciarConversacion = () => {
    setMessages([nuevoSaludo(role)]);
    setExpiresAt(null);
  };

  return (
    <div className="app-assistant">
      {open && (
        <section
          className="app-assistant__panel"
          id="app-assistant-panel"
          role="dialog"
          aria-label="Asistente de ayuda de Alquileres Formosa"
          aria-modal="false"
        >
          <header className="app-assistant__header">
            <div>
              <strong>{role === "owner" ? "Asistente para propietarios" : role === "student" ? "Asistente para estudiantes" : "Asistente de ayuda"}</strong>
              <span>Respuestas sobre la aplicación · historial por 1 hora</span>
            </div>
            <div className="app-assistant__header-actions">
              <button
                type="button"
                className="app-assistant__new"
                onClick={iniciarConversacion}
                aria-label="Iniciar una conversación nueva"
                title="Nueva conversación"
              >
                ↻
              </button>
              <button
                type="button"
                className="app-assistant__close"
                onClick={() => setOpen(false)}
                aria-label="Cerrar asistente"
              >
                ×
              </button>
            </div>
          </header>

          <div className="app-assistant__messages" aria-live="polite">
            {messages.map((message) => (
              <article
                className={`app-assistant__message app-assistant__message--${message.role}`}
                key={message.id}
                aria-label={message.role === "user" ? "Tu mensaje" : "Respuesta del asistente"}
              >
                <p>{message.text}</p>
                {message.actions?.length > 0 && (
                  <div className="app-assistant__actions">
                    {message.actions.map((action) =>
                      action.to && esRutaSegura(action.to) ? (
                        <button
                          key={`${message.id}-${action.label}`}
                          type="button"
                          className="app-assistant__action"
                          onClick={() => activarAccion(action)}
                        >
                          {action.label}
                        </button>
                      ) : action.href === DEVELOPERS_EMAIL ? (
                        <a
                          key={`${message.id}-${action.label}`}
                          className="app-assistant__action"
                          href={DEVELOPERS_EMAIL}
                        >
                          {action.label}
                        </a>
                      ) : null,
                    )}
                  </div>
                )}
              </article>
            ))}
            {messages.length === 1 && role === "owner" && (
              <div className="app-assistant__suggestions" aria-label="Preguntas sugeridas para propietarios">
                {[
                  "Como publico una propiedad?",
                  "Como cargo la garantia?",
                  "Como respondo solicitudes de garantia?",
                ].map((suggestion) => (
                  <button type="button" key={suggestion} onClick={() => enviarConsulta(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {messages.length === 1 && role === "student" && (
              <div className="app-assistant__suggestions" aria-label="Preguntas sugeridas para estudiantes">
                {[
                  "Donde veo mis favoritos?",
                  "Como entro a Mi alquiler?",
                  "Que consejos de seguridad hay?",
                ].map((suggestion) => (
                  <button type="button" key={suggestion} onClick={() => enviarConsulta(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {messages.length === 1 && !role && (
              <div className="app-assistant__suggestions" aria-label="Preguntas sugeridas">
                {[
                  "¿Cómo busco un alquiler?",
                  "¿Cómo solicito la garantía?",
                  "¿Cómo registro un pago?",
                ].map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => enviarConsulta(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {storageError && (
            <p className="app-assistant__storage-error" role="status">
              {storageError}
            </p>
          )}

          <form
            className="app-assistant__form"
            onSubmit={(event) => {
              event.preventDefault();
              enviarConsulta(draft);
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escribí tu consulta"
              aria-label="Escribí tu consulta"
              maxLength={500}
            />
            <button type="submit" disabled={!draft.trim()} aria-label="Enviar consulta">
              Enviar
            </button>
          </form>
        </section>
      )}

      <button
        className="app-assistant__launcher"
        type="button"
        aria-label={open ? "Cerrar asistente de ayuda" : "Abrir asistente de ayuda"}
        aria-controls="app-assistant-panel"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <span aria-hidden="true">×</span>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 5.75A2.75 2.75 0 0 1 6.75 3h10.5A2.75 2.75 0 0 1 20 5.75v7.5A2.75 2.75 0 0 1 17.25 16H11l-4.5 4v-4.15A2.75 2.75 0 0 1 4 13.25z" />
            <path d="M8 8h8M8 11.5h5" />
          </svg>
        )}
      </button>
    </div>
  );
}
