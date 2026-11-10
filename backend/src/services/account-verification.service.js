import nodemailer from "nodemailer";
import twilio from "twilio";
import { ApiError } from "../helpers/api-error.js";

export async function sendEmailVerification(email, code) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
    throw new ApiError(
      503,
      "El envío de correo no está configurado. Contactá al administrador.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Código de verificación de Alquileres Formosa",
      text: `Tu código de verificación es ${code}. Vence en 10 minutos.`,
    });
  } catch {
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
