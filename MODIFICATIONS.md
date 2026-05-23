# StockMaster — Modifications apportées

Ce document résume les changements effectués sur le projet (interface Admin
existante + ajout des interfaces Gestionnaire et Agent).

## 1. Installation et lancement

```bash
npm install
npm run dev
```

L'application démarre sur `/` et redirige automatiquement vers l'interface
Admin (`/admin`).

## 2. Architecture des rôles

Trois interfaces distinctes, dérivées du diagramme de cas d'utilisation :

| Rôle          | Préfixe d'URL     | Page d'accueil               |
|---------------|-------------------|------------------------------|
| Admin         | `/admin/...`      | `/admin`                     |
| Gestionnaire  | `/gestionnaire/...`| `/gestionnaire`             |
| Agent         | `/agent/...`      | `/agent`                     |

Le rôle courant est déduit automatiquement du préfixe de l'URL. La barre
latérale, la barre supérieure et les permissions s'adaptent en conséquence.

### Nouveaux fichiers

- `src/config/roles.js` — configuration centrale des 3 rôles (menu de
  navigation, page d'accueil, utilisateur, description).
- `src/hooks/usePermissions.js` — hook retournant la matrice de droits du
  rôle courant.
- `src/components/DevTools.jsx` — sélecteur d'interface flottant (voir §5).
- `src/pages/DashboardGestionnaire.jsx` — tableau de bord du Gestionnaire.
- `src/pages/DashboardAgent.jsx` — tableau de bord de l'Agent.

## 3. Suppression de la page « Alertes »

- La page `src/pages/Alertes.jsx` a été supprimée.
- L'entrée « Alertes » a été retirée du menu latéral.
- La logique d'alerte est conservée **uniquement dans les notifications**
  (cloche dans la barre supérieure). Les notifications sont désormais
  générées à partir des alertes de stock (`mockAlerts`).

## 4. Matrice des permissions

|                       | Admin | Gestionnaire | Agent |
|-----------------------|:-----:|:------------:|:-----:|
| Produits (CRUD)       |  oui  |     non      |  non  |
| Catégories (CRUD)     |  oui  |     non      |  non  |
| Entrepôts (CRUD)      |  oui  |     non      |  non  |
| Utilisateurs (CRUD)   |  oui  |     non      |  non  |
| Stocks (CRUD)         |  oui  |     oui      |  non  |
| Enregistrer mouvement |  oui  |     oui      |  oui  |
| Modifier/Annuler mvt  |  oui  |     oui      |  non  |
| Export                |  oui  |     oui      |  oui  |
| Consultation          |  oui  |     oui      |  oui  |

Les pages partagées (Produits, Catégories, Entrepôts, Stocks, Mouvements)
masquent automatiquement les boutons d'action selon le rôle. La page
Utilisateurs affiche un écran « Accès restreint » hors rôle Admin.

## 5. DevTools — Sélecteur d'interface

Un widget flottant (en bas à droite) permet de basculer instantanément
entre les 3 interfaces sans écran de connexion. Pratique pour le
développement et les démonstrations.

> À désactiver en production : retirer `<DevTools />` dans `src/App.jsx`.

## 6. Design

Le thème, les couleurs (palette verte sauge) et les composants UI existants
ont été conservés à l'identique. Les nouvelles pages réutilisent les mêmes
composants (`Card`, `Button`, `Badge`, `Table`...) et la même charte.
