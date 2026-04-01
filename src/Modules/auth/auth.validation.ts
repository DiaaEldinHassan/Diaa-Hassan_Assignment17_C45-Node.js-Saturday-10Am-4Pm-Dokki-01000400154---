import { z } from "zod";
import { normalizeEmail } from "../../common/utils/otp.utils";

const emailField = z
  .string()
  .min(3)
  .max(320)
  .email()
  .transform((e) => normalizeEmail(e));

const passwordField = z.string().min(8).max(30);

export const signUpSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30),
    email: emailField,
    password: passwordField,
    bio: z.string().max(100).optional(),
    profilePicture: z.string().optional(),
    coverPicture: z.string().optional(),
  }),
});

export const confirmOtpSchema = z.object({
  body: z.object({
    email: emailField,
    otp: z
      .string()
      .transform((s) => s.replace(/\s+/g, ""))
      .pipe(z.string().regex(/^\d{6}$/, "OTP must be 6 digits")),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailField,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailField,
    otp: z
      .string()
      .transform((s) => s.replace(/\s+/g, ""))
      .pipe(z.string().regex(/^\d{6}$/, "OTP must be 6 digits")),
    newPassword: passwordField,
  }),
});

export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: passwordField,
    newPassword: passwordField,
  }),
});

export const signInSchema = z.object({
  body: z.union([
    z.object({
      email: emailField,
      password: passwordField,
    }),
    z.object({
      token: z.string().min(1),
    })
  ])
});
