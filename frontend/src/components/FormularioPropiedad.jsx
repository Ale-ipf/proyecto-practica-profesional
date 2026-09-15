import { useState } from "react";

const VALORES_INICIALES = {
  title: "",
  description: "",
  price: "",
  address: "",
  city: "",
  bedrooms: 1,
  is_furnished: false,
  status: "available",
};

export default function FormularioPropiedad({
  valoresIniciales = VALORES_INICIALES,
  textoBoton = "Publicar propiedad",
  onGuardar,
}) {
  const [form, setForm] = useState({ ...VALORES_INICIALES, ...valoresIniciales });
  const [erroresCampo, setErroresCampo] = useState({});
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const actualizar = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [campo]: valor });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    setErroresCampo({});
    setGuardando(true);
    try {
      await onGuardar({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        address: form.address,
        city: form.city,
        bedrooms: Number(form.bedrooms),
        is_furnished: Boolean(form.is_furnished),
        status: form.status,
      });
    } catch (err) {
      setError(err.message || "No pudimos guardar la propiedad.");
      const mapa = {};
      (err.fieldErrors || []).forEach((fe) => {
        mapa[fe.field] = fe.message;
      });
      setErroresCampo(mapa);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={enviar}>
      {error && <div className="mensaje-alerta mensaje-alerta--error">{error}</div>}

      <div className="campo">
        <label htmlFor="title">Título del anuncio</label>
        <input
          id="title"
          type="text"
          required
          placeholder="Ej: Monoambiente a dos cuadras de la UNaF"
          value={form.title}
          onChange={actualizar("title")}
        />
        {erroresCampo.title && <p className="campo__error">{erroresCampo.title}</p>}
      </div>

      <div className="campo">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          required
          placeholder="Contá cómo es la propiedad, qué incluye, cercanías…"
          value={form.description}
          onChange={actualizar("description")}
        />
        {erroresCampo.description && <p className="campo__error">{erroresCampo.description}</p>}
      </div>

      <div className="fila-campos">
        <div className="campo">
          <label htmlFor="price">Precio mensual ($)</label>
          <input id="price" type="number" min="0" required value={form.price} onChange={actualizar("price")} />
          {erroresCampo.price && <p className="campo__error">{erroresCampo.price}</p>}
        </div>

        <div className="campo">
          <label htmlFor="bedrooms">Ambientes</label>
          <select id="bedrooms" value={form.bedrooms} onChange={actualizar("bedrooms")}>
            <option value={1}>Monoambiente</option>
            <option value={2}>2 ambientes</option>
            <option value={3}>3 ambientes o más</option>
          </select>
        </div>

        <div className="campo">
          <label htmlFor="status">Estado</label>
          <select id="status" value={form.status} onChange={actualizar("status")}>
            <option value="available">Disponible</option>
            <option value="rented">Alquilado</option>
          </select>
        </div>
      </div>

      <div className="fila-campos">
        <div className="campo">
          <label htmlFor="address">Dirección</label>
          <input id="address" type="text" required value={form.address} onChange={actualizar("address")} />
          {erroresCampo.address && <p className="campo__error">{erroresCampo.address}</p>}
        </div>

        <div className="campo">
          <label htmlFor="city">Ciudad</label>
          <input id="city" type="text" required value={form.city} onChange={actualizar("city")} />
          {erroresCampo.city && <p className="campo__error">{erroresCampo.city}</p>}
        </div>
      </div>

      <div className="campo campo--check">
        <input
          id="is_furnished"
          type="checkbox"
          checked={form.is_furnished}
          onChange={actualizar("is_furnished")}
        />
        <label htmlFor="is_furnished">Está amoblado</label>
      </div>

      <button
        type="submit"
        className={`boton boton--primario ${guardando ? "boton--cargando" : ""}`}
        disabled={guardando}
      >
        {textoBoton}
      </button>
    </form>
  );
}
