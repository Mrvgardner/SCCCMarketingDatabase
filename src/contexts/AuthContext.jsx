import { createContext, useContext, useState, useEffect } from "react";

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

    identity.init();

    const currentUser = identity.currentUser();
    if (currentUser) setUser(currentUser);
    setLoading(false);
    setReady(true);

    const onLogin = (u) => {
      setUser(u);
      identity.close();
    };
    const onLogout = () => setUser(null);

    identity.on("login", onLogin);
    identity.on("logout", onLogout);

    return () => {
      identity.off("login", onLogin);
      identity.off("logout", onLogout);
    };
  }, []);

  const login = () => window.netlifyIdentity?.open("login");
  const signup = () => window.netlifyIdentity?.open("signup");
  const logout = () => window.netlifyIdentity?.logout();

  const isAdmin = Boolean(user?.app_metadata?.roles?.includes("admin"));

  return (
    <AuthContext.Provider value={{ user, loading, ready, isAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
