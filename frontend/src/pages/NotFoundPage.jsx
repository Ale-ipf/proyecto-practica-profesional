import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="estado-vacio">
      <h3>Esta página no existe</h3>
      <p>Puede que el enlace esté roto o que la propiedad ya no esté publicada.</p>
      <Link to="/" className="boton boton--primario" style={{ marginTop: 16 }}>
        Volver al catálogo
      </Link>
    </div>
  );
}
