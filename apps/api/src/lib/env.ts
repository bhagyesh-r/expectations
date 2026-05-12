import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  API_PORT: z.coerce.number().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16)
});

export const env = envSchema.parse(process.env);
