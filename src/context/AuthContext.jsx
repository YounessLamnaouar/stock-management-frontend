import { createContext, useContext, useState, useEffect } from "react";
import { ROLES } from "../config/roles";
import { authApi } from "../api/auth";

const ROLE_MAP = {
  Admin:        ROLES.admin,
  Gestionnaire: ROLES.gestionnaire,
  Agent:        ROLES.agent,
};

function buildUser(apiUser, token) {
  const roleName = apiUser.role?.nomRole || "Agent";
  return {
    id:     apiUser.id,
    prenom: apiUser.prenom || "",
    name:   apiUser.name   || "",
    email:  apiUser.email,
    token,
    role: ROLE_MAP[roleName] || ROLES.agent,
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("stockmaster_token");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((apiUser) => setUser(buildUser(apiUser, token)))
      .catch(() => {
        localStorage.removeItem("stockmaster_token");
        localStorage.removeItem("stockmaster_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    try {
      const data     = await authApi.login(email, password);
      const userData = buildUser(data.user, data.token);
      localStorage.setItem("stockmaster_token", data.token);
      localStorage.setItem("stockmaster_user",  JSON.stringify(userData));
      setUser(userData);
      return { success: true, role: userData.role };
    } catch {
      return { success: false };
    }
  };

  const updateUser = (apiUser) => {
    const token = localStorage.getItem("stockmaster_token");
    const updated = buildUser(apiUser, token);
    localStorage.setItem("stockmaster_user", JSON.stringify(updated));
    setUser(updated);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem("stockmaster_token");
    localStorage.removeItem("stockmaster_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
