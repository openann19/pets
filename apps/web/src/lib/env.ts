import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5001'),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().default('http://localhost:5001'),
  
  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  
  // Database
  DATABASE_URL: z.string().optional(),
  
  // External Services
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Stripe Payment
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // AI Service
  NEXT_PUBLIC_AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_WEBSOCKET: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  NEXT_PUBLIC_ENABLE_PWA: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  
  // Performance
  NEXT_PUBLIC_IMAGE_OPTIMIZATION: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  NEXT_PUBLIC_ENABLE_CACHE: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join('.')).join(', ');
      console.warn(
        `⚠️ Missing or invalid environment variables: ${missingVars}\n` +
        `Check .env.schema for required variables.`
      );
    }
    // Return safe defaults
    return envSchema.parse({});
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>;