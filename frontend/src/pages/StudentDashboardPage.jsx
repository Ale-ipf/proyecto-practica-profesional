import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { obtenerMiPerfilEstudiante, actualizarMiPerfilEstudiante } from "../api/students.js";
import { ApiRequestError } from "../api/client.js";
import Tabs from "../components/Tabs.jsx";

const PESTAÑAS = [
  { id: "perfil", etiqueta: "Mi perfil" },
  { id: "accesos", etiqueta: "Accesos rápidos" },
];

const ACCESOS_RAPIDOS = [
  {
    titulo: "Disponibles ahora",
    descripcion: "Solo propiedades libres para alquilar ya",
    href: "/?status=available",
  },
  {
    titulo: "Amoblados",
    descripcion: "Para mudarte sin comprar muebles",
    href: "/?is_furnished=true",
  },
  {
    titulo: "Monoambientes",
    descripcion: "Ideal si buscás algo chico y económico",
    href: "/?bedrooms=1",
  },
  {
    titulo: "Hasta $150.000",
    descripcion: "Filtrado por presupuesto estudiantil",
    href: "/?maxPrice=150000",
  },
];

export default function StudentDashboardPage() {
  const { usuario } = useAuth();
  const [pestañaActiva, setPestañaActiva] = useState("perfil");

  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ university: "", career: "", origin_city: "" });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const cargarPerfil = useCallback(() => {
    setCargando(true);
    setError("");
    obtenerMiPerfilEstudiante()
      .then((data) => {
        setPerfil(data.student);
        setForm({
          university: data.student.university || "",
          career: data.student.career || "",
          origin_city: data.student.origin_city || "",
        });
      })
      .catch((err) =>
        setError(err instanceof ApiRequestError ? err.message : "No pudimos cargar tu perfil."),
      )
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargarPerfil();
  }, [cargarPerfil]);

  const actualizarCampo = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito("");
    setError("");
    try {
      await actualizarMiPerfilEstudiante(form);
      setMensajeExito("¡Perfil actualizado!");
      cargarPerfil();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "No pudimos guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="panel-bienvenida">
        <div>
          <h2>¡Bienvenido/a, {usuario.name}!</h2>
          <p>Completá tu perfil y llegá más rápido a la propiedad que estás buscando.</p>
        </div>
        <span className="panel-bienvenida__rol">Cuenta de estudiante</span>
      </div>

      <Tabs pestañas={PESTAÑAS} activa={pestañaActiva} onCambiar={setPestañaActiva} />

      {pestañaActiva === "perfil" && (
        <>
          {cargando && <p className="estado-carga">Cargando tu perfil…</p>}

          {!cargando && (
            <div className="formulario-tarjeta">
              {mensajeExito && <div className="mensaje-alerta mensaje-alerta--exito">{mensajeExito}</div>}
              {error && <div className="mensaje-alerta mensaje-alerta--error">{error}</div>}

              <form onSubmit={guardarPerfil}>
                <div className="campo">
                  <label htmlFor="university">Universidad</label>
                  <input
                    id="university"
                    type="text"
                    placeholder="Ej: UNaF"
                    value={form.university}
                    onChange={actualizarCampo("university")}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="career">Carrera</label>
                  <input
                    id="career"
                    type="text"
                    placeholder="Ej: Abogacía"
                    value={form.career}
                    onChange={actualizarCampo("career")}
                  />
                </div>

                <div className="campo">
                  <label htmlFor="origin_city">Ciudad de origen</label>
                  <input
                    id="origin_city"
                    type="text"
                    placeholder="Ej: Clorinda"
                    value={form.origin_city}
                    onChange={actualizarCampo("origin_city")}
                  />
                </div>

                <button
                  type="submit"
                  className={`boton boton--primario ${guardando ? "boton--cargando" : ""}`}
                  disabled={guardando}
                >
                  Guardar cambios
                </button>
              </form>
            </div>
          )}

          <div className="grilla-info" style={{ marginTop: 24 }}>
            <div className="tarjeta-info">
              <span className="tarjeta-info__etiqueta">Correo electrónico</span>
              <span className="tarjeta-info__valor">{usuario.email}</span>
            </div>
            <div className="tarjeta-info">
              <span className="tarjeta-info__etiqueta">Tipo de cuenta</span>
              <span className="tarjeta-info__valor">Estudiante</span>
            </div>
          </div>
        </>
      )}

      {pestañaActiva === "accesos" && (
        <div className="lista-accesos">
          {ACCESOS_RAPIDOS.map((acceso) => (
            <Link key={acceso.href} to={acceso.href} className="acceso-rapido">
              <strong>{acceso.titulo}</strong>
              <span>{acceso.descripcion}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
