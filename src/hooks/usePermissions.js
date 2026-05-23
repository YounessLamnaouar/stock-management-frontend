import { useLocation } from "react-router-dom";
import { getRoleFromPath } from "../config/roles";

/**
 * Hook de permissions basé sur le rôle déduit de l'URL.
 *
 * Matrice des droits (dérivée du diagramme de cas d'utilisation) :
 *
 *                     | Admin | Gestionnaire | Agent
 *  Produits  (CRUD)   |  oui  |     non      |  non
 *  Catégories(CRUD)   |  oui  |     non      |  non
 *  Entrepôts (CRUD)   |  oui  |     non      |  non
 *  Utilisateurs(CRUD) |  oui  |     non      |  non
 *  Stocks    (CRUD)   |  oui  |     oui      |  non
 *  Mouvements(créer)  |  oui  |     oui      |  oui
 *  Export             |  oui  |     oui      |  oui
 *  Consultation       |  oui  |     oui      |  oui
 */
export function usePermissions() {
  const location = useLocation();
  const role = getRoleFromPath(location.pathname);

  const can = {
    manageProducts: role.id === "admin",
    manageCategories: role.id === "admin",
    manageWarehouses: role.id === "admin",
    manageUsers: role.id === "admin",
    manageStocks: role.id === "admin" || role.id === "gestionnaire",
    recordMovements: true, // les 3 rôles peuvent enregistrer un mouvement
    editMovements: role.id === "admin" || role.id === "gestionnaire",
    export: true,
    viewOnly: role.id === "agent",
  };

  return { role, can };
}
