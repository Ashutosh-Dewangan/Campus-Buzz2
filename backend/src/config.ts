const requiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

export const DATABASE_URL = requiredEnv("DATABASE_URL");
export const JWT_SECRET = requiredEnv("JWT_SECRET");

export const PORT = Number(process.env.PORT || 5000);

export const CORS_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);