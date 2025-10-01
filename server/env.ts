import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for embeddings'),

  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),
  PINECONE_DIM: z.coerce.number().default(1024),

  PORT: z.coerce.number().default(8787),

  // Deepgram TTS
  DEEPGRAM_API_KEY: z.string().min(1, 'DEEPGRAM_API_KEY is required'),
  DEEPGRAM_MODEL: z.string().default('aura-asteria-en'),
  DEEPGRAM_ENCODING: z.enum(['mp3', 'wav']).default('mp3'),

  // Upload limits
  MAX_UPLOAD_MB: z.coerce.number().default(25),
});

export const env = EnvSchema.parse(process.env);


