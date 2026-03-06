import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@garona/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: false, // social only
  },
  socialProviders: {
    // Instagram + Apple — configure via env vars
    ...(process.env.INSTAGRAM_CLIENT_ID && {
      instagram: {
        clientId: process.env.INSTAGRAM_CLIENT_ID!,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
      },
    }),
    ...(process.env.APPLE_CLIENT_ID && {
      apple: {
        clientId: process.env.APPLE_CLIENT_ID!,
        clientSecret: process.env.APPLE_CLIENT_SECRET!,
      },
    }),
  },
  trustedOrigins: [
    "http://localhost:8081", // Expo dev
    "http://localhost:19006", // Expo web
    "garona://", // Expo scheme
  ],
});
