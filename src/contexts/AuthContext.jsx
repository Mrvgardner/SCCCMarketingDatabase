import { createContext, useContext, useState, useEffect } from "react";
import { isNativeApp, apiOrigin } from "../api/apiBase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Dev-only bypass: auto-authenticate a mock user in local development.
    // `import.meta.env.DEV` is compile-time — this branch is stripped from production builds.
    if (import.meta.env.DEV) {
      setUser({
        email: "dev@localhost",
        user_metadata: { full_name: "Local Dev" },
        app_metadata: { roles: ["admin"] },
      });
      setLoading(false);
      setReady(true);
      return;
    }

    const identity = window.netlifyIdentity;
    if (!identity) {
      console.error("Netlify Identity widget script not loaded");
      setLoading(false);
      return;
    }

    const onInit = (u) => {
      if (u) setUser(u);
      setLoading(false);
      setReady(true);
    };
    const onLogin = (u) => {
      setUser(u);
      identity.close();
    };
    const onLogout = () => setUser(null);

    identity.on("init", onInit);
    identity.on("login", onLogin);
    identity.on("logout", onLogout);
    // The widget infers its API endpoint from window.location.origin. Inside
    // the native shell that origin is capacitor://localhost, which is not a
    // Netlify site — init() then never fires its "init" event, loading stays
    // true forever, and every protected route renders null. A blank screen
    // with no error. Point it at the real site explicitly.
    identity.init(isNativeApp() ? { APIUrl: `${apiOrigin}/.netlify/identity` } : undefined);

    return () => {
      identity.off("init", onInit);
      identity.off("login", onLogin);
      identity.off("logout", onLogout);
    };
  }, []);

  const login = () => window.netlifyIdentity?.open("login");
  const signup = () => window.netlifyIdentity?.open("signup");
  const logout = () => window.netlifyIdentity?.logout();

  const roles = [
    ...(user?.app_metadata?.roles || []),
    ...(user?.user_metadata?.roles || []),
  ];
  const isAdmin = roles.some((r) => r.toLowerCase() === "admin");

  return (
    <AuthContext.Provider value={{ user, loading, ready, isAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
