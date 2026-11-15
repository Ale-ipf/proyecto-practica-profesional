import { Link } from "react-router-dom";

const safetyRules = [
  {
    icon: "price",
    title: "Desconfiá de los precios muy bajos",
    description:
      "Compará con otras publicaciones. Un valor muy por debajo del mercado puede esconder una estafa.",
  },
  {
    icon: "time",
    title: "No te dejes apurar",
    description:
      "Tomate tiempo para revisar. Desconfiá de quien exige una seña urgente para no perder una supuesta oferta.",
  },
  {
    icon: "receipt",
    title: "Pedí recibo de todo",
    description:
      "Guardá los comprobantes y acordá por escrito el monto, las fechas y las condiciones antes de pagar.",
  },
  {
    icon: "home",
    title: "Conocé la propiedad",
    description:
      "Visitá el lugar o pedí una videollamada en vivo. Confirmá que exista y que esté disponible para alquilar.",
  },
  {
    icon: "identity",
    title: "Verificá quién alquila",
    description:
      "Pedí ver el documento de quien firma y comprobá que sus datos coincidan con el acuerdo.",
  },
  {
    icon: "security",
    title: "Cuidá tus datos y pagos",
    description:
      "No compartas claves ni códigos. Evitá transferir a terceros y guardá evidencia de cada pago.",
  },
];

function SafetyIcon({ name }) {
  const iconContent = {
    price: (
      <>
        <path d="M20.6 13.4 11 3.8H4v7l9.6 9.6a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8Z" />
        <circle cx="7.5" cy="7.5" r=".8" />
        <path d="M12 9.5h2.5m-1.25 0v3m-1.25 0h2.5" />
      </>
    ),
    time: (
      <>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 1.5M9 2h6m-3 0v3m6.3 1.7L20 5" />
      </>
    ),
    receipt: (
      <>
        <path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17Z" />
        <path d="M9 8h6m-6 4h6m-6 4h3" />
      </>
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9m-9 11v-7h4v7" />
      </>
    ),
    identity: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="11" r="2" />
        <path d="M6 16c.8-1.5 5.2-1.5 6 0m3-6h3m-3 4h3" />
      </>
    ),
    security: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <rect x="9" y="10.5" width="6" height="5" rx="1" />
        <path d="M10.5 10.5V9a1.5 1.5 0 0 1 3 0v1.5" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {iconContent[name]}
    </svg>
  );
}

const verificationChecks = [
  {
    title: "Identidad",
    description:
      "La app solicita el DNI, pero todavía no comprueba su autenticidad. Revisá el documento y los datos de quien firma.",
  },
  {
    title: "Teléfono",
    description:
      "El número se confirma con un código enviado al teléfono del propietario.",
  },
  {
    title: "Propiedad",
    description:
      "El sello no acredita la titularidad. Pedí una constancia o autorización que demuestre que puede alquilar.",
  },
];

export default function SafetyTipsPage() {
  return (
    <div className="app-shell safety-page-shell">
      <header className="site-header safety-page-header">
        <Link className="brand-title" to="/">
          Alquileres Formosa
        </Link>
        <nav className="main-nav" aria-label="Navegación de seguridad">
          <Link to="/alquileres">Publicaciones</Link>
        </nav>
      </header>

      <main className="safety-page">
        <section className="safety-page__intro">
          <span className="section-kicker">CONSEJOS DE SEGURIDAD</span>
          <h1>Alquilá tranquilo: cómo evitar estafas</h1>
          <p>Seis reglas simples antes de pagar o firmar cualquier cosa.</p>
        </section>

        <section className="safety-rules" aria-label="Seis consejos de seguridad">
          {safetyRules.map((rule, index) => (
            <article className="safety-rule-card" key={rule.title}>
              <span className="safety-rule-card__icon" aria-hidden="true">
                <SafetyIcon name={rule.icon} />
              </span>
              <span className="safety-rule-card__number">
                Regla {index + 1}
              </span>
              <h2>{rule.title}</h2>
              <p>{rule.description}</p>
            </article>
          ))}
        </section>

        <section className="safety-verification" aria-labelledby="safety-verification-title">
          <div className="safety-verification__heading">
            <span className="safety-verification__badge">
              <span aria-hidden="true">✓</span> Perfil verificado
            </span>
            <h2 id="safety-verification-title">
              ¿Qué significa el sello “Verificado”?
            </h2>
            <p>
              En la app, el sello confirma el correo y el teléfono del
              propietario. No significa que se hayan validado su DNI ni la
              titularidad de la propiedad.
            </p>
          </div>

          <ul className="safety-verification__checks">
            {verificationChecks.map((check) => (
              <li key={check.title}>
                <span className="safety-verification__check" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <h3>{check.title}</h3>
                  <p>{check.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="safety-page__actions">
          <Link className="button button-primary" to="/alquileres">
            Volver a las publicaciones
          </Link>
        </div>
      </main>

      <footer className="site-footer">
        <p>© 2026 Alquileres Formosa</p>
        <div>
          <Link to="/alquileres">Ver publicaciones</Link>
        </div>
      </footer>
    </div>
  );
}
