import { useLocation } from "react-router-dom";
import { getRoleFromPath } from "../config/roles";

/**
 * Matrice des droits mise à jour :
 *
 *                            | Admin | Gestionnaire | Agent
 *  Produits  (CRUD)          |  oui  |     non      |  non
 *  Catégories(CRUD)          |  oui  |     non      |  non
 *  Entrepôts (add/edit/del)  |  oui  |     non      |  non
 *  Entrepôts (view+stock)    |  oui  |     oui      |  non
 *  Utilisateurs(CRUD)        |  oui  |     non      |  non
 *  Stocks    (CRUD)          |  oui  |     non      |  oui
 *  Stocks    (export)        |  non  |     oui      |  non
 *  Mouvements(créer)         |  oui  |     non      |  oui
 *  Mouvements(chg statut)    |  oui  |     oui      |  non
 *  Mouvements(select+suppr.) |  oui  |     non      |  oui
 *  Mouvements(export)        |  oui  |     oui      |  non
 *  Traçabilité (export)      |  oui  |     oui      |  non
 */
export function usePermissions() {
  const location = useLocation();
  const role = getRoleFromPath(location.pathname);

  const isAdmin = role.id === "admin";
  const isGest  = role.id === "gestionnaire";
  const isAgent = role.id === "agent";

  const can = {
    manageProducts:        isAdmin,
    manageCategories:      isAdmin,
    manageWarehouses:      isAdmin,                // add / edit / delete
    viewWarehouseDetails:  isAdmin || isGest,      // view details + stock modal
    manageUsers:           isAdmin,
    manageStocks:          isAdmin || isAgent,     // CRUD stocks
    exportStocks:          isGest,                 // export only for gestionnaire
    createMovement:        isAdmin || isAgent,
    changeMovementStatus:  isAdmin || isGest,
    bulkDeleteMovements:   isAdmin || isAgent,
    exportMovements:       isAdmin || isGest,
    exportTraceability:    isAdmin || isGest,
  };

  return { role, can };
}
