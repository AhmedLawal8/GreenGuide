import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5001";

export type AuthUser = {
  id: number;
  username: string | null;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => void;
  setTokenFromCallback: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("gg_token"),
  );
  const [isLoading, setIsLoading] = useState(true);

  // On mount (or when token changes), fetch the current user
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setUser(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Invalid token");
        const data = await res.json();
        if (!cancelled) setUser(data.user);
      } catch {
        // Token invalid — clear it
        localStorage.removeItem("gg_token");
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("gg_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      localStorage.setItem("gg_token", data.token);
      setToken(data.token);
      setUser(data.user);
    },
    [],
  );

  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/google`;
  }, []);

  const setTokenFromCallback = useCallback(async (newToken: string) => {
    localStorage.setItem("gg_token", newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gg_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      loginWithGoogle,
      setTokenFromCallback,
      logout,
    }),
    [user, token, isLoading, login, register, loginWithGoogle, setTokenFromCallback, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
