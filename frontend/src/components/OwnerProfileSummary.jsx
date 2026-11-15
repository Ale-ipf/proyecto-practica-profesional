import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiRequestError } from "../api/client.js";
import {
  guardarValoracionPropiedad,
  obtenerResumenDuenio,
} from "../api/property-reviews.js";

const estrellas = (rating) =>
  rating ? `${"★".repeat(Math.round(rating))}${"☆".repeat(5 - Math.round(rating))}` : "☆☆☆☆☆";

const formatDate = (value) =>
  new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(value));

export default function OwnerProfileSummary({ propertyId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await obtenerResumenDuenio(propertyId);
      setSummary(data);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos cargar el perfil del propietario.",
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const currentPublication = summary?.publications.find(
    (publication) => Number(publication.id) === Number(propertyId),
  );

  useEffect(() => {
    setRating(String(currentPublication?.myReview?.rating || 5));
    setComment(currentPublication?.myReview?.comment || "");
  }, [currentPublication]);

  const submitReview = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await guardarValoracionPropiedad(propertyId, {
        rating: Number(rating),
        comment: comment.trim(),
      });
      setMessage(data.message);
      await loadSummary();
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos guardar tu valoración.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <aside className="contact-owner-panel owner-profile-summary">
        <p className="muted">Cargando perfil del propietario…</p>
      </aside>
    );
  }

  if (error && !summary) {
    return (
      <aside className="contact-owner-panel owner-profile-summary">
        <p className="error-message" role="alert">{error}</p>
        <button className="button button-accent" type="button" onClick={loadSummary}>
          Reintentar
        </button>
      </aside>
    );
  }

  if (!summary) return null;

  const { owner, rating: ownerRating, publications, publicationsCount } = summary;

  return (
    <aside className="contact-owner-panel owner-profile-summary">
      <span className="section-kicker">PERFIL DEL PROPIETARIO</span>
      <div className="owner-profile-summary__heading">
        <h2>{owner.name}</h2>
        <span className={`owner-profile-summary__badge ${owner.verified ? "is-verified" : ""}`}>
          {owner.verified ? "✓ Perfil verificado" : "Perfil pendiente de verificación"}
        </span>
      </div>

      <dl className="owner-profile-summary__details">
        <div><dt>Nombre</dt><dd>{owner.firstName || "No informado"}</dd></div>
        <div><dt>Apellido</dt><dd>{owner.lastName || "No informado"}</dd></div>
        <div><dt>DNI</dt><dd>{owner.dniMasked || "No informado"}</dd></div>
        <div><dt>Correo</dt><dd><a href={`mailto:${owner.email}`}>{owner.email}</a></dd></div>
      </dl>

      <div className="owner-profile-summary__stats">
        <div>
          <strong>{publicationsCount}</strong>
          <span>publicaciones</span>
        </div>
        <div>
          <strong>{ownerRating.average ?? "—"}</strong>
          <span>{ownerRating.count ? `${estrellas(ownerRating.average)} · ${ownerRating.count} valoraciones` : "Sin valoraciones"}</span>
        </div>
      </div>

      <section className="owner-profile-summary__publications">
        <h3>Valoraciones de sus publicaciones</h3>
        {publications.map((publication) => (
          <details className="owner-publication-rating" key={publication.id}>
            <summary>
              <span>{publication.title}</span>
              <strong>
                {publication.rating.average ?? "—"} / 5
                <small>{publication.rating.count} valoraciones</small>
              </strong>
            </summary>
            <Link to={`/alquileres/${publication.id}`}>Ver publicación</Link>
            {publication.reviews.length > 0 ? (
              <ul>
                {publication.reviews.map((review) => (
                  <li key={review.id}>
                    <span className="owner-publication-rating__review-heading">
                      <strong>{review.author}</strong>
                      <span>{estrellas(review.rating)} · {formatDate(review.createdAt)}</span>
                    </span>
                    <p>{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small-text">Todavía no tiene valoraciones.</p>
            )}
          </details>
        ))}
      </section>

      <form className="owner-profile-review-form" onSubmit={submitReview}>
        <h3>{currentPublication?.myReview ? "Actualizá tu valoración" : "Dejá tu valoración"}</h3>
        <label>
          Puntuación
          <select value={rating} onChange={(event) => setRating(event.target.value)}>
            <option value="5">5 — Excelente</option>
            <option value="4">4 — Muy bueno</option>
            <option value="3">3 — Bueno</option>
            <option value="2">2 — Regular</option>
            <option value="1">1 — Puede mejorar</option>
          </select>
        </label>
        <label>
          Comentario sobre esta publicación
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={3}
            required
          />
        </label>
        {error && <p className="error-message" role="alert">{error}</p>}
        {message && <p className="owner-profile-success" role="status">{message}</p>}
        <button className="button button-primary" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Publicar valoración"}
        </button>
      </form>
    </aside>
  );
}
