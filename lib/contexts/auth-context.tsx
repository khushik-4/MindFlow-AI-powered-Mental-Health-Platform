"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { resolveApiUrl } from "@/lib/utils";


interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  } | null;
  showLoginModal: boolean;
  showUserForm: boolean;
  isCheckingSession: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthState["user"]>) => Promise<void>;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    isAuthenticated: false,
    user: null,
    showLoginModal: false,
    showUserForm: false,
    isCheckingSession: true,
  });

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(resolveApiUrl("/api/auth/me"));
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setState((s) => ({
              ...s,
              isAuthenticated: true,
              user: data.user,
              isLoading: false,
              isCheckingSession: false,
            }));
            return;
          }
        }
      } catch (err) {
        console.error("Session restore failed:", err);
      } finally {
        setState((s) => ({ ...s, isLoading: false, isCheckingSession: false }));
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState((s) => ({ ...s, isLoading: true }));
      const res = await fetch(resolveApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((s) => ({
          ...s,
          isAuthenticated: true,
          user: data,
          showLoginModal: false,
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setState((s) => ({ ...s, isLoading: false }));
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setState((s) => ({ ...s, isLoading: true }));
      const res = await fetch(resolveApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((s) => ({
          ...s,
          isAuthenticated: true,
          user: data,
          showLoginModal: false,
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setState((s) => ({ ...s, isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      setState((s) => ({ ...s, isLoading: true }));
      await fetch(resolveApiUrl("/api/auth/logout"), { method: "POST" });
      localStorage.removeItem("userRole");
    } catch (err) {
      console.error(err);
    } finally {
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        showLoginModal: false,
        showUserForm: false,
        isCheckingSession: false,
      });
    }
  };

  const updateUser = async (userData: Partial<AuthState["user"]>) => {
    if (!state.user) return;
    setState((s) => ({
      ...s,
      user: s.user ? { ...s.user, ...userData } : null,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        setShowLoginModal: (show) =>
          setState((s) => ({ ...s, showLoginModal: show })),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};