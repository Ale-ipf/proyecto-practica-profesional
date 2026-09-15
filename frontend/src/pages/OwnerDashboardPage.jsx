import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { listarMisPropiedades, crearPropiedad } from "../api/properties.js";
import { ApiRequestError } from "../api/client.js";
import Tabs from "../components/Tabs.jsx";
import TarjetaPropiedadDueno from "../components/TarjetaPropiedadDueno.jsx";
import FormularioPropiedad from "../components/FormularioPropiedad.jsx";

const PESTAÑAS = [
  { id: "propiedades", etiqueta: "Mis propiedades" },
  { id: "nueva", etiqueta: "Publicar nueva" },
  { id: "perfil", etiqueta: "Mi cuenta" },
];

export default function OwnerDashboardPage() {
  const { usuario } = useAuth();
  const [pestañaActiva, setPestañaActiva] = useState("propiedades");
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const cargarPropiedades = useCallback(() => {
    setCargando(true);
    listarMisPropiedades()
      .then((data) => setPropiedades(data.properties))
      .catch((err) =>
        setError(err instanceof ApiRequestError ? err.message : "No pudimos cargar tus propiedades."),
      )
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargarPropiedades();
  }, [cargarPropiedades]);

  const publicarPropiedad = async (datos) => {
    try {
      await crearPropiedad(datos);
      setMensajeExito("¡Propiedad publicada correctamente!");
      setPestañaActiva("propiedades");
      cargarPropiedades();
    } catch (err) {
      throw err instanceof ApiRequestError ? err : new Error("No pudimos publicar la propiedad.");
    }
  };

  return (
    <div>
      <div className="panel-bienvenida">
        <div>
          <h2>Hola de nuevo, {usuario.name}</h2>
          <p>Gestioná tus propiedades publicadas y sumá nuevos alquileres para la comunidad.</p>
        </div>
        <span className="panel-bienvenida__rol">Cuenta de propietario</span>
      </div>

      <Tabs pestañas={PESTAÑAS} activa={pestañaActiva} onCambiar={setPestañaActiva} />

      {mensajeExito && pestañaActiva === "propiedades" && (
        <div className="mensaje-alerta mensaje-alerta--exito">{mensajeExito}</div>
      )}

      {pestañaActiva === "propiedades" && (
        <>
          {cargando && <p className="estado-carga">Cargando tus propiedades…</p>}
          {!cargando && error && <div className="mensaje-alerta mensaje-alerta--error">{error}</div>}
          {!cargando && !error && propiedades.length === 0 && (
            <div className="estado-vacio">
              <h3>Todavía no publicaste propiedades</h3>
              <p>Usá la pestaña "Publicar nueva" para cargar tu primer alquiler.</p>
            </div>
          )}
          {!cargando && !error && propiedades.length > 0 && (
            <div className="grilla-propiedades">
              {propiedades.map((propiedad) => (
                <TarjetaPropiedadDueno key={propiedad.id} propiedad={propiedad} onCambio={cargarPropiedades} />
              ))}
            </div>
          )}
        </>
      )}

      {pestañaActiva === "nueva" && (
        <div className="formulario-tarjeta formulario-tarjeta--ancha">
          <h3>Publicar una nueva propiedad</h3>
          <FormularioPropiedad onGuardar={publicarPropiedad} textoBoton="Publicar propiedad" />
        </div>
      )}

      {pestañaActiva === "perfil" && (
        <div className="grilla-info">
          <div className="tarjeta-info">
            <span className="tarjeta-info__etiqueta">Correo electrónico</span>
            <span className="tarjeta-info__valor">{usuario.email}</span>
          </div>
          <div className="tarjeta-info">
            <span className="tarjeta-info__etiqueta">Tipo de cuenta</span>
            <span className="tarjeta-info__valor">Dueño / Propietario</span>
          </div>
          <div className="tarjeta-info">
            <span className="tarjeta-info__etiqueta">Propiedades publicadas</span>
            <span className="tarjeta-info__valor">{propiedades.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
