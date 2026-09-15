import { useState } from "react";
import TarjetaPropiedad from "./TarjetaPropiedad.jsx";
import FormularioPropiedad from "./FormularioPropiedad.jsx";
import { actualizarPropiedad, eliminarPropiedad, agregarImagenes, eliminarImagen } from "../api/properties.js";
import { ApiRequestError } from "../api/client.js";

export default function TarjetaPropiedadDueno({ propiedad, onCambio }) {
  const [editando, setEditando] = useState(false);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState("");
  const [errorImagen, setErrorImagen] = useState("");
  const [borrando, setBorrando] = useState(false);

  const guardarCambios = async (datos) => {
    try {
      await actualizarPropiedad(propiedad.id, datos);
      setEditando(false);
      onCambio();
    } catch (err) {
      throw err instanceof ApiRequestError ? err : new Error("No pudimos actualizar la propiedad.");
    }
  };

  const borrar = async () => {
    if (!window.confirm(`¿Eliminar "${propiedad.title}"? Esta acción no se puede deshacer.`)) return;
    setBorrando(true);
    try {
      await eliminarPropiedad(propiedad.id);
      onCambio();
    } catch {
      setBorrando(false);
      alert("No pudimos eliminar la propiedad. Probá de nuevo.");
    }
  };

  const agregarImagen = async (e) => {
    e.preventDefault();
    if (!nuevaImagenUrl.trim()) return;
    setErrorImagen("");
    try {
      await agregarImagenes(propiedad.id, [nuevaImagenUrl.trim()]);
      setNuevaImagenUrl("");
      onCambio();
    } catch (err) {
      setErrorImagen(err instanceof ApiRequestError ? err.message : "URL de imagen inválida.");
    }
  };

  const borrarImagen = async (imageId) => {
    try {
      await eliminarImagen(propiedad.id, imageId);
      onCambio();
    } catch {
      alert("No pudimos quitar esa imagen.");
    }
  };

  if (editando) {
    return (
      <div className="formulario-tarjeta formulario-tarjeta--ancha" style={{ marginBottom: 24 }}>
        <h3>Editando: {propiedad.title}</h3>
        <FormularioPropiedad
          valoresIniciales={propiedad}
          textoBoton="Guardar cambios"
          onGuardar={guardarCambios}
        />
        <button
          type="button"
          className="boton boton--fantasma"
          style={{ marginTop: 12 }}
          onClick={() => setEditando(false)}
        >
          Cancelar
        </button>

        <hr style={{ border: "none", borderTop: "1px solid var(--color-linea)", margin: "20px 0" }} />

        <h4 style={{ fontSize: "0.95rem" }}>Fotos</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          {(propiedad.images || []).map((img) => (
            <div key={img.id} style={{ position: "relative" }}>
              <img
                src={img.url}
                alt=""
                style={{ width: 90, height: 70, objectFit: "cover", borderRadius: "var(--radius-sm)" }}
              />
              <button
                type="button"
                onClick={() => borrarImagen(img.id)}
                title="Quitar imagen"
                className="boton boton--peligro boton--chico"
                style={{ position: "absolute", top: -8, right: -8, padding: "2px 7px" }}
              >
                ×
              </button>
            </div>
          ))}
          {(propiedad.images || []).length === 0 && (
            <p style={{ color: "var(--color-carbon-suave)", fontSize: "0.85rem" }}>
              Todavía no cargaste fotos.
            </p>
          )}
        </div>

        <form onSubmit={agregarImagen} style={{ display: "flex", gap: 8 }}>
          <input
            type="url"
            placeholder="https://…"
            value={nuevaImagenUrl}
            onChange={(e) => setNuevaImagenUrl(e.target.value)}
            style={{
              flex: 1,
              padding: "8px 10px",
              border: "1px solid var(--color-linea-fuerte)",
              borderRadius: "var(--radius-sm)",
            }}
          />
          <button type="submit" className="boton boton--secundario boton--chico">
            Agregar foto
          </button>
        </form>
        {errorImagen && <p className="campo__error">{errorImagen}</p>}
      </div>
    );
  }

  return (
    <TarjetaPropiedad
      propiedad={propiedad}
      acciones={
        <>
          <button type="button" className="boton boton--secundario boton--chico" onClick={() => setEditando(true)}>
            Editar
          </button>
          <button
            type="button"
            className="boton boton--peligro boton--chico"
            onClick={borrar}
            disabled={borrando}
          >
            {borrando ? "Eliminando…" : "Eliminar"}
          </button>
        </>
      }
    />
  );
}
