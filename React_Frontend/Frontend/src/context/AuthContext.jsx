/* eslint-disable react-refresh/only-export-components -- context files conventionally export the hook alongside the provider */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  clearAuth,
  getStoredUser,
  getToken,
  getTasks,
  loginUser,
  registerUser,
  storeAuth,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());
  // True until we know whether a stored token is still valid
  const [initializing, setInitializing] = useState(() => Boolean(getToken()));
  const [error, setError] = useState(null);

  // On startup, check that the stored token is still accepted by WA-2.
  // GET /api/tasks is the cheapest protected endpoint we can use for this.
  // If the token is expired/invalid -> log out. On network issues we keep
  // the session and let the page itself surface the connection error.
  useEffect(() => {
    let cancelled = false;

    // No token: `initializing` already starts as false, nothing to verify
    if (!token) {
      return;
    }

    async function verify() {
      try {
        await getTasks();
        if (!cancelled) {
          if (!getStoredUser()) {
            setUser({ name: "User" });
          }
        }
      } catch (err) {
        if (!cancelled && err instanceof ApiError && err.status === 401) {
          clearAuth();
          setToken(null);
          setUser(null);
        }
        // Network/server errors: keep the session, pages will show the error
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email, password) {
    setError(null);
    const data = await loginUser({ email, password });
    storeAuth(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    setError(null);
    // Registration does not log the user in, so just pass through to login
    await registerUser({ name, email, password });
  }

  function logout() {
    clearAuth();
    setToken(null);
    setUser(null);
    setError(null);
  }

  const value = useMemo(
    () => ({ token, user, initializing, error, login, register, logout }),
    [token, user, initializing, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
}
