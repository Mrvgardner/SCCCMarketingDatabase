import { createContext, useContext, useState, useEffect } from "react";
import netlifyIdentity from "netlify-identity-widget";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    netlifyIdentity.init();

    // Check for existing logged-in user
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) setUser(currentUser);
    setLoading(false);

    netlifyIdentity.on("login", (u) => {
      setUser(u);
      netlifyIdentity.close();
    });

    netlifyIdentity.on("logout", () => {
      setUser(null);
    });

    return () => {
      netlifyIdentity.off("login");
      netlifyIdentity.off("logout");
    };
  }, []);

  const login = () => netlifyIdentity.open("login");
  const signup = () => netlifyIdentity.open("signup");
  const logout = () => netlifyIdentity.logout();

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
