import type { User } from "firebase/auth";
import type { ReactNode } from "react";

export interface AuthContextValue {
  user: User | null;
  userRole: string | null;
  tenantId: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthContextValue;
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element;
