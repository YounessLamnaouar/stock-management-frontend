import {
  LayoutDashboard,
  Package,
  Factory,
  ArrowRightLeft,
  History,
  Users,
  Settings,
  Tags,
  Layers,
} from "lucide-react";

/**
 * Configuration centrale des rôles de l'application.
 *
 * 3 rôles dérivés du diagramme de cas d'utilisation :
 *  - Admin        : accès complet (gestion des utilisateurs, produits, catégories, entrepôts...)
 *  - Gestionnaire : gestion des stocks, mouvements, alertes et traçabilité
 *  - Agent        : consultation + enregistrement des mouvements + export
 *
 * Chaque rôle possède :
 *  - label       : nom affiché
 *  - homePath    : page d'accueil (tableau de bord)
 *  - nav         : éléments du menu latéral
 *  - accent      : courte description du rôle
 */

export const ROLES = {
  admin: {
    id: "admin",
    label: "Admin",
    shortLabel: "Administrateur",
    description: "Accès complet au système",
    homePath: "/admin",
    user: { firstName: "Ahmed", lastName: "Radi", initials: "AR" },
    nav: [
      { title: "Tableau de bord", path: "/admin", icon: LayoutDashboard },
      { title: "Produits", path: "/admin/produits", icon: Package },
      { title: "Catégories", path: "/admin/categories", icon: Tags },
      { title: "Entrepôts", path: "/admin/entrepot", icon: Factory },
      { title: "Stocks", path: "/admin/stocks", icon: Layers },
      { title: "Mouvements", path: "/admin/mouvements", icon: ArrowRightLeft },
      { title: "Traçabilité", path: "/admin/tracabilite", icon: History },
      { title: "Utilisateurs", path: "/admin/utilisateurs", icon: Users },
      { title: "Paramètres", path: "/admin/parametres", icon: Settings },
    ],
  },

  gestionnaire: {
    id: "gestionnaire",
    label: "Gestionnaire",
    shortLabel: "Gestionnaire",
    description: "Gestion des stocks et mouvements",
    homePath: "/gestionnaire",
    user: { firstName: "Sara", lastName: "Mernissi", initials: "SM" },
    nav: [
      { title: "Tableau de bord", path: "/gestionnaire", icon: LayoutDashboard },
      { title: "Produits", path: "/gestionnaire/produits", icon: Package },
      { title: "Catégories", path: "/gestionnaire/categories", icon: Tags },
      { title: "Entrepôts", path: "/gestionnaire/entrepot", icon: Factory },
      { title: "Stocks", path: "/gestionnaire/stocks", icon: Layers },
      { title: "Mouvements", path: "/gestionnaire/mouvements", icon: ArrowRightLeft },
      { title: "Traçabilité", path: "/gestionnaire/tracabilite", icon: History },
      { title: "Paramètres", path: "/gestionnaire/parametres", icon: Settings },
    ],
  },

  agent: {
    id: "agent",
    label: "Agent",
    shortLabel: "Agent",
    description: "Consultation et enregistrement",
    homePath: "/agent",
    user: { firstName: "Karim", lastName: "Lahlou", initials: "KL" },
    nav: [
      { title: "Tableau de bord", path: "/agent", icon: LayoutDashboard },
      { title: "Produits", path: "/agent/produits", icon: Package },
      { title: "Catégories", path: "/agent/categories", icon: Tags },
      { title: "Stocks", path: "/agent/stocks", icon: Layers },
      { title: "Mouvements", path: "/agent/mouvements", icon: ArrowRightLeft },
      { title: "Paramètres", path: "/agent/parametres", icon: Settings },
    ],
  },
};

export const ROLE_LIST = [ROLES.admin, ROLES.gestionnaire, ROLES.agent];

/** Retourne le rôle correspondant au préfixe de l'URL courante. */
export function getRoleFromPath(pathname) {
  if (pathname.startsWith("/gestionnaire")) return ROLES.gestionnaire;
  if (pathname.startsWith("/agent")) return ROLES.agent;
  return ROLES.admin;
}
