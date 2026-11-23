import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { listarMensajesDelForo, publicarMensajeEnForo } from "../api/property-forum.js";
import { obtenerPropiedad } from "../api/properties.js";
import { useAuth } from "../context/useAuth.js";

const CATEGORIAS = [
  { value: "notice", label: "Aviso" },
  { value: "announcement", label: "Anuncio" },
  { value: "issue", label: "Problema" },
  { value: "general", label: "General" },
];

const etiquetasCategoria = Object.fromEntries(
  CATEGORIAS.map(({ value, label }) => [value, label]),
);

const formatDate = (value) =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function PropertyForumPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [property, setProperty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMessages = useCallback(async () => {
    const data = await listarMensajesDelForo(id);
    setMessages(data.messages || []);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    Promise.all([obtenerPropiedad(id), listarMensajesDelForo(id)])
      .then(([propertyData, forumData]) => {
        if (cancelled) return;
        setProperty(propertyData.property);
        setMessages(forumData.messages || []);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setLoadError(requestError.message || "No pudimos cargar el foro del alquiler.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (loading || loadError || !property) return undefined;

    const intervalId = window.setInterval(() => {
      loadMessages().catch((requestError) => {
        setLoadError(requestError.message || "No pudimos actualizar el foro.");
      });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [loadError, loadMessages, loading, property]);

  if (!usuario) return <Navigate to="/login" replace />;
  if (!["student", "owner"].includes(usuario.role)) {
    return <Navigate to="/" replace />;
  }

  const backLink = usuario.role === "owner"
    ? "/panel-dueno"
    : "/panel-estudiante?section=profile";
  const backLabel = usuario.role === "owner" ? "Volver al panel" : "Volver a mi perfil";

  const submitMessage = async (event) => {
    event.preventDefault();
    setPublishing(true);
    setActionError("");
    setSuccess("");

    try {
      const data = await publicarMensajeEnForo(id, { category, content });
      setMessages((current) => [...current, data.forumMessage]);
      setContent("");
      setSuccess(data.message);
    } catch (requestError) {
      setActionError(requestError.message || "No pudimos publicar el mensaje.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">Alquileres Formosa</Link>
        <Link className="button button-accent" to={backLink}>{backLabel}</Link>
      </header>
      <main className="property-forum">
        <span className="section-kicker">ESPACIO COMPARTIDO DEL ALQUILER</span>
        <h1>{loading ? "Cargando foro…" : property?.title || "Foro del alquiler"}</h1>
        {property && <p className="muted">{property.address}, {property.city}</p>}

        {loading && <p className="student-profile-status">Cargando mensajes…</p>}
        {!loading && loadError && (
          <div className="student-profile-message is-error" role="alert">
            {loadError}
            {loadError.includes("personas agregadas") && (
              <p>Si te agregaron recientemente, actualizá el perfil e intentá de nuevo.</p>
            )}
          </div>
        )}

        {!loading && property && !loadError && (
          <>
            <section className="property-forum-composer">
              <h2>Compartí algo importante</h2>
              <p>
                Los estudiantes agregados y el propietario pueden ver y responder
                publicando en este espacio.
              </p>
              <form onSubmit={submitMessage}>
                <label>
                  Tipo de publicación
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    {CATEGORIAS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Mensaje
                  <textarea
                    value={content}
                    maxLength={2000}
                    rows={4}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Escribí avisos, anuncios, problemas o novedades…"
                    required
                  />
                </label>
                <div className="property-forum-composer-actions">
                  <small>{content.length}/2000 caracteres</small>
                  <button className="button button-primary" type="submit" disabled={publishing}>
                    {publishing ? "Publicando…" : "Publicar en el foro"}
                  </button>
                </div>
              </form>
              {success && <p className="student-profile-message is-success" role="status">{success}</p>}
              {actionError && <p className="student-profile-message is-error" role="alert">{actionError}</p>}
            </section>

            <section className="property-forum-feed" aria-labelledby="forum-messages-heading">
              <div className="property-forum-feed-heading">
                <div>
                  <h2 id="forum-messages-heading">Avisos y conversación</h2>
                  <p>Las novedades se actualizan automáticamente.</p>
                </div>
                <span>{messages.length} {messages.length === 1 ? "publicación" : "publicaciones"}</span>
              </div>
              {messages.length === 0 ? (
                <div className="student-rentals-empty">
                  <h3>El foro está listo</h3>
                  <p>Cuando alguien publique un aviso o una novedad, va a aparecer acá.</p>
                </div>
              ) : (
                <div className="property-forum-messages">
                  {messages.map((message) => (
                    <article
                      className={`property-forum-message property-forum-message--${message.category}`}
                      key={message.id}
                    >
                      <div className="property-forum-message-heading">
                        <span className={`property-forum-category property-forum-category--${message.category}`}>
                          {etiquetasCategoria[message.category] || "General"}
                        </span>
                        <time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
                      </div>
                      <p>{message.content}</p>
                      <small>
                        {message.author?.name || "Usuario"}
                        {message.author?.role === "owner" ? " · Propietario" : " · Estudiante"}
                      </small>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
