import type { DefaultSession } from 'next-auth';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_WEBSOCKET_URL: string;
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_ENVIRONMENT: 'development' | 'test' | 'production';
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
      NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;
      NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string;
      NEXT_PUBLIC_ENABLE_VIDEO_CALLING: string;
      NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS: string;
      NEXT_PUBLIC_ENABLE_AI_FEATURES: string;
      NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES: string;
      NEXT_PUBLIC_ENABLE_MAP_FEATURES: string;
      NEXT_PUBLIC_DISABLE_AUTH: string;
      NEXT_PUBLIC_MOCK_API: string;
    }
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export {};