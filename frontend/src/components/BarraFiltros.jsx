export default function BarraFiltros({ filtros, onCambiar }) {
  const actualizar = (campo) => (evento) => {
    const valor = evento.target.type === "checkbox" ? evento.target.checked : evento.target.value;
    onCambiar({ ...filtros, [campo]: valor });
  };

  return (
    <section className="barra-filtros" aria-label="Filtros de búsqueda">
      <p className="barra-filtros__titulo">Filtrar propiedades</p>
      <div className="barra-filtros__grilla">
        <div className="barra-filtros__campo">
          <label htmlFor="filtro-ciudad">Ciudad</label>
          <input
            id="filtro-ciudad"
            type="text"
            placeholder="Ej: Formosa"
            value={filtros.city}
            onChange={actualizar("city")}
          />
        </div>

        <div className="barra-filtros__campo">
          <label htmlFor="filtro-dormitorios">Dormitorios</label>
          <select id="filtro-dormitorios" value={filtros.bedrooms} onChange={actualizar("bedrooms")}>
            <option value="">Cualquiera</option>
            <option value="1">Monoambiente</option>
            <option value="2">2 dormitorios</option>
            <option value="3">3 o más</option>
          </select>
        </div>

        <div className="barra-filtros__campo">
          <label htmlFor="filtro-precio-max">Precio máximo</label>
          <input
            id="filtro-precio-max"
            type="number"
            placeholder="Ej: 250000"
            value={filtros.maxPrice}
            onChange={actualizar("maxPrice")}
          />
        </div>

        <div className="barra-filtros__campo">
          <label htmlFor="filtro-estado">Estado</label>
          <select id="filtro-estado" value={filtros.status} onChange={actualizar("status")}>
            <option value="">Todos</option>
            <option value="available">Disponible</option>
            <option value="rented">Alquilado</option>
          </select>
        </div>

        <div className="campo--check barra-filtros__campo">
          <input
            id="filtro-amoblado"
            type="checkbox"
            checked={filtros.is_furnished}
            onChange={actualizar("is_furnished")}
          />
          <label htmlFor="filtro-amoblado">Solo amoblados</label>
        </div>
      </div>
    </section>
  );
}
