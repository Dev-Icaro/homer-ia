import { z } from 'zod';

const envSchema = z.object({
  APP_PORT: z.coerce.number().default(3000),
  OPENAI_API_KEY: z.string(),
  GROQ_API_KEY: z.string(),
  WAHA_BASE_URL: z.string().default('http://localhost:3000'),
  WAHA_API_KEY: z.string(),
  WAHA_SESSION: z.string().default('default'),
  MONGODB_URI: z.string().startsWith('mongodb://'),
  MONGODB_USER: z.string(),
  MONGODB_PASSWORD_FILE: z.string(),
  MONGODB_DB: z.string().default('homer-ia'),
});

export const env = envSchema.parse(Bun.env);