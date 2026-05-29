import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import DevTools from "./components/DevTools";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import DashboardGestionnaire from "./pages/DashboardGestionnaire";
import DashboardAgent from "./pages/DashboardAgent";

import Products from "./pages/Products";
import Warehouses from "./pages/Warehouses";
import Movements from "./pages/Movements";
import Categories from "./pages/Categories";
import Stocks from "./pages/Stocks";
import Traceability from "./pages/Traceability";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <p className="text-sm text-foreground/50 font-medium">Chargement en cours…</p>
      </div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RequireGuest({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) return <Navigate to={user.role.homePath} replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />

        <Route path="/*" element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />

                {/* ADMIN */}
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/produits" element={<Products />} />
                <Route path="/admin/categories" element={<Categories />} />
                <Route path="/admin/entrepot" element={<Warehouses />} />
                <Route path="/admin/stocks" element={<Stocks />} />
                <Route path="/admin/mouvements" element={<Movements />} />
                <Route path="/admin/tracabilite" element={<Traceability />} />
                <Route path="/admin/utilisateurs" element={<Agents />} />
                <Route path="/admin/parametres" element={<Settings />} />

                {/* GESTIONNAIRE */}
                <Route path="/gestionnaire" element={<DashboardGestionnaire />} />
                <Route path="/gestionnaire/produits" element={<Products />} />
                <Route path="/gestionnaire/categories" element={<Categories />} />
                <Route path="/gestionnaire/stocks" element={<Stocks />} />
                <Route path="/gestionnaire/mouvements" element={<Movements />} />
                <Route path="/gestionnaire/tracabilite" element={<Traceability />} />
                <Route path="/gestionnaire/parametres" element={<Settings />} />

                {/* AGENT */}
                <Route path="/agent" element={<DashboardAgent />} />
                <Route path="/agent/produits" element={<Products />} />
                <Route path="/agent/categories" element={<Categories />} />
                <Route path="/agent/entrepot" element={<Warehouses />} />
                <Route path="/agent/stocks" element={<Stocks />} />
                <Route path="/agent/mouvements" element={<Movements />} />
                <Route path="/agent/tracabilite" element={<Traceability />} />
                <Route path="/agent/parametres" element={<Settings />} />

                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        } />
      </Routes>
      <DevTools />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
