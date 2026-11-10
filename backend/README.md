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
