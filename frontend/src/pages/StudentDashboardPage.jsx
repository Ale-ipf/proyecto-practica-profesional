import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import DashboardLayout, {
  DashboardPropertyCard,
  DashboardSection,
  QuickAccessCard,
  UserProfileCard,
} from "../components/DashboardLayout.jsx";
import { STUDENT_NAVIGATION } from "../components/dashboardNavigation.js";
import { useAuth } from "../context/useAuth.js";
import { listarPropiedades } from "../api/properties.js";
import { imagenHero } from "../data/appData.js";
import {
  obtenerMiPerfilEstudiante,
  listarMisAlquileres,
  actualizarMiPerfilEstudiante,
  solicitarVerificacionEmail,
  confirmarVerificacionEmail,
  solicitarVerificacionTelefono,
  confirmarVerificacionTelefono,
} from "../api/students.js";
import { ApiRequestError } from "../api/client.js";
import { useLocationSharing } from "../context/useLocationSharing.js";
import ThemeSetting from "../components/ThemeSetting.jsx";

const SECCIONES = [
  { id: "dashboard", label: "Mi panel" },
  { id: "profile", label: "Ajustes del perfil" },
  { id: "rentals", label: "Mis alquileres" },
  { id: "personal", label: "Datos personales" },
  { id: "app", label: "Ajustes de la app" },
  { id: "privacy", label: "Privacidad" },
];

function StudentRentalList({ rentals }) {
  return (
    <div className="student-rentals-list">
      {rentals.map((alquiler) => (
        <article className="student-rental-card" key={alquiler.id}>
          <div>
            <span className="section-kicker">PUBLICACIÓN COMPARTIDA</span>
            <h3><Link to={`/alquileres/${alquiler.id}`}>{alquiler.title}</Link></h3>
            <p>{[alquiler.address, alquiler.city].filter(Boolean).join(", ") || "Ubicación no informada"}</p>
            <small>Propietario: {alquiler.owner?.name || "No informado"}</small>
          </div>
          <div className="student-rental-card__actions">
            <Link className="button button-accent" to={`/alquileres/${alquiler.id}`}>Ver publicación</Link>
            <Link className="button button-primary" to={`/alquileres/${alquiler.id}/foro`}>Abrir foro</Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function StudentDashboardPage() {
  const { usuario, logout, actualizarUsuario } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedSection = searchParams.get("section");
  const seccionActiva = SECCIONES.some((item) => item.id === requestedSection)
    ? requestedSection
    : "dashboard";
  const {
    isSharing: compartirUbicacion,
    error: errorUbicacion,
    startSharing,
    stopSharing,
  } = useLocationSharing();
  const [perfil, setPerfil] = useState(null);
  const [propiedades, setPropiedades] = useState([]);
  const [errorPropiedades, setErrorPropiedades] = useState("");
  const [cargandoPropiedades, setCargandoPropiedades] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    biography: "",
    origin_city: "",
  });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [verificandoEmail, setVerificandoEmail] = useState(false);
  const [verificandoTelefono, setVerificandoTelefono] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [alquileres, setAlquileres] = useState([]);
  const [cargandoAlquileres, setCargandoAlquileres] = useState(false);
  const [errorAlquileres, setErrorAlquileres] = useState("");
  const [actualizacionAlquileres, setActualizacionAlquileres] = useState(0);

  const actualizarUsuarioLocal = useCallback(
    (datos) => {
      actualizarUsuario(datos);
      setPerfil((actual) =>
        actual
          ? { ...actual, user: { ...actual.user, ...datos } }
          : actual,
      );
    },
    [actualizarUsuario],
  );

  const cargarPerfil = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await obtenerMiPerfilEstudiante();
      setPerfil(data.student);
      const currentUser = data.student.user;
      const legacyName = (currentUser.name || "").trim().split(/\s+/);
      setForm({
        firstName: currentUser.firstName || legacyName.shift() || "",
        lastName: currentUser.lastName || legacyName.join(" "),
        username: currentUser.username || "",
        biography: data.student.biography || "",
        origin_city: data.student.origin_city || "",
      });
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos cargar tu perfil.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (usuario?.role !== "student") return undefined;
    cargarPerfil();
    return undefined;
  }, [cargarPerfil, usuario?.role]);

  useEffect(() => {
    let cancelado = false;
    listarPropiedades({ status: "available", page: 1, limit: 3 })
      .then((data) => {
        if (!cancelado) setPropiedades(data.properties);
      })
      .catch((requestError) => {
        if (!cancelado) {
          setErrorPropiedades(
            requestError instanceof ApiRequestError
              ? requestError.message
              : "No pudimos cargar los alquileres disponibles.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoPropiedades(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (usuario?.role !== "student") return undefined;
    if (seccionActiva !== "rentals" && seccionActiva !== "dashboard") return;

    let cancelado = false;
    setCargandoAlquileres(true);
    setErrorAlquileres("");
    listarMisAlquileres()
      .then((data) => {
        if (cancelado) return;
        setAlquileres(data.rentals || []);
      })
      .catch((requestError) => {
        if (!cancelado) {
          setErrorAlquileres(
            requestError.message || "No pudimos cargar tus alquileres.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoAlquileres(false);
      });

    return () => {
      cancelado = true;
    };
  }, [actualizacionAlquileres, seccionActiva, usuario?.role]);

  const actualizarCampo = (campo) => (event) =>
    setForm((current) => ({ ...current, [campo]: event.target.value }));

  const guardarPerfil = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setMensajeExito("");
    setError("");
    try {
      const data = await actualizarMiPerfilEstudiante({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim().toLowerCase(),
        biography: form.biography.trim(),
        origin_city: form.origin_city.trim(),
      });
      setPerfil(data.student);
      actualizarUsuario(data.student.user);
      setForm((current) => ({
        ...current,
        firstName: data.student.user.firstName || "",
        lastName: data.student.user.lastName || "",
        username: data.student.user.username || "",
        biography: data.student.biography || "",
        origin_city: data.student.origin_city || "",
      }));
      setModalEdicionAbierto(false);
      setMensajeExito("Perfil actualizado.");
      await cargarPerfil();
    } catch (requestError) {
      if (requestError instanceof ApiRequestError) {
        const fieldMessages = requestError.fieldErrors
          .map((fieldError) => fieldError.message)
          .filter(Boolean);
        setError(fieldMessages.length > 0 ? fieldMessages.join(" ") : requestError.message);
      } else {
        setError("No pudimos guardar los cambios.");
      }
    } finally {
      setGuardando(false);
    }
  };

  const enviarCodigoEmail = async (event) => {
    event?.preventDefault();
    setVerificandoEmail(true);
    setError("");
    setMensajeExito("");
    try {
      const data = await solicitarVerificacionEmail(email);
      setEmailCodeSent(true);
      setMensajeExito(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos enviar el código al correo.",
      );
    } finally {
      setVerificandoEmail(false);
    }
  };

  const verificarEmail = async (event) => {
    event.preventDefault();
    setVerificandoEmail(true);
    setError("");
    setMensajeExito("");
    try {
      const data = await confirmarVerificacionEmail(emailCode);
      actualizarUsuarioLocal(data.user);
      setEmail(data.user.email);
      setEmailCode("");
      setEmailCodeSent(false);
      setMensajeExito(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos verificar el correo.",
      );
    } finally {
      setVerificandoEmail(false);
    }
  };

  const enviarCodigoTelefono = async (event) => {
    event?.preventDefault();
    setVerificandoTelefono(true);
    setError("");
    setMensajeExito("");
    try {
      const data = await solicitarVerificacionTelefono(phone);
      setPhoneCodeSent(true);
      setMensajeExito(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos enviar el código al teléfono.",
      );
    } finally {
      setVerificandoTelefono(false);
    }
  };

  const verificarTelefono = async (event) => {
    event.preventDefault();
    setVerificandoTelefono(true);
    setError("");
    setMensajeExito("");
    try {
      const data = await confirmarVerificacionTelefono(phoneCode);
      actualizarUsuarioLocal(data.user);
      setPhone(data.user.phone);
      setPhoneCode("");
      setPhoneCodeSent(false);
      setMensajeExito(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos verificar el teléfono.",
      );
    } finally {
      setVerificandoTelefono(false);
    }
  };

  useEffect(() => {
    if (!modalEdicionAbierto) return undefined;

    const cerrarConEscape = (event) => {
      if (event.key === "Escape" && !guardando) {
        setModalEdicionAbierto(false);
      }
    };

    window.addEventListener("keydown", cerrarConEscape);
    return () => window.removeEventListener("keydown", cerrarConEscape);
  }, [guardando, modalEdicionAbierto]);

  const abrirEdicionPerfil = () => {
    const currentUser = perfil?.user || usuario;
    const legacyName = (currentUser.name || "").trim().split(/\s+/);
    setForm({
      firstName: currentUser.firstName || legacyName.shift() || "",
      lastName: currentUser.lastName || legacyName.join(" "),
      username: currentUser.username || "",
      biography: perfil?.biography || "",
      origin_city: perfil?.origin_city || "",
    });
    setError("");
    setModalEdicionAbierto(true);
  };

  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== "student") return <Navigate to="/panel-dueno" replace />;

  const seccion = SECCIONES.find((item) => item.id === seccionActiva);
  const usuarioPerfil = perfil?.user || usuario;

  return (
    <DashboardLayout
      user={usuarioPerfil}
      roleLabel="Cuenta de estudiante"
      navigation={STUDENT_NAVIGATION}
      activeKey={seccionActiva === "dashboard" ? "dashboard" : seccionActiva}
      onLogout={logout}
    >
      {seccionActiva === "dashboard" ? (
        <>
          <section className="dashboard-welcome">
            <img src={imagenHero} alt="" aria-hidden="true" />
            <div className="dashboard-welcome__content">
              <span className="dashboard-eyebrow">PANEL DEL ESTUDIANTE</span>
              <h1>¡Hola, {usuario.name || "estudiante"}!</h1>
              <p>Encontrá tu próximo hogar en Formosa y organizá tu búsqueda desde un solo lugar.</p>
            </div>
          </section>

          <DashboardSection eyebrow="EXPLORÁ LA PLATAFORMA" title="Accesos rápidos">
            <div className="dashboard-quick-grid">
              <QuickAccessCard
                to="/alquileres?favoritos=true"
                icon="star"
                title="Mis favoritos"
                description="Volvé a las propiedades que guardaste en este dispositivo."
              />
              {alquileres.length > 0 && (
                <QuickAccessCard
                  to="/panel-estudiante?section=rentals"
                  icon="building"
                  title="Mi alquiler"
                  description="Consultá el alquiler compartido y su espacio de comunicación."
                />
              )}
              <QuickAccessCard
                to="/guia-asistida"
                icon="guide"
                title="Guía asistida"
                description="Encontrá opciones según tus necesidades de estudio."
              />
              <QuickAccessCard
                to="/consejos-seguridad"
                icon="shield"
                title="Consejos de seguridad"
                description="Revisá recomendaciones para una búsqueda segura."
              />
            </div>
          </DashboardSection>

          {!cargandoAlquileres && !errorAlquileres && alquileres.length > 0 && (
          <DashboardSection
            eyebrow="TU ALQUILER"
            title="Mi alquiler"
            description="Encontrá la publicación compartida con vos y accedé a su espacio de comunicación."
          >
            {cargandoAlquileres && <p className="dashboard-message">Cargando tu alquiler…</p>}
            {!cargandoAlquileres && errorAlquileres && (
              <p className="dashboard-message is-error" role="alert">{errorAlquileres}</p>
            )}
            {!cargandoAlquileres && !errorAlquileres && alquileres.length === 0 && (
              <div className="student-rentals-empty">
                <h3>Todavía no tenés un alquiler compartido</h3>
                <p>Cuando el propietario te agregue a una publicación, aparecerá acá.</p>
                <Link className="button button-primary" to="/alquileres">Explorar alquileres</Link>
              </div>
            )}
            {!cargandoAlquileres && !errorAlquileres && alquileres.length > 0 && (
              <StudentRentalList rentals={alquileres} />
            )}
          </DashboardSection>
          )}

          <DashboardSection
            eyebrow="PUBLICACIONES RECIENTES"
            title="Alquileres disponibles"
            description="Propiedades publicadas en la plataforma."
            action={
              <Link className="dashboard-button dashboard-button--secondary" to="/alquileres">
                Ver todos
              </Link>
            }
          >
            {cargandoPropiedades && (
              <p className="dashboard-message">Cargando alquileres disponibles…</p>
            )}
            {!cargandoPropiedades && errorPropiedades && (
              <p className="dashboard-message is-error" role="alert">
                {errorPropiedades}
              </p>
            )}
            {!cargandoPropiedades && !errorPropiedades && propiedades.length === 0 && (
              <p className="dashboard-message">
                Todavía no hay alquileres disponibles para mostrar.
              </p>
            )}
            {!cargandoPropiedades && !errorPropiedades && propiedades.length > 0 && (
              <div className="dashboard-property-grid">
                {propiedades.map((propiedad) => (
                  <DashboardPropertyCard key={propiedad.id} property={propiedad} />
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection eyebrow="TU CUENTA" title="Perfil del estudiante">
            <div className="dashboard-profile-overview">
              <UserProfileCard user={usuarioPerfil} roleLabel="Estudiante" />
              <Link
                className="dashboard-button dashboard-button--primary"
                to="/panel-estudiante?section=profile"
              >
                Editar perfil
              </Link>
            </div>
          </DashboardSection>

          <DashboardSection eyebrow="RECOMENDACIONES" title="Antes de elegir">
            <div className="dashboard-info-card">
              <strong>Conocé la zona y verificá la información</strong>
              <p>
                Consultá la ubicación en el mapa, revisá los datos de la publicación
                y usá los consejos de seguridad antes de coordinar una visita.
              </p>
            </div>
          </DashboardSection>
        </>
      ) : (
      <div className="student-profile-page">
        <div className="student-profile-heading">
          <div>
            <span className="section-kicker">CUENTA DE ESTUDIANTE</span>
            <h1>{seccionActiva === "profile" ? "Mi perfil" : seccion.label}</h1>
            <p>Administrá tus datos, preferencias y privacidad.</p>
          </div>
          {seccionActiva !== "profile" && (
            <Link
              className="button button-accent"
              to="/panel-estudiante?section=profile"
            >
              Volver al perfil
            </Link>
          )}
        </div>

        <div className="student-profile-layout">
          <section
            className="student-profile-panel"
            aria-labelledby="student-profile-section-title"
          >
            <header className="student-profile-panel-heading">
              <h2 id="student-profile-section-title">{seccion.label}</h2>
              {seccionActiva === "profile" && (
                <p>Consultá y administrá los datos de tu perfil.</p>
              )}
              {seccionActiva === "rentals" && (
                <p>
                  Entrá al espacio compartido de los alquileres donde te agregaron.{" "}
                  <button
                    className="student-rentals-refresh"
                    type="button"
                    disabled={cargandoAlquileres}
                    onClick={() => setActualizacionAlquileres((actual) => actual + 1)}
                  >
                    {cargandoAlquileres ? "Actualizando…" : "Actualizar lista"}
                  </button>
                </p>
              )}
              {seccionActiva === "personal" && (
                <p>Información asociada a tu cuenta de estudiante.</p>
              )}
              {seccionActiva === "app" && (
                <p>Elegí cómo querés usar las funciones del mapa.</p>
              )}
              {seccionActiva === "privacy" && (
                <p>Información clara sobre los datos que usa la aplicación.</p>
              )}
            </header>

            {seccionActiva === "rentals" && (
              <section className="student-rentals" aria-label="Alquileres compartidos">
                {cargandoAlquileres && (
                  <p className="student-profile-status">Buscando tus alquileres…</p>
                )}
                {errorAlquileres && (
                  <p className="student-profile-message is-error" role="alert">
                    {errorAlquileres}
                  </p>
                )}
                {!cargandoAlquileres && !errorAlquileres && alquileres.length === 0 && (
                  <div className="student-rentals-empty">
                    <h3>Todavía no tenés alquileres compartidos</h3>
                    <p>
                      Cuando el propietario te agregue a una publicación, aparecerá acá
                      y vas a poder consultar avisos e intercambiar mensajes.
                    </p>
                    <Link className="button button-primary" to="/alquileres">
                      Explorar alquileres
                    </Link>
                  </div>
                )}
                {!cargandoAlquileres && alquileres.length > 0 && (
                  <div className="student-rentals-list">
                    {alquileres.map((alquiler) => (
                      <article className="student-rental-card" key={alquiler.id}>
                        <div>
                          <span className="section-kicker">PUBLICACIÓN COMPARTIDA</span>
                          <h3>{alquiler.title}</h3>
                          <p>{alquiler.address}, {alquiler.city}</p>
                          <small>Propietario: {alquiler.owner?.name || "No informado"}</small>
                        </div>
                        <Link
                          className="button button-primary"
                          to={`/alquileres/${alquiler.id}/foro`}
                        >
                          Abrir foro
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {seccionActiva === "profile" && (
              <>
                {cargando && (
                  <p className="student-profile-status">Cargando tu perfil…</p>
                )}
                {error && (
                  <p className="student-profile-message is-error" role="alert">
                    {error}
                  </p>
                )}
                {mensajeExito && (
                  <p
                    className="student-profile-message is-success"
                    role="status"
                  >
                    {mensajeExito}
                  </p>
                )}
                {!cargando && perfil && (
                  <>
                    <dl className="student-profile-summary">
                      <div>
                        <dt>Nombre</dt>
                        <dd>{usuarioPerfil.name || "No informado"}</dd>
                      </div>
                      <div>
                        <dt>Nombre de usuario</dt>
                        <dd>
                          {usuarioPerfil.username || "Todavía no configurado"}
                        </dd>
                      </div>
                      <div>
                        <dt>Biografía</dt>
                        <dd>{perfil.biography || "Todavía no agregada"}</dd>
                      </div>
                      <div>
                        <dt>Ciudad de origen</dt>
                        <dd>{perfil.origin_city || "Todavía no agregada"}</dd>
                      </div>
                    </dl>
                    <div className="student-profile-form-actions">
                      <button
                        className="button button-primary"
                        type="button"
                        onClick={abrirEdicionPerfil}
                      >
                        Editar
                      </button>
                    </div>
                  </>
                )}
                {!cargando && perfil && (
                  <div className="student-verification-settings">
                    <section className="student-verification-card">
                      <div className="student-verification-heading">
                        <div>
                          <h3>Correo electrónico</h3>
                          <p>
                            {emailCodeSent
                              ? "Confirmá el código para aplicar el cambio."
                              : usuarioPerfil.emailVerified
                              ? "Correo verificado"
                              : "Aún no verificaste tu correo"}
                          </p>
                        </div>
                        <span
                          className={`student-verification-badge ${usuarioPerfil.emailVerified ? "is-verified" : ""}`}
                        >
                          {usuarioPerfil.emailVerified ? "Verificado" : "Pendiente"}
                        </span>
                      </div>
                      <form
                        className="student-verification-form"
                        onSubmit={
                          emailCodeSent ? verificarEmail : enviarCodigoEmail
                        }
                      >
                        <label>
                          Email
                          <input
                            type="email"
                            maxLength={100}
                            autoComplete="email"
                            value={email}
                            onChange={(event) => {
                              setEmail(event.target.value);
                              setEmailCodeSent(false);
                              setEmailCode("");
                            }}
                            required
                          />
                        </label>
                        {emailCodeSent && (
                          <>
                            <label>
                              Código enviado por correo
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                value={emailCode}
                                onChange={(event) =>
                                  setEmailCode(event.target.value)
                                }
                                required
                              />
                            </label>
                            <button
                              className="student-verification-resend"
                              type="button"
                              disabled={verificandoEmail}
                              onClick={() => enviarCodigoEmail()}
                            >
                              Reenviar código
                            </button>
                          </>
                        )}
                        <button
                          className="button button-primary"
                          type="submit"
                          disabled={
                            verificandoEmail ||
                            (usuarioPerfil.emailVerified &&
                              email === usuarioPerfil.email)
                          }
                        >
                          {verificandoEmail
                            ? "Procesando…"
                            : emailCodeSent
                              ? "Verificar correo"
                              : usuarioPerfil.emailVerified &&
                                  email === usuarioPerfil.email
                                ? "Correo verificado"
                                : "Enviar código por correo"}
                        </button>
                      </form>
                    </section>

                    <section className="student-verification-card">
                      <div className="student-verification-heading">
                        <div>
                          <h3>Teléfono</h3>
                          <p>
                            {phoneCodeSent
                              ? "Confirmá el código para aplicar el cambio."
                              : usuarioPerfil.phoneVerified
                              ? "Teléfono verificado"
                              : usuarioPerfil.phone
                                ? "Aún no verificaste tu teléfono"
                                : "Agregá un teléfono y verificá que sea tuyo"}
                          </p>
                        </div>
                        <span
                          className={`student-verification-badge ${usuarioPerfil.phoneVerified ? "is-verified" : ""}`}
                        >
                          {usuarioPerfil.phoneVerified ? "Verificado" : "Pendiente"}
                        </span>
                      </div>
                      <form
                        className="student-verification-form"
                        onSubmit={
                          phoneCodeSent
                            ? verificarTelefono
                            : enviarCodigoTelefono
                        }
                      >
                        <label>
                          Número con código de país
                          <input
                            type="tel"
                            maxLength={16}
                            autoComplete="tel"
                            value={phone}
                            onChange={(event) => {
                              setPhone(event.target.value);
                              setPhoneCodeSent(false);
                              setPhoneCode("");
                            }}
                            placeholder="+5493704123456"
                            pattern="\+[1-9][0-9]{7,14}"
                            required
                          />
                        </label>
                        {phoneCodeSent && (
                          <>
                            <label>
                              Código recibido por SMS
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{4,10}"
                                maxLength={10}
                                value={phoneCode}
                                onChange={(event) =>
                                  setPhoneCode(event.target.value)
                                }
                                required
                              />
                            </label>
                            <button
                              className="student-verification-resend"
                              type="button"
                              disabled={verificandoTelefono}
                              onClick={() => enviarCodigoTelefono()}
                            >
                              Reenviar código
                            </button>
                          </>
                        )}
                        <button
                          className="button button-primary"
                          type="submit"
                          disabled={
                            verificandoTelefono ||
                            (usuarioPerfil.phoneVerified &&
                              phone === usuarioPerfil.phone)
                          }
                        >
                          {verificandoTelefono
                            ? "Procesando…"
                            : phoneCodeSent
                              ? "Verificar teléfono"
                              : usuarioPerfil.phoneVerified &&
                                  phone === usuarioPerfil.phone
                                ? "Teléfono verificado"
                                : "Enviar código por SMS"}
                        </button>
                      </form>
                    </section>
                  </div>
                )}
                {modalEdicionAbierto && (
                  <div
                    className="student-edit-modal-backdrop"
                    onClick={(event) => {
                      if (
                        event.target === event.currentTarget &&
                        !guardando
                      ) {
                        setModalEdicionAbierto(false);
                      }
                    }}
                  >
                    <section
                      className="student-edit-modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="student-edit-modal-title"
                    >
                      <header className="student-edit-modal-heading">
                        <div>
                          <span className="section-kicker">
                            AJUSTES DEL PERFIL
                          </span>
                          <h2 id="student-edit-modal-title">
                            Editar mis datos
                          </h2>
                        </div>
                        <button
                          type="button"
                          className="student-edit-modal-close"
                          aria-label="Cerrar"
                          disabled={guardando}
                          onClick={() => setModalEdicionAbierto(false)}
                        >
                          ×
                        </button>
                      </header>
                      {error && (
                        <p
                          className="student-profile-message is-error"
                          role="alert"
                        >
                          {error}
                        </p>
                      )}
                      <form
                        className="student-profile-form"
                        onSubmit={guardarPerfil}
                      >
                        <label>
                          Nombre
                          <input
                            type="text"
                            maxLength={100}
                            minLength={1}
                            autoComplete="given-name"
                            value={form.firstName}
                            onChange={actualizarCampo("firstName")}
                            required
                          />
                        </label>
                        <label>
                          Apellido
                          <input
                            type="text"
                            maxLength={100}
                            minLength={1}
                            autoComplete="family-name"
                            value={form.lastName}
                            onChange={actualizarCampo("lastName")}
                            required
                          />
                        </label>
                        <label>
                          Nombre de usuario
                          <input
                            type="text"
                            maxLength={30}
                            minLength={3}
                            autoComplete="username"
                            pattern="[a-zA-Z0-9._-]{3,30}"
                            value={form.username}
                            onChange={actualizarCampo("username")}
                            placeholder="Ej.: ana.perez"
                            required
                          />
                          <small>
                            Debe ser único; usá letras, números, punto, guion
                            o guion bajo.
                          </small>
                        </label>
                        <label>
                          Biografía
                          <textarea
                            maxLength={500}
                            rows={4}
                            value={form.biography}
                            onChange={actualizarCampo("biography")}
                            placeholder="Contá un poco sobre vos"
                          />
                          <small>{form.biography.length}/500 caracteres</small>
                        </label>
                        <label>
                          Ciudad de origen
                          <input
                            type="text"
                            maxLength={100}
                            value={form.origin_city}
                            onChange={actualizarCampo("origin_city")}
                            placeholder="Ej.: Clorinda"
                          />
                        </label>
                        <div className="student-profile-form-actions">
                          <button
                            className="button button-accent"
                            type="button"
                            disabled={guardando}
                            onClick={() => setModalEdicionAbierto(false)}
                          >
                            Cancelar
                          </button>
                          <button
                            className="button button-primary"
                            type="submit"
                            disabled={guardando}
                          >
                            {guardando ? "Guardando…" : "Guardar cambios"}
                          </button>
                        </div>
                      </form>
                    </section>
                  </div>
                )}
              </>
            )}

            {seccionActiva === "personal" && (
              <dl className="student-personal-details">
                <div>
                  <dt>Nombre</dt>
                  <dd>{usuarioPerfil.name || "No informado"}</dd>
                </div>
                <div>
                  <dt>Nombre de usuario</dt>
                  <dd>{usuarioPerfil.username || "Todavía no configurado"}</dd>
                </div>
                <div>
                  <dt>Correo electrónico</dt>
                  <dd>
                    {usuarioPerfil.email || "No informado"} ·{" "}
                    {usuarioPerfil.emailVerified ? "Verificado" : "Pendiente"}
                  </dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>
                    {usuarioPerfil.phone || "No informado"}
                    {usuarioPerfil.phone && (
                      <> · {usuarioPerfil.phoneVerified ? "Verificado" : "Pendiente"}</>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Tipo de cuenta</dt>
                  <dd>Estudiante</dd>
                </div>
                <div>
                  <dt>Biografía</dt>
                  <dd>{perfil?.biography || "Todavía no agregada"}</dd>
                </div>
                <div>
                  <dt>Ciudad de origen</dt>
                  <dd>{perfil?.origin_city || "Todavía no agregada"}</dd>
                </div>
              </dl>
            )}

            {seccionActiva === "app" && (
              <>
                <ThemeSetting />
                <label className="student-setting-row" htmlFor="share-location">
                  <span>
                    <strong>Compartir mi ubicación durante esta sesión</strong>
                    <small>
                      Permite mantener el mapa actualizado mientras navegás. La
                      ubicación no se guarda.
                    </small>
                  </span>
                  <input
                    id="share-location"
                    type="checkbox"
                    checked={compartirUbicacion}
                    onChange={(event) =>
                      event.target.checked ? startSharing() : stopSharing()
                    }
                  />
                </label>
                {errorUbicacion && (
                  <p className="student-profile-message is-error" role="alert">
                    {errorUbicacion}
                  </p>
                )}
              </>
            )}

            {seccionActiva === "privacy" && (
              <ul className="student-privacy-list">
                <li>
                  Tu ubicación solo se sigue durante la sesión si la activás y
                  aceptás el permiso del navegador.
                </li>
                <li>
                  La aplicación no guarda tu ubicación actual y deja de seguirla
                  al desactivarla o cerrar sesión.
                </li>
                <li>Tus favoritos se guardan en este dispositivo.</li>
                <li>
                  Tu correo y los datos de tu perfil se usan para identificar y
                  personalizar tu cuenta.
                </li>
              </ul>
            )}
          </section>
        </div>
      </div>
      )}
    </DashboardLayout>
  );
}
