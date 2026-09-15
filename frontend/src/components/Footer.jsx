import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="contenedor footer__contenido">
        <span className="footer__marca">Alquileres Formosa</span>
        <div className="footer__enlaces">
          <Link to="/institucional">Institucional</Link>
          <Link to="/contacto">Contacto y ubicación</Link>
        </div>
        <p className="footer__copy">
          © {new Date().getFullYear()} Alquileres Formosa. Plataforma de alquileres para
          estudiantes.
        </p>
      </div>
    </footer>
  );
}
