import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ApiRequestError } from "../api/client.js";

export default function RegisterPage() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [erroresCampo, setErroresCampo] = useState({});
  const [enviando, setEnviando] = useState(false);

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setErroresCampo({});
    setEnviando(true);
    try {
      const usuario = await registrar(form);
      navigate(usuario.role === "owner" ? "/panel-dueno" : "/panel-estudiante", { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
        const mapa = {};
        err.fieldErrors.forEach((fe) => {
          mapa[fe.field] = fe.message;
        });
        setErroresCampo(mapa);
      } else {
        setError("No pudimos crear tu cuenta.");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pantalla-auth">
      <div>
        <div className="pantalla-auth__marca">
          <h1>Crear cuenta</h1>
          <p>Sumate a la comunidad de alquileres para estudiantes de Formosa.</p>
        </div>

        <div className="formulario-tarjeta">
          {error && <div className="mensaje-alerta mensaje-alerta--error">{error}</div>}

          <form onSubmit={enviar}>
            <div className="campo">
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text" required value={form.name} onChange={actualizar("name")} />
              {erroresCampo.name && <p className="campo__error">{erroresCampo.name}</p>}
            </div>

            <div className="campo">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={form.email} onChange={actualizar("email")} />
              {erroresCampo.email && <p className="campo__error">{erroresCampo.email}</p>}
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
              {erroresCampo.password && <p className="campo__error">{erroresCampo.password}</p>}
            </div>

            <div className="campo">
              <label htmlFor="role">¿Qué perfil sos?</label>
              <select id="role" value={form.role} onChange={actualizar("role")}>
                <option value="student">Estudiante — busco alquiler</option>
                <option value="owner">Dueño — publico propiedades</option>
              </select>
            </div>

            <button
              type="submit"
              className={`boton boton--primario boton--ancho ${enviando ? "boton--cargando" : ""}`}
              disabled={enviando}
            >
              Crear mi cuenta
            </button>
          </form>
        </div>

        <p className="pantalla-auth__pie">
          ¿Ya tenés cuenta? <Link to="/ingresar">Iniciá sesión</Link>
        </p>
        <p className="pantalla-auth__volver">
          <Link to="/">← Volver al catálogo</Link>
        </p>
      </div>
    </div>
  );
}
