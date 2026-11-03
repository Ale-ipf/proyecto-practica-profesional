import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  obtenerMiPerfilEstudiante,
  actualizarMiPerfilEstudiante,
} from "../api/students.js";
import { ApiRequestError } from "../api/client.js";
import { useLocationSharing } from "../context/LocationContext.jsx";

const SECCIONES = [
  { id: "profile", label: "Ajustes del perfil" },
  { id: "personal", label: "Datos personales" },
  { id: "app", label: "Ajustes de la app" },
  { id: "privacy", label: "Privacidad" },
];

export default function StudentDashboardPage() {
  const { usuario, logout } = useAuth();
  const {
    isSharing: compartirUbicacion,
    error: errorUbicacion,
    startSharing,
    stopSharing,
  } = useLocationSharing();
  const [seccionActiva, setSeccionActiva] = useState("profile");
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({
    university: "",
    career: "",
    origin_city: "",
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const cargarPerfil = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const data = await obtenerMiPerfilEstudiante();
      setPerfil(data.student);
      setForm({
        university: data.student.university || "",
        career: data.student.career || "",
        origin_city: data.student.origin_city || "",
      });
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
    cargarPerfil();
  }, [cargarPerfil]);

  const actualizarCampo = (campo) => (event) =>
    setForm((current) => ({ ...current, [campo]: event.target.value }));

  const guardarPerfil = async (event) => {
    event.preventDefault();
    setGuardando(true);
    setMensajeExito("");
    setError("");
    try {
      const data = await actualizarMiPerfilEstudiante(form);
      setPerfil(data.student);
      setMensajeExito("Perfil actualizado.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos guardar los cambios.",
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== "student") return <Navigate to="/panel-dueno" replace />;

  const seccion = SECCIONES.find((item) => item.id === seccionActiva);

  return (
    <div className="app-shell route-page-shell">
      <header className="site-header">
        <Link className="brand-title" to="/">
          Alquileres Formosa
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link to="/alquileres">Alquileres</Link>
          <Link to="/mapa">Mapa</Link>
        </nav>
        <div className="header-actions student-profile-header-actions">
          <span>Hola, {usuario.name}</span>
          <button
            className="button button-outline-danger"
            type="button"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="student-profile-page">
        <div className="student-profile-heading">
          <span className="section-kicker">CUENTA DE ESTUDIANTE</span>
          <h1>Mi perfil</h1>
          <p>Administrá tus datos, preferencias y privacidad.</p>
        </div>

        <div className="student-profile-layout">
          <nav
            className="student-profile-navigation"
            aria-label="Secciones del perfil"
          >
            {SECCIONES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`student-profile-navigation-item ${seccionActiva === item.id ? "is-active" : ""}`}
                aria-current={seccionActiva === item.id ? "page" : undefined}
                onClick={() => setSeccionActiva(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <section
            className="student-profile-panel"
            aria-labelledby="student-profile-section-title"
          >
            <header className="student-profile-panel-heading">
              <h2 id="student-profile-section-title">{seccion.label}</h2>
              {seccionActiva === "profile" && (
                <p>Completá estos datos para personalizar tu experiencia.</p>
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
                {!cargando && !error && (
                  <form
                    className="student-profile-form"
                    onSubmit={guardarPerfil}
                  >
                    <label>
                      Universidad o instituto
                      <input
                        type="text"
                        maxLength={150}
                        value={form.university}
                        onChange={actualizarCampo("university")}
                        placeholder="Ej.: UNaF"
                      />
                    </label>
                    <label>
                      Carrera
                      <input
                        type="text"
                        maxLength={150}
                        value={form.career}
                        onChange={actualizarCampo("career")}
                        placeholder="Ej.: Ingeniería en Sistemas"
                      />
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
                        className="button button-primary"
                        type="submit"
                        disabled={guardando}
                      >
                        {guardando ? "Guardando…" : "Guardar cambios"}
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {seccionActiva === "personal" && (
              <dl className="student-personal-details">
                <div>
                  <dt>Nombre</dt>
                  <dd>{usuario.name || "No informado"}</dd>
                </div>
                <div>
                  <dt>Correo electrónico</dt>
                  <dd>{usuario.email || "No informado"}</dd>
                </div>
                <div>
                  <dt>Tipo de cuenta</dt>
                  <dd>Estudiante</dd>
                </div>
                <div>
                  <dt>Institución</dt>
                  <dd>{perfil?.university || "Todavía no agregada"}</dd>
                </div>
                <p>
                  Para actualizar universidad, carrera o ciudad de origen, usá
                  “Ajustes del perfil”.
                </p>
              </dl>
            )}

            {seccionActiva === "app" && (
              <>
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
      </main>
    </div>
  );
}
