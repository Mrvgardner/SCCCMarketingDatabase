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
    // The widget works out its API endpoint from window.location. Inside the
    // native shell that is capacitor://localhost, so the widget decides it is
    // running against a local dev server and puts up its "let us know the URL
    // of your Netlify site" prompt — which then sends the user out to the full
    // marketing site in an in-app browser, instead of signing them in.
    //
    // APIUrl alone does not prevent that: the host check happens first. The
    // widget remembers the answer to that prompt in localStorage under
    // netlifySiteURL, so answering it up front is what actually suppresses it.
    if (isNativeApp()) {
      try {
        window.localStorage.setItem("netlifySiteURL", apiOrigin);
      } catch {
        // Private mode or a full quota — init below still gets APIUrl, and the
        // worst case is the prompt we are trying to avoid.
      }
    }
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
