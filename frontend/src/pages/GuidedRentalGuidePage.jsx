import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { listarInstituciones, normalizarInstituciones } from "../api/institutions.js";
import { listarPropiedades } from "../api/properties.js";
import { obtenerResumenDuenio } from "../api/property-reviews.js";
import { useAuth } from "../context/AuthContext.jsx";

const TRANSPORTS = [
  { id: "walk", label: "A pie", idealDistanceKm: 1.5, maxDistanceKm: 3 },
  { id: "bike", label: "Bicicleta", idealDistanceKm: 4, maxDistanceKm: 8 },
  { id: "bus", label: "Colectivo", idealDistanceKm: 8, maxDistanceKm: 16 },
  { id: "vehicle", label: "Auto o moto", idealDistanceKm: 15, maxDistanceKm: 30 },
];

const STEPS = [
  "Instituto",
  "Transporte",
  "Amoblamiento",
  "Presupuesto",
  "Ambientes",
];

const INITIAL_ANSWERS = {
  institutionId: "",
  transport: "",
  furnished: "",
  maxPrice: "",
  bedrooms: "",
};

function coordinatesOf(value) {
  if (value?.coordenadas?.length === 2) {
    const coordinates = value.coordenadas.map(Number);
    return coordinates.every(Number.isFinite) ? coordinates : null;
  }
  if (value?.latitude == null || value?.longitude == null) return null;
  const coordinates = [Number(value.latitude), Number(value.longitude)];
  return coordinates.every(Number.isFinite) ? coordinates : null;
}

function distanceInKm(first, second) {
  const [lat1, lon1] = first;
  const [lat2, lon2] = second;
  const earthRadiusKm = 6371;
  const latitudeDelta = ((lat2 - lat1) * Math.PI) / 180;
  const longitudeDelta = ((lon2 - lon1) * Math.PI) / 180;
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function nearestBusStopDistance(propertyCoordinates, busStops) {
  if (!propertyCoordinates || busStops.length === 0) return null;
  return busStops.reduce((nearest, stop) => {
    const distance = distanceInKm(propertyCoordinates, stop.coordenadas);
    return distance < nearest ? distance : nearest;
  }, Number.POSITIVE_INFINITY);
}

function withinTravelLimit(property, answers, institution) {
  if (!institution) return true;

  const propertyCoordinates = coordinatesOf(property);
  const institutionCoordinates = coordinatesOf(institution);
  const transport = TRANSPORTS.find((item) => item.id === answers.transport);
  if (!propertyCoordinates || !institutionCoordinates || !transport) return false;

  return (
    distanceInKm(propertyCoordinates, institutionCoordinates) <=
    transport.maxDistanceKm
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function makeRecommendation(property, answers, institution, busStops) {
  const price = Number(property.price);
  const bedrooms = Number(property.bedrooms) || 1;
  const isFurnished = Boolean(property.is_furnished);
  const propertyCoordinates = coordinatesOf(property);
  const institutionCoordinates = coordinatesOf(institution);
  const distanceToInstitution =
    propertyCoordinates && institutionCoordinates
      ? distanceInKm(propertyCoordinates, institutionCoordinates)
      : null;
  const distanceToBusStop =
    answers.transport === "bus"
      ? nearestBusStopDistance(propertyCoordinates, busStops)
      : null;
  const transport = TRANSPORTS.find((item) => item.id === answers.transport);
  const pros = [];
  const cons = [];
  let score = 0;
  let maxScore = 0;

  maxScore += 25;
  score += 25 * (1 - (price / Number(answers.maxPrice)) * 0.35);
  pros.push(`El precio de ${formatPrice(price)} está dentro de tu presupuesto.`);

  maxScore += 20;
  score += bedrooms === Number(answers.bedrooms) ? 20 : 15;
  pros.push(
    bedrooms === Number(answers.bedrooms)
      ? `Tiene los ${bedrooms} ambientes que buscás.`
      : `Tiene ${bedrooms} ambientes, más que el mínimo que pediste.`,
  );

  if (answers.furnished === "yes") {
    maxScore += 15;
    score += 15;
    pros.push("Se publica amoblado, como preferís.");
  } else if (answers.furnished === "no") {
    maxScore += 15;
    score += isFurnished ? 7 : 15;
    if (isFurnished) {
      cons.push("Está amoblado, aunque preferís una opción sin muebles.");
    } else {
      pros.push("Se publica sin amoblar, como preferís.");
    }
  } else {
    maxScore += 10;
    score += 10;
    pros.push(
      isFurnished
        ? "Está amoblado y no marcaste una preferencia de amoblamiento."
        : "No tiene muebles, y no marcaste una preferencia de amoblamiento.",
    );
  }

  if (institution && transport && distanceToInstitution != null) {
    maxScore += 35;
    score +=
      35 *
      Math.max(
        0,
        1 - distanceToInstitution / (transport.idealDistanceKm * 2),
      );
    if (distanceToInstitution <= transport.idealDistanceKm) {
      pros.push(
        `Queda a ${distanceToInstitution.toFixed(1)} km en línea recta de ${institution.name}, una distancia razonable para ir ${transport.label.toLowerCase()}.`,
      );
    } else {
      cons.push(
        `Está a ${distanceToInstitution.toFixed(1)} km en línea recta de ${institution.name}; el viaje puede ser largo para ir ${transport.label.toLowerCase()}.`,
      );
    }
  } else if (institution) {
    cons.push("No hay coordenadas suficientes para calcular la distancia al instituto.");
  }

  if (answers.transport === "bus") {
    if (distanceToBusStop != null && Number.isFinite(distanceToBusStop)) {
      maxScore += 10;
      score += 10 * Math.max(0, 1 - distanceToBusStop / 2);
      if (distanceToBusStop <= 1) {
        pros.push(
          `Hay una parada registrada a ${distanceToBusStop.toFixed(1)} km de la propiedad.`,
        );
      } else {
        cons.push(
          `La parada registrada más cercana queda a ${distanceToBusStop.toFixed(1)} km.`,
        );
      }
    } else {
      cons.push("No hay paradas de colectivo registradas cerca de esta propiedad.");
    }
  }

  if (cons.length === 0) {
    cons.push("Confirmá con el dueño los servicios y costos adicionales antes de avanzar.");
  }

  const why = [
    `Se ajusta al presupuesto de hasta ${formatPrice(answers.maxPrice)}.`,
    `Cumple con el mínimo de ${answers.bedrooms} ambiente${Number(answers.bedrooms) === 1 ? "" : "s"}.`,
    institution && distanceToInstitution != null
      ? `La distancia estimada al instituto es ${distanceToInstitution.toFixed(1)} km.`
      : "Como omitiste el instituto, no se ponderó la distancia al lugar de estudio.",
  ].join(" ");

  return {
    ...property,
    price,
    bedrooms,
    rating: maxScore ? Math.round((score / maxScore) * 100) : 0,
    why,
    pros,
    cons,
    distanceToInstitution,
    distanceToBusStop,
  };
}

export default function GuidedRentalGuidePage() {
  const { usuario } = useAuth();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [institutionError, setInstitutionError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [resultsReady, setResultsReady] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [ownerContact, setOwnerContact] = useState({
    loading: false,
    email: "",
    error: "",
  });

  useEffect(() => {
    let cancelled = false;
    listarInstituciones()
      .then((data) => {
        if (!cancelled) {
          setInstitutions(normalizarInstituciones(data.institutions || []));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setInstitutionError(
            error.message || "No pudimos cargar las instituciones.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingInstitutions(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedInstitution =
    institutions.find(
      (institution) => String(institution.id) === answers.institutionId,
    ) || null;
  const busStops = useMemo(
    () =>
      institutions.flatMap((institution) =>
        institution.busStops
          .filter((stop) => coordinatesOf(stop))
          .map((stop) => ({
            ...stop,
            coordenadas: coordinatesOf(stop),
          })),
      ),
    [institutions],
  );
  const selectedRecommendation =
    recommendations.find(
      (property) => Number(property.id) === Number(selectedPropertyId),
    ) || recommendations[0] || null;

  useEffect(() => {
    if (!modalOpen || !selectedRecommendation) return undefined;
    let cancelled = false;
    setOwnerContact({ loading: true, email: "", error: "" });
    obtenerResumenDuenio(selectedRecommendation.id)
      .then((data) => {
        if (!cancelled) {
          setOwnerContact({
            loading: false,
            email: data.owner.email || "",
            error: "",
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setOwnerContact({
            loading: false,
            email: "",
            error: error.message || "No pudimos cargar el contacto del dueño.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [modalOpen, selectedRecommendation]);

  if (!usuario || usuario.role !== "student") {
    return <Navigate to="/login-and-registration" replace />;
  }

  const actualizarRespuesta = (event) => {
    setAnswers((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const calcularRecomendaciones = async () => {
    setLoadingRecommendations(true);
    setRecommendationError("");
    try {
      const firstPage = await listarPropiedades({
        status: "available",
        page: 1,
        limit: 100,
      });
      const remainingPages = await Promise.all(
        Array.from(
          { length: Math.max(0, firstPage.pagination.totalPages - 1) },
          (_, index) =>
            listarPropiedades({
              status: "available",
              page: index + 2,
              limit: 100,
            }),
        ),
      );
      const properties = [
        ...(firstPage.properties || []),
        ...remainingPages.flatMap((page) => page.properties || []),
      ];
      const candidates = properties
        .filter((property) => Number(property.price) <= Number(answers.maxPrice))
        .filter(
          (property) =>
            (Number(property.bedrooms) || 1) >= Number(answers.bedrooms),
        )
        .filter((property) =>
          withinTravelLimit(property, answers, selectedInstitution),
        )
        .filter(
          (property) =>
            answers.furnished === "any" ||
            Boolean(property.is_furnished) === (answers.furnished === "yes"),
        )
        .map((property) =>
          makeRecommendation(property, answers, selectedInstitution, busStops),
        )
        .sort((first, second) => second.rating - first.rating)
        .slice(0, 3);

      setRecommendations(candidates);
      setResultsReady(true);
      setSelectedPropertyId(candidates[0]?.id ?? null);
      setModalOpen(candidates.length > 0);
    } catch (error) {
      setRecommendationError(
        error.message || "No pudimos calcular tus recomendaciones.",
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const avanzar = () => {
    if (step === 5) {
      calcularRecomendaciones();
      return;
    }
    setStep((current) => Math.min(current + 1, 5));
  };

  const nearestStop = selectedRecommendation?.distanceToBusStop;

  return (
    <main className="guided-guide-page">
      <header className="guided-guide-header">
        <Link className="brand-title" to="/">Alquileres Formosa</Link>
        <Link className="button button-accent" to="/alquileres">Ver todos los alquileres</Link>
      </header>

      <section className="guided-guide-intro">
        <span className="section-kicker">GUÍA ASISTIDA</span>
        <h1>Encontrá un alquiler que se adapte a vos.</h1>
        <p>
          Respondé cinco preguntas simples. Vamos a comparar presupuesto,
          ambientes, amoblamiento y cercanía para sugerirte hasta tres opciones.
        </p>
      </section>

      {!resultsReady ? (
        <section className="guided-guide-card" aria-labelledby="guided-step-title">
          <div className="guided-guide-progress">
            <div className="guided-guide-progress__labels">
              <span>Paso {step} de 5</span>
              <span>{STEPS[step - 1]}</span>
            </div>
            <div
              className="guided-guide-progress__track"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={5}
              aria-valuenow={step}
              aria-label={`Paso ${step} de 5`}
            >
              <span style={{ width: `${(step / 5) * 100}%` }} />
            </div>
          </div>

          {step === 1 && (
            <div className="guided-guide-question">
              <h2 id="guided-step-title">¿En qué instituto querés estudiar?</h2>
              <p>Lo usamos para estimar la distancia entre el alquiler y tus estudios.</p>
              {loadingInstitutions ? (
                <p className="muted">Cargando instituciones…</p>
              ) : (
                <label>
                  Instituto
                  <select
                    name="institutionId"
                    value={answers.institutionId}
                    onChange={actualizarRespuesta}
                  >
                    <option value="">Seleccioná una institución</option>
                    {institutions.map((institution) => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {institutionError && (
                <p className="guided-guide-error" role="alert">{institutionError}</p>
              )}
              <button
                className="guided-guide-skip"
                type="button"
                onClick={() => {
                  setAnswers((current) => ({ ...current, institutionId: "" }));
                  setStep(2);
                }}
              >
                Omitir esta pregunta
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="guided-guide-question">
              <h2 id="guided-step-title">¿Cómo pensás llegar al instituto?</h2>
              <p>Así ponderamos la distancia y las paradas registradas cercanas.</p>
              <div className="guided-guide-choice-grid">
                {TRANSPORTS.map((transport) => (
                  <label className="guided-guide-choice" key={transport.id}>
                    <input
                      type="radio"
                      name="transport"
                      value={transport.id}
                      checked={answers.transport === transport.id}
                      onChange={actualizarRespuesta}
                    />
                    <span>{transport.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="guided-guide-question">
              <h2 id="guided-step-title">¿Cómo preferís el amoblamiento?</h2>
              <p>Elegí si necesitás muebles, preferís que no los tenga o te resulta indistinto.</p>
              <div className="guided-guide-choice-grid">
                {[
                  ["yes", "Amoblado"],
                  ["no", "Sin amoblar"],
                  ["any", "Me da igual"],
                ].map(([value, label]) => (
                  <label className="guided-guide-choice" key={value}>
                    <input
                      type="radio"
                      name="furnished"
                      value={value}
                      checked={answers.furnished === value}
                      onChange={actualizarRespuesta}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="guided-guide-question">
              <h2 id="guided-step-title">¿Cuál es tu presupuesto mensual máximo?</h2>
              <p>Solo recomendaremos publicaciones dentro del monto que indiques.</p>
              <label>
                Máximo por mes (ARS)
                <input
                  type="number"
                  name="maxPrice"
                  min="1"
                  step="1000"
                  value={answers.maxPrice}
                  onChange={actualizarRespuesta}
                  placeholder="Ej: 180000"
                  required
                />
              </label>
            </div>
          )}

          {step === 5 && (
            <div className="guided-guide-question">
              <h2 id="guided-step-title">¿Cuántos ambientes necesitás como mínimo?</h2>
              <p>Las opciones pueden tener más ambientes, pero no menos.</p>
              <div className="guided-guide-choice-grid">
                {[
                  ["1", "Monoambiente"],
                  ["2", "2 ambientes"],
                  ["3", "3 o más ambientes"],
                ].map(([value, label]) => (
                  <label className="guided-guide-choice" key={value}>
                    <input
                      type="radio"
                      name="bedrooms"
                      value={value}
                      checked={answers.bedrooms === value}
                      onChange={actualizarRespuesta}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {recommendationError && (
            <p className="guided-guide-error" role="alert">{recommendationError}</p>
          )}

          <footer className="guided-guide-actions">
            {step > 1 && (
              <button
                className="button button-accent"
                type="button"
                onClick={() => setStep((current) => Math.max(current - 1, 1))}
              >
                Volver
              </button>
            )}
            <button
              className="button button-primary"
              type="button"
              disabled={
                loadingRecommendations ||
                (step === 2 && !answers.transport) ||
                (step === 3 && !answers.furnished) ||
                (step === 4 && Number(answers.maxPrice) <= 0) ||
                (step === 5 && !answers.bedrooms)
              }
              onClick={avanzar}
            >
              {loadingRecommendations
                ? "Buscando opciones…"
                : step === 5
                  ? "Ver recomendaciones"
                  : "Continuar"}
            </button>
          </footer>
        </section>
      ) : (
        <section className="guided-guide-results">
          <div className="guided-guide-results__heading">
            <div>
              <span className="section-kicker">RECOMENDACIONES PERSONALIZADAS</span>
              <h2>Estas opciones coinciden con tus respuestas.</h2>
              <p className="muted">
                Se muestran hasta tres alquileres disponibles que cumplen tus filtros.
              </p>
            </div>
            <button
              className="button button-accent"
              type="button"
              onClick={() => {
                setRecommendations([]);
                setResultsReady(false);
                setModalOpen(false);
                setStep(1);
              }}
            >
              Cambiar respuestas
            </button>
          </div>

          {recommendations.map((property, index) => (
            <button
              className="guided-result-card"
              key={property.id}
              type="button"
              onClick={() => {
                setSelectedPropertyId(property.id);
                setModalOpen(true);
              }}
            >
              <span className="guided-result-card__rank">Opción {index + 1}</span>
              <strong>{property.title}</strong>
              <span>{formatPrice(property.price)} · {property.bedrooms} ambientes</span>
              <span>{property.rating}% de coincidencia</span>
            </button>
          ))}
          {recommendations.length === 0 && (
            <div className="guided-guide-empty">
              <h3>No encontramos opciones con todas tus respuestas.</h3>
              <p>Probá ampliar el presupuesto o reducir el mínimo de ambientes.</p>
              <button
                className="button button-primary"
                type="button"
                onClick={() => {
                  setRecommendations([]);
                  setResultsReady(false);
                  setStep(1);
                }}
              >
                Ajustar respuestas
              </button>
            </div>
          )}
        </section>
      )}

      {modalOpen && selectedRecommendation && (
        <div
          className="guided-modal-backdrop"
          role="presentation"
          onClick={() => setModalOpen(false)}
        >
          <section
            className="guided-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guided-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="guided-modal__header">
              <div>
                <span className="section-kicker">TUS 3 MEJORES OPCIONES</span>
                <h2 id="guided-modal-title">Elegí una recomendación</h2>
              </div>
              <button
                className="guided-modal__close"
                type="button"
                aria-label="Cerrar recomendaciones"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="guided-modal__content">
              <nav className="guided-modal-options" aria-label="Opciones recomendadas">
                {recommendations.map((property, index) => (
                  <button
                    className={`guided-modal-option ${Number(property.id) === Number(selectedRecommendation.id) ? "is-selected" : ""}`}
                    key={property.id}
                    type="button"
                    aria-pressed={Number(property.id) === Number(selectedRecommendation.id)}
                    onClick={() => setSelectedPropertyId(property.id)}
                  >
                    <span>Opción {index + 1} · {property.rating}% de coincidencia</span>
                    <strong>{property.title}</strong>
                    <span>{formatPrice(property.price)} · {property.bedrooms} ambientes</span>
                  </button>
                ))}
              </nav>

              <article className="guided-modal-detail">
                <span className="guided-modal-detail__price">
                  {formatPrice(selectedRecommendation.price)} / mes
                </span>
                <h3>{selectedRecommendation.title}</h3>
                <p>
                  {selectedRecommendation.city} · {selectedRecommendation.address}
                </p>
                <p>
                  {selectedRecommendation.bedrooms} ambientes ·{" "}
                  {selectedRecommendation.is_furnished ? "Amoblado" : "Sin amoblar"}
                </p>
                {selectedRecommendation.distanceToInstitution != null && selectedInstitution && (
                  <p>
                    A {selectedRecommendation.distanceToInstitution.toFixed(1)} km en línea recta de{" "}
                    {selectedInstitution.name}.
                  </p>
                )}
                {answers.transport === "bus" && nearestStop != null && Number.isFinite(nearestStop) && (
                  <p>Parada registrada más cercana: {nearestStop.toFixed(1)} km.</p>
                )}
                <p className="guided-modal-detail__distance-note">
                  Las distancias son aproximadas en línea recta; verificá recorrido y horarios antes de decidir.
                </p>

                <h4>¿Por qué es buena opción?</h4>
                <p>{selectedRecommendation.why}</p>

                <div className="guided-modal-pros-cons">
                  <section>
                    <h4>Pros</h4>
                    <ul>
                      {selectedRecommendation.pros.map((pro) => <li key={pro}>{pro}</li>)}
                    </ul>
                  </section>
                  <section>
                    <h4>Contras a considerar</h4>
                    <ul>
                      {selectedRecommendation.cons.map((con) => <li key={con}>{con}</li>)}
                    </ul>
                  </section>
                </div>

                {ownerContact.error && (
                  <p className="guided-guide-error" role="alert">{ownerContact.error}</p>
                )}
                <div className="guided-modal-actions">
                  <Link
                    className="button button-accent"
                    to={`/alquileres/${selectedRecommendation.id}`}
                  >
                    Ver publicación original
                  </Link>
                  {ownerContact.loading ? (
                    <button className="button button-primary" type="button" disabled>
                      Cargando contacto…
                    </button>
                  ) : ownerContact.email ? (
                    <a
                      className="button button-primary"
                      href={`mailto:${ownerContact.email}?subject=${encodeURIComponent(`Consulta por ${selectedRecommendation.title}`)}`}
                    >
                      Contactar al dueño
                    </a>
                  ) : (
                    <button className="button button-primary" type="button" disabled>
                      Contacto no disponible
                    </button>
                  )}
                </div>
              </article>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
