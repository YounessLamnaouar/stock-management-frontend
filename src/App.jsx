import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import DevTools from "./components/DevTools";

// Tableaux de bord (un par rôle)
import Dashboard from "./pages/Dashboard";
import DashboardGestionnaire from "./pages/DashboardGestionnaire";
import DashboardAgent from "./pages/DashboardAgent";

// Pages partagées (adaptées au rôle via usePermissions)
import Products from "./pages/Products";
import Warehouses from "./pages/Warehouses";
import Movements from "./pages/Movements";
import Categories from "./pages/Categories";
import Stocks from "./pages/Stocks";
import Traceability from "./pages/Traceability";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Redirection racine vers l'interface Admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* ============ Interface ADMIN ============ */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/produits" element={<Products />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/entrepot" element={<Warehouses />} />
          <Route path="/admin/stocks" element={<Stocks />} />
          <Route path="/admin/mouvements" element={<Movements />} />
          <Route path="/admin/tracabilite" element={<Traceability />} />
          <Route path="/admin/utilisateurs" element={<Agents />} />
          <Route path="/admin/parametres" element={<Settings />} />

          {/* ============ Interface GESTIONNAIRE ============ */}
          <Route path="/gestionnaire" element={<DashboardGestionnaire />} />
          <Route path="/gestionnaire/produits" element={<Products />} />
          <Route path="/gestionnaire/categories" element={<Categories />} />
          <Route path="/gestionnaire/stocks" element={<Stocks />} />
          <Route path="/gestionnaire/mouvements" element={<Movements />} />
          <Route path="/gestionnaire/tracabilite" element={<Traceability />} />
          <Route path="/gestionnaire/parametres" element={<Settings />} />

          {/* ============ Interface AGENT ============ */}
          <Route path="/agent" element={<DashboardAgent />} />
          <Route path="/agent/produits" element={<Products />} />
          <Route path="/agent/categories" element={<Categories />} />
          <Route path="/agent/entrepot" element={<Warehouses />} />
          <Route path="/agent/stocks" element={<Stocks />} />
          <Route path="/agent/mouvements" element={<Movements />} />
          <Route path="/agent/tracabilite" element={<Traceability />} />
          <Route path="/agent/parametres" element={<Settings />} />

          {/* Toute route inconnue -> Admin */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Layout>

      {/* Sélecteur d'interface (outil de développement) */}
      <DevTools />
    </Router>
  );
}

export default App;
