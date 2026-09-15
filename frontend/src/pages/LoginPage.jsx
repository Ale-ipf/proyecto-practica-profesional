import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiRequestError } from "../api/client.js";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const usuario = await login(form.email, form.password);
      const destino = ubicacion.state?.desde?.pathname;
      if (destino) {
        navigate(destino, { replace: true });
      } else {
        navigate(usuario.role === "owner" ? "/panel-dueno" : "/panel-estudiante", { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "No pudimos iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-auth">
      <div>
        <div className="pantalla-auth__marca">
          <h1>Iniciar sesión</h1>
          <p>Entrá para gestionar tus propiedades o tus favoritos.</p>
        </div>

        <div className="formulario-tarjeta">
          {error && <div className="mensaje-alerta mensaje-alerta--error">{error}</div>}

          <form onSubmit={enviar}>
            <div className="campo">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={actualizar("email")}
              />
            </div>

            <div className="campo">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={actualizar("password")}
              />
            </div>

            <button
              type="submit"
              className={`boton boton--primario boton--ancho ${enviando ? "boton--cargando" : ""}`}
              disabled={enviando}
            >
              Ingresar
            </button>
          </form>
        </div>

        <p className="pantalla-auth__pie">
          ¿No tenés cuenta? <Link to="/crear-cuenta">Creá una acá</Link>
        </p>
        <p className="pantalla-auth__volver">
          <Link to="/">← Volver al catálogo</Link>
        </p>
      </div>
    </div>
  );
}
