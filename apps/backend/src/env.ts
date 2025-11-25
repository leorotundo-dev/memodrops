import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  PORT: z.coerce.number().optional(),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().default('https://api.openai.com/v1'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  RAILWAY_ACCOUNT_TOKEN: z.string().optional(),
  RAILWAY_PROJECT_ID: z.string().optional(),
  VERCEL_TOKEN: z.string().optional()
});

// Valores fallback para quando variáveis não estão configuradas
const getFallbackEnv = () => {
  const fallback: Record<string, string> = {};
  
  // Railway tokens - usar do env ou fallback
  if (!process.env.RAILWAY_ACCOUNT_TOKEN) {
    fallback.RAILWAY_ACCOUNT_TOKEN = '7175f3b9-ff3e-4b44-a74a-00cb928f721a';
  }
  if (!process.env.RAILWAY_PROJECT_ID) {
    fallback.RAILWAY_PROJECT_ID = 'e0ca0841-18bc-4c48-942e-d90a6b725a5b';
  }
  if (!process.env.VERCEL_TOKEN) {
    fallback.VERCEL_TOKEN = 'L48oHd8B50rWzbuWW4ry6NP9';
  }
  
  return fallback;
};

export const env = envSchema.parse({
  ...process.env,
  ...getFallbackEnv()
});
