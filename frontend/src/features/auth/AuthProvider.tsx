import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createApiClient,
  errorMessage,
  type ApiClient,
} from "../../lib/api-client";
import type { AuthInput, AuthResponse, User } from "../../types/library";
const TOKEN_KEY = "folio-token";
type AuthContextValue = {
  user: User | null;
  ready: boolean;
  error: string;
  api: ApiClient;
  signIn: (input: AuthInput, register: boolean) => Promise<void>;
  signOut: () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem(TOKEN_KEY) || "",
  );
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
    setError("");
  }, []);
  const api = useMemo(() => createApiClient(token, signOut), [token, signOut]);
  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }
    const controller = new AbortController();
    api<User>("/auth/me", "GET", undefined, controller.signal)
      .then(setUser)
      .catch((error) => {
        if (!controller.signal.aborted) setError(errorMessage(error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setReady(true);
      });
    return () => controller.abort();
  }, [token, api]);
  async function signIn(input: AuthInput, register: boolean) {
    const response = await createApiClient()<AuthResponse>(
      "/auth/" + (register ? "register" : "login"),
      "POST",
      input,
    );
    sessionStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    setError("");
  }
  return (
    <AuthContext.Provider value={{ user, ready, error, api, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}
