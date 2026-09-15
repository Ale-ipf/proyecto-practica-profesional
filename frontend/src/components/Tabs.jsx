export default function Tabs({ pestañas, activa, onCambiar }) {
  return (
    <div className="tabs" role="tablist">
      {pestañas.map((pestaña) => (
        <button
          key={pestaña.id}
          type="button"
          role="tab"
          aria-selected={activa === pestaña.id}
          className={`tabs__boton ${activa === pestaña.id ? "tabs__boton--activo" : ""}`}
          onClick={() => onCambiar(pestaña.id)}
        >
          {pestaña.etiqueta}
        </button>
      ))}
    </div>
  );
}
