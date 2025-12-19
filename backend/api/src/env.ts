import { z } from "zod";

const optionalNonEmptyString = z.preprocess((value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().optional());

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().optional().default("0.0.0.0"),
  PORT: z
    .string()
    .optional()
    .transform((value: string | undefined) => (value ? Number(value) : 4000))
    .pipe(z.number().int().min(1).max(65535)),
  WEB_ORIGIN: z.string().url().default("https://example.com"),
  WEB_ORIGINS: optionalNonEmptyString,
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),

  // Optional for local dev; required for Google sign-in endpoints.
  GOOGLE_CLIENT_ID: optionalNonEmptyString,
  GOOGLE_CLIENT_SECRET: optionalNonEmptyString,
  GOOGLE_REDIRECT_URL: z.preprocess((value: unknown) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, z.string().url().optional()),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Keep this readable for local dev.
    // Zod formatting is already fairly descriptive.
    // eslint-disable-next-line no-console
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
