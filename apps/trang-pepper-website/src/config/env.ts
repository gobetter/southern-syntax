import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_BUCKET_NAME: z.string().min(1),
});

// export const env = envSchema.parse(process.env);
// export type Env = z.infer<typeof envSchema>;
export const getEnv = () => envSchema.parse(process.env);
