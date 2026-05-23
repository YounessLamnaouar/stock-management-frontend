import { createContext, useContext, useState } from "react";
import { ROLES } from "../config/roles";

export const DEMO_ACCOUNTS = [
  { email: "ahmed.radi@compagnie.ma", password: "admin123", role: ROLES.admin },
  { email: "sara.mernissi@compagnie.ma", password: "gest123", role: ROLES.gestionnaire },
  { email: "karim.lahlou@compagnie.ma", password: "agent123", role: ROLES.agent },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("stockmaster_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const login = (email, password) => {
    const account = DEMO_ACCOUNTS.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (account) {
      setUser(account);
      localStorage.setItem("stockmaster_user", JSON.stringify(account));
      return { success: true, role: account.role };
    }
    return { success: false };
  };

  const loginAsRole = (roleKey) => {
    const account = DEMO_ACCOUNTS.find(a => a.role.id === roleKey);
    if (account) {
      setUser(account);
      localStorage.setItem("stockmaster_user", JSON.stringify(account));
      return { success: true, role: account.role };
    }
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("stockmaster_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsRole, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
