import { createContext, useContext } from "react";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  palier: number;
} | null;

export type AuthContextType = {
  user: AuthUser;
  isLoading: boolean;
  inviteCode: string | null;
  setInviteCode: (code: string | null) => void;
  signIn: () => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  inviteCode: null,
  setInviteCode: () => {},
  signIn: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

// API base URL
export const API_URL = __DEV__ ? "http://localhost:3001" : "https://api.garona.city";
