const port: number = Number(process.env.PORT) || 3000;
const dbUri: string = process.env.DB_URI_LOCAL || "";
const salt: number = Number(process.env.SALT);
const jwtSkAccess: string = process.env.JWT_SK_ACCESS || "";
const jwtSkRefresh: string = process.env.JWT_SK_REFRESH || "";
const redisUrl: string = process.env.REDIS_URL || "";
const googleClientId: string = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret: string = process.env.GOOGLE_CLIENT_SECRET || "";

function cleanEnv(value: string | undefined): string {
  if (!value) return "";
  const t = value.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

const smtpHost: string = cleanEnv(process.env.SMTP_HOST);
const smtpPort: number = Number(process.env.SMTP_PORT) || 587;
const smtpSecure: boolean = process.env.SMTP_SECURE === "true";
const smtpUser: string = cleanEnv(process.env.SMTP_USER);
const smtpPass: string = cleanEnv(
  process.env.SMTP_PASS || process.env.GOOGLE_PASSWORD,
);
const emailFrom: string = cleanEnv(process.env.EMAIL_FROM) || smtpUser || "";

export {
  port,
  dbUri,
  salt,
  jwtSkAccess,
  jwtSkRefresh,
  redisUrl,
  googleClientId,
  googleClientSecret,
  smtpHost,
  smtpPort,
  smtpSecure,
  smtpUser,
  smtpPass,
  emailFrom,
};
