import { createAuthClient } from "better-auth/react";
import { API_URL } from "./auth";

export const authClient = createAuthClient({
  baseURL: API_URL,
});

export const {
  signIn,
  signOut,
  useSession,
} = authClient;
