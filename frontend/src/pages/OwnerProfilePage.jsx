import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import DashboardLayout, {
  DashboardSection,
  UserProfileCard,
} from "../components/DashboardLayout.jsx";
import { OWNER_NAVIGATION } from "../components/dashboardNavigation.js";
import { ApiRequestError } from "../api/client.js";
import {
  actualizarMiPerfilDuenio,
  confirmarVerificacionEmailDuenio,
  confirmarVerificacionTelefonoDuenio,
  obtenerMiPerfilDuenio,
  solicitarVerificacionEmailDuenio,
  solicitarVerificacionTelefonoDuenio,
} from "../api/owners.js";
import { useAuth } from "../context/useAuth.js";
import { useLocationSharing } from "../context/useLocationSharing.js";
import ThemeSetting from "../components/ThemeSetting.jsx";

function PerfilEstadoVerificacion({ verificado, etiqueta }) {
  return (
    <span className={`owner-profile-verification ${verificado ? "is-verified" : ""}`}>
      {etiqueta}: {verificado ? "Verificado" : "Pendiente"}
    </span>
  );
}

export default function OwnerProfilePage() {
  const { usuario, logout, actualizarUsuario } = useAuth();
  const { hash } = useLocation();
  const {
    isSharing: compartirUbicacion,
    error: errorUbicacion,
    startSharing,
    stopSharing,
  } = useLocationSharing();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", dni: "" });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (usuario?.role !== "owner") return undefined;
    let cancelled = false;
    obtenerMiPerfilDuenio()
      .then(({ profile: data }) => {
        if (cancelled) return;
        setProfile(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          dni: data.dni || "",
        });
        setEmail(data.email || "");
        setPhone(data.phone || "");
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            requestError instanceof ApiRequestError
              ? requestError.message
              : "No pudimos cargar tu perfil.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [usuario?.role]);

  useEffect(() => {
    if (hash && profile) {
      document.getElementById(hash.slice(1))?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [hash, profile]);

  const actualizarCampo = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const guardarPerfil = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { profile: updated } = await actualizarMiPerfilDuenio({
        ...form,
        dni: form.dni.replace(/\D/g, ""),
      });
      setProfile(updated);
      setForm({
        firstName: updated.firstName || "",
        lastName: updated.lastName || "",
        dni: updated.dni || "",
      });
      actualizarUsuario(updated);
      setSuccess("Perfil actualizado.");
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos guardar los cambios.",
      );
    } finally {
      setSaving(false);
    }
  };

  const enviarCodigoEmail = async (event) => {
    event.preventDefault();
    setVerifyingEmail(true);
    setError("");
    setSuccess("");
    try {
      const data = await solicitarVerificacionEmailDuenio(email);
      setEmailCodeSent(true);
      setSuccess(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos enviar el código al correo.",
      );
    } finally {
      setVerifyingEmail(false);
    }
  };

  const verificarEmail = async (event) => {
    event.preventDefault();
    setVerifyingEmail(true);
    setError("");
    setSuccess("");
    try {
      const data = await confirmarVerificacionEmailDuenio(emailCode);
      setProfile((current) => ({ ...current, ...data.user }));
      setEmail(data.user.email);
      setEmailCode("");
      setEmailCodeSent(false);
      actualizarUsuario(data.user);
      setSuccess(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos verificar el correo.",
      );
    } finally {
      setVerifyingEmail(false);
    }
  };

  const enviarCodigoTelefono = async (event) => {
    event.preventDefault();
    setVerifyingPhone(true);
    setError("");
    setSuccess("");
    try {
      const data = await solicitarVerificacionTelefonoDuenio(phone);
      setPhoneCodeSent(true);
      setSuccess(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos enviar el código al teléfono.",
      );
    } finally {
      setVerifyingPhone(false);
    }
  };

  const verificarTelefono = async (event) => {
    event.preventDefault();
    setVerifyingPhone(true);
    setError("");
    setSuccess("");
    try {
      const data = await confirmarVerificacionTelefonoDuenio(phoneCode);
      setProfile((current) => ({ ...current, ...data.user }));
      setPhone(data.user.phone);
      setPhoneCode("");
      setPhoneCodeSent(false);
      actualizarUsuario(data.user);
      setSuccess(data.message);
    } catch (requestError) {
      setError(
        requestError instanceof ApiRequestError
          ? requestError.message
          : "No pudimos verificar el teléfono.",
      );
    } finally {
      setVerifyingPhone(false);
    }
  };

  const usuarioPerfil = profile
    ? {
        ...usuario,
        ...profile,
        name: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || usuario.name,
      }
    : usuario;

  if (!usuario) return <Navigate to="/login-and-registration" replace />;
  if (usuario.role !== "owner") return <Navigate to="/panel-estudiante" replace />;

  return (
    <DashboardLayout
      user={usuarioPerfil}
      roleLabel="Cuenta de propietario"
      navigation={OWNER_NAVIGATION}
      activeKey={
        hash === "#datos-personales"
          ? "personal"
          : hash === "#ajustes-app"
            ? "app"
            : hash === "#privacidad"
              ? "privacy"
              : "profile"
      }
      onLogout={logout}
    >
      <div className="owner-profile-page">
        <header className="owner-profile-page__header">
          <div>
            <span className="section-kicker">CUENTA DE PROPIETARIO</span>
            <h1>Mi perfil</h1>
            <p>Completá tus datos y verificá tu correo y teléfono.</p>
          </div>
          <Link className="button button-accent" to="/perfil-dueno">
            Volver al perfil
          </Link>
        </header>

        {loading && <p className="dashboard-message">Cargando perfil…</p>}
        {!loading && !profile && (
          <p className="dashboard-message is-error" role="alert">
            {error || "No pudimos cargar tu perfil."}
          </p>
        )}
        {error && profile && <p className="error-message" role="alert">{error}</p>}
        {success && <p className="owner-profile-success" role="status">{success}</p>}

        {profile && (
          <>
            <DashboardSection eyebrow="RESUMEN DE CUENTA" title="Tus datos">
              <UserProfileCard user={usuarioPerfil} roleLabel="Propietario" />
            </DashboardSection>

            <section className="owner-profile-section" id="datos-personales">
              <h2>Datos personales</h2>
              <form className="owner-profile-form" onSubmit={guardarPerfil}>
                <label>
                  Nombre
                  <input name="firstName" value={form.firstName} onChange={actualizarCampo} maxLength={100} required />
                </label>
                <label>
                  Apellido
                  <input name="lastName" value={form.lastName} onChange={actualizarCampo} maxLength={100} required />
                </label>
                <label>
                  DNI
                  <input
                    name="dni"
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={form.dni}
                    onChange={actualizarCampo}
                    minLength={7}
                    maxLength={8}
                    placeholder="7 u 8 dígitos"
                  />
                  <small>Tu DNI se mantiene protegido; los estudiantes solo verán los últimos tres dígitos.</small>
                </label>
                <label>
                  Correo electrónico
                  <input type="email" value={email} readOnly />
                  <small>El correo se verifica por separado en el apartado de verificación de identidad.</small>
                </label>
                <button className="button button-primary" type="submit" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar perfil"}
                </button>
              </form>
            </section>

            <section className="owner-profile-section" id="verificacion-identidad">
              <h2>Verificación de identidad</h2>
              <p>El perfil se mostrará como verificado cuando confirmes el correo y el teléfono.</p>
              <div className="owner-profile-verification-list">
                <PerfilEstadoVerificacion verificado={profile.emailVerified} etiqueta="Correo" />
                <PerfilEstadoVerificacion verificado={profile.phoneVerified} etiqueta="Teléfono" />
              </div>

              <form className="owner-profile-verification-form" onSubmit={enviarCodigoEmail}>
                <label>
                  Correo a verificar
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <button
                  className="button button-accent"
                  type="submit"
                  disabled={verifyingEmail || (profile.emailVerified && email === profile.email)}
                >
                  {verifyingEmail ? "Enviando…" : "Enviar código al correo"}
                </button>
              </form>
              {emailCodeSent && (
                <form className="owner-profile-verification-form" onSubmit={verificarEmail}>
                  <label>
                    Código recibido por correo
                    <input value={emailCode} onChange={(event) => setEmailCode(event.target.value)} inputMode="numeric" maxLength={6} required />
                  </label>
                  <button className="button button-primary" type="submit" disabled={verifyingEmail}>
                    Confirmar correo
                  </button>
                </form>
              )}

              <form className="owner-profile-verification-form" onSubmit={enviarCodigoTelefono}>
                <label>
                  Teléfono con código de país
                  <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+5493704123456" required />
                </label>
                <button
                  className="button button-accent"
                  type="submit"
                  disabled={verifyingPhone || (profile.phoneVerified && phone === profile.phone)}
                >
                  {verifyingPhone ? "Enviando…" : "Enviar código SMS"}
                </button>
              </form>
              {phoneCodeSent && (
                <form className="owner-profile-verification-form" onSubmit={verificarTelefono}>
                  <label>
                    Código recibido por SMS
                    <input value={phoneCode} onChange={(event) => setPhoneCode(event.target.value)} inputMode="numeric" maxLength={10} required />
                  </label>
                  <button className="button button-primary" type="submit" disabled={verifyingPhone}>
                    Confirmar teléfono
                  </button>
                </form>
              )}
            </section>
          </>
        )}

        <section className="owner-profile-section" id="ajustes-app">
          <h2>Ajustes de la app</h2>
          <ThemeSetting />
          <label className="student-setting-row" htmlFor="owner-share-location">
            <span>
              <strong>Compartir mi ubicación durante esta sesión</strong>
              <small>
                Permite mantener el mapa actualizado mientras navegás. La
                ubicación no se guarda.
              </small>
            </span>
            <input
              id="owner-share-location"
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
        </section>

        <section className="owner-profile-section" id="privacidad">
          <h2>Privacidad</h2>
          <ul className="student-privacy-list">
            <li>
              Tu ubicación solo se sigue durante la sesión si la activás y
              aceptás el permiso del navegador.
            </li>
            <li>
              La aplicación no guarda tu ubicación actual y deja de seguirla
              al desactivarla o cerrar sesión.
            </li>
            <li>Los datos de tu perfil se usan para identificar y personalizar tu cuenta.</li>
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
