import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const TOKEN_KEY = "hola_auth_token";
const USER_KEY = "hola_auth_user";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: string;
}

interface AuthContextValue {
  token: string | null;
  user: StoredUser | null;
  isLoading: boolean;
  signIn: (token: string, user: StoredUser) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let _tokenRef: string | null = null;

setAuthTokenGetter(() => _tokenRef);

async function clearStorage() {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (!storedToken || !storedUser) {
          return;
        }

        // Validate token is still accepted by the server.
        // The in-memory store resets on server restart, so previously registered
        // users will be gone. A 401 or 404 means we must clear the stale session.
        try {
          const baseUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
          const res = await fetch(`${baseUrl}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (res.status === 401 || res.status === 404) {
            await clearStorage();
            return;
          }

          // Token is valid — hydrate auth state
          _tokenRef = storedToken;
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as StoredUser);
        } catch {
          // Network error on startup — keep the session optimistically so the
          // app can still render; requests will fail individually if needed.
          _tokenRef = storedToken;
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as StoredUser);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (t: string, u: StoredUser) => {
    _tokenRef = t;
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, t),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(u)),
    ]);
    setToken(t);
    setUser(u);
  }, []);

  const signOut = useCallback(async () => {
    _tokenRef = null;
    await clearStorage();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
