# Configuración del backend

Copiá `.env.example` a `.env` y completá las variables de la base de datos y
`JWT_SECRET`. El perfil de estudiante guarda el email y el teléfono nuevos solo
después de que el usuario confirma el código recibido.

Para habilitar los códigos de email, configurá `SMTP_HOST`, `SMTP_PORT`,
`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` y `SMTP_FROM`.

Para habilitar los códigos SMS, configurá una cuenta de Twilio y un servicio
Twilio Verify; completá `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y
`TWILIO_VERIFY_SERVICE_SID`. Los teléfonos se ingresan en formato internacional
E.164, por ejemplo `+5493704123456`.

Los códigos de email vencen a los 10 minutos y tienen un límite de intentos.
Los nombres de usuario se normalizan a minúsculas y son únicos.

## Personas y pagos de alquileres

El dueño de una publicación puede agregar cuentas existentes con rol de
estudiante, quitar personas y registrar manualmente el pago de cada mes. Los
pagos se guardan por persona y período (`AAAA-MM`); el backend registra la fecha
en que el dueño confirmó el pago. Todas estas rutas requieren autenticación de
dueño y verifican que la publicación le pertenezca:

- `GET /api/properties/:id/tenants?period=AAAA-MM`
- `POST /api/properties/:id/tenants` con `{ "email": "estudiante@ejemplo.com" }`
- `DELETE /api/properties/:id/tenants/:tenantId`
- `PUT /api/properties/:id/tenants/:tenantId/payment` con
  `{ "period": "AAAA-MM", "paid": true }`
