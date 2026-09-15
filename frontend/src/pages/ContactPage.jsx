export default function ContactPage() {
  return (
    <div className="pagina-simple">
      <span className="etiqueta etiqueta--terracota">Contacto</span>
      <h1>Hablemos</h1>
      <p>
        ¿Tenés dudas sobre cómo publicar una propiedad o cómo usar la plataforma? Escribinos y te
        respondemos a la brevedad.
      </p>

      <div className="tarjeta-contacto">
        <dl>
          <dt>Email</dt>
          <dd>
            <a href="mailto:hola@alquileresformosa.com.ar">hola@alquileresformosa.com.ar</a>
          </dd>
          <dt>Teléfono</dt>
          <dd>(0370) 400-0000</dd>
          <dt>Ubicación</dt>
          <dd>Formosa Capital, Formosa, Argentina</dd>
          <dt>Horario</dt>
          <dd>Lunes a viernes, 9 a 18 hs</dd>
        </dl>
      </div>
    </div>
  );
}
