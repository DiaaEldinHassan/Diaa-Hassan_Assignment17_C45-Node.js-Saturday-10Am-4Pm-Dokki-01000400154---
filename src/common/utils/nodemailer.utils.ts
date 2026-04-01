import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import {
  smtpHost,
  smtpPort,
  smtpSecure,
  smtpUser,
  smtpPass,
  emailFrom,
} from "../../config/config.service";
import { generateOtp } from "./otp.utils";

let transporter: nodemailer.Transporter | null = null;

function getTransportOptions(): SMTPTransport.Options {
  if (!smtpHost || !smtpUser) {
    throw new Error(
      "Email is not configured: set SMTP_HOST, SMTP_USER, and SMTP_PASS (or GOOGLE_PASSWORD) in your env.",
    );
  }
  if (!smtpPass) {
    throw new Error(
      "SMTP_PASS (or GOOGLE_PASSWORD) is empty. For Gmail use a 16-character App Password with 2-Step Verification enabled.",
    );
  }

  const base: SMTPTransport.Options = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  };

  if (smtpPort === 587 && !smtpSecure) {
    base.requireTLS = true;
  }

  return base;
}

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(getTransportOptions());
  }
  return transporter;
}

function formatSmtpError(err: unknown): string {
  if (!(err && typeof err === "object")) return String(err);
  const e = err as {
    message?: string;
    response?: string;
    responseCode?: number;
    command?: string;
  };
  const parts = [e.message, e.response, e.responseCode ? `code ${e.responseCode}` : "", e.command]
    .filter(Boolean)
    .join(" | ");
  return parts || String(err);
}

export type SendOtpEmailOptions = {
  expiresInMinutes?: number;
  purpose?: "signup" | "password-reset";
};


export async function sendOtpEmail(
  to: string,
  otp: string,
  options: SendOtpEmailOptions = {},
): Promise<void> {
  const minutes = options.expiresInMinutes ?? 10;
  const purpose = options.purpose ?? "signup";
  const from = emailFrom || smtpUser;

  const isReset = purpose === "password-reset";
  const subject = isReset ? "Reset your password" : "Your verification code";
  const lead = isReset
    ? "Use this code to reset your password:"
    : "Your verification code is:";
  const footer = isReset
    ? "If you did not request a password reset, you can ignore this email."
    : "If you did not request this, you can ignore this email.";

  try {
    const info = await getTransporter().sendMail({
      from: `"Social Media" <${from}>`,
      to,
      subject,
      text: `${lead}\n\n${otp}\n\nThis code expires in ${minutes} minutes.\n\n${footer}`,
      html: `
      <p>${lead}</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${otp}</p>
      <p style="color:#666;font-size:14px;">This code expires in ${minutes} minutes.</p>
      <p style="color:#666;font-size:14px;">${footer}</p>
    `.trim(),
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[mail] OTP sent, messageId:", info.messageId, "to:", to);
    }
  } catch (err) {
    console.error("[mail] Failed to send OTP:", formatSmtpError(err));
    const wrapped = new Error(
      `Failed to send verification email: ${formatSmtpError(err)}. ` +
        "Check SMTP_USER/SMTP_PASS (Gmail needs an App Password), SPAM folder, and try SMTP_PORT=465 with SMTP_SECURE=true if 587 fails.",
    );
    (wrapped as Error & { cause?: unknown }).cause = err;
    throw wrapped;
  }
}


export async function generateAndEmailOtp(
  to: string,
  options?: SendOtpEmailOptions & { digits?: number },
): Promise<string> {
  const otp = generateOtp(options?.digits ?? 6);
  await sendOtpEmail(to, otp, options);
  return otp;
}
