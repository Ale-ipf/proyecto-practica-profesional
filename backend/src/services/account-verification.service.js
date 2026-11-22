import nodemailer from "nodemailer";
import twilio from "twilio";
import { ApiError } from "../helpers/api-error.js";

export async function sendEmailVerification(email, code) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
    process.env;

  if (!SMTP_USER || !SMTP_PASSWORD || (!SMTP_HOST && !SMTP_USER.endsWith("@gmail.com"))) {
    throw new ApiError(
      503,
      "El envío de correo no está configurado. Contactá al administrador.",
    );
  }

  const gmailHost = SMTP_USER.endsWith("@gmail.com");
  const host = SMTP_HOST || (gmailHost ? "smtp.gmail.com" : "");
  const port = Number(SMTP_PORT || (gmailHost ? 587 : 465));

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: email,
      subject: "Código de verificación de Alquileres Formosa",
      text: `Tu código de verificación es ${code}. Vence en 10 minutos.`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:520px;margin:auto">
          <h2 style="color:#e11d48;margin-bottom:16px">Verificación de correo</h2>
          <p>Ingresá este código para verificar tu cuenta en Alquileres Formosa:</p>
          <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:18px;text-align:center">
            <strong style="font-size:32px;letter-spacing:8px;color:#be123c">${code}</strong>
          </div>
          <p style="font-size:14px;color:#6b7280;margin-top:16px">El código vence en 10 minutos.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error(
      "Error al enviar el correo de verificación:",
      error instanceof Error ? error.message : error,
    );
    throw new ApiError(
      502,
      "No pudimos enviar el correo de verificación. Revisá la dirección e intentá nuevamente.",
    );
  }
}

function getTwilioClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
    process.env;

  if (
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN ||
    !TWILIO_VERIFY_SERVICE_SID
  ) {
    throw new ApiError(
      503,
      "El envío de SMS no está configurado. Contactá al administrador.",
    );
  }

  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    .verify.v2.services(TWILIO_VERIFY_SERVICE_SID);
}

export async function sendPhoneVerification(phone) {
  const service = getTwilioClient();

  try {
    await service.verifications.create({ to: phone, channel: "sms" });
  } catch {
    throw new ApiError(
      502,
      "No pudimos enviar el SMS de verificación. Revisá el número e intentá nuevamente.",
    );
  }
}

export async function checkPhoneVerification(phone, code) {
  const service = getTwilioClient();

  try {
    const verification = await service.verificationChecks.create({
      to: phone,
      code,
    });
    return verification.status === "approved";
  } catch {
    throw new ApiError(
      502,
      "No pudimos verificar el código SMS en este momento. Intentá nuevamente.",
    );
  }
}
