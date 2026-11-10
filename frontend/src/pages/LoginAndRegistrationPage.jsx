import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ApiRequestError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import Access from "./Access.jsx";

export default function LoginAndRegistrationPage() {
  const { login, registrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    requestedTab === "register" ? "register" : "login",
  );
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const selectTab = (tab) => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "register") nextParams.set("tab", tab);
    else nextParams.delete("tab");
    setSearchParams(nextParams, { replace: true });
    setLoginError("");
    setRegisterError("");
    setFieldErrors({});
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    setSubmitting(true);

    try {
      const user = await login(loginForm.email, loginForm.password);
      const destination = location.state?.desde?.pathname;
      navigate(
        destination ||
          (user.role === "owner" ? "/panel-dueno" : "/panel-estudiante"),
        { replace: true },
      );
    } catch (error) {
      setLoginError(
        error instanceof ApiRequestError
          ? error.message
          : "No pudimos iniciar sesión.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitRegistration = async (event) => {
    event.preventDefault();
    setRegisterError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      const user = await registrar(registerForm);
      navigate(
        user.role === "owner" ? "/panel-dueno" : "/panel-estudiante",
        { replace: true },
      );
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setRegisterError(error.message);
        setFieldErrors(
          Object.fromEntries(
            error.fieldErrors.map(({ field, message }) => [field, message]),
          ),
        );
      } else {
        setRegisterError("No pudimos crear tu cuenta.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateLoginField = (field) => (event) =>
    setLoginForm((current) => ({ ...current, [field]: event.target.value }));
  const updateRegistrationField = (field) => (event) =>
    setRegisterForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

  return (
    <Access activeTab={activeTab} onTabChange={selectTab}>
      {activeTab === "login" ? (
        <form className="access-auth-form" onSubmit={submitLogin}>
          {loginError && (
            <p className="access-error" role="alert">
              {loginError}
            </p>
          )}
          <div className="access-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={loginForm.email}
              onChange={updateLoginField("email")}
              required
            />
          </div>
          <div className="access-field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Ingresá tu contraseña"
              value={loginForm.password}
              onChange={updateLoginField("password")}
              required
            />
          </div>
          <button
            type="submit"
            className="access-primary-button"
            disabled={submitting}
          >
            {submitting ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>
      ) : (
        <form className="access-auth-form" onSubmit={submitRegistration}>
          {registerError && (
            <p className="access-error" role="alert">
              {registerError}
            </p>
          )}
          <div className="access-field">
            <label htmlFor="register-name">Nombre completo</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              placeholder="Ana García"
              value={registerForm.name}
              onChange={updateRegistrationField("name")}
              required
            />
            {fieldErrors.name && (
              <p className="access-field-error">{fieldErrors.name}</p>
            )}
          </div>
          <div className="access-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              maxLength={100}
              placeholder="tu@email.com"
              value={registerForm.email}
              onChange={updateRegistrationField("email")}
              required
            />
            {fieldErrors.email && (
              <p className="access-field-error">{fieldErrors.email}</p>
            )}
          </div>
          <div className="access-field">
            <label htmlFor="register-password">Contraseña</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              placeholder="Creá una contraseña"
              value={registerForm.password}
              onChange={updateRegistrationField("password")}
              required
            />
            {fieldErrors.password && (
              <p className="access-field-error">{fieldErrors.password}</p>
            )}
          </div>
          <div className="access-field">
            <label htmlFor="register-role">¿Qué perfil sos?</label>
            <select
              id="register-role"
              value={registerForm.role}
              onChange={updateRegistrationField("role")}
            >
              <option value="student">Estudiante — busco alquiler</option>
              <option value="owner">Dueño — publico propiedades</option>
            </select>
            {fieldErrors.role && (
              <p className="access-field-error">{fieldErrors.role}</p>
            )}
          </div>
          <button
            type="submit"
            className="access-primary-button"
            disabled={submitting}
          >
            {submitting ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      )}
    </Access>
  );
}
