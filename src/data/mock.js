export const mockProducts = [
  { id: "P001", code: "PROD-001", name: "Ordinateur Portable Pro", description: "PC 15 pouces 16Go RAM", unit: "Pièce", category: "Électronique", createdAt: "2023-11-12", status: "Actif", quantity: 145 },
  { id: "P002", code: "PROD-002", name: "Souris Sans Fil", description: "Souris ergonomique Bluetooth", unit: "Pièce", category: "Accessoires", createdAt: "2023-11-15", status: "Actif", quantity: 430 },
  { id: "P003", code: "PROD-003", name: "Écran 27 pouces", description: "Écran 4K UHD", unit: "Pièce", category: "Électronique", createdAt: "2023-12-01", status: "Actif", quantity: 85 },
  { id: "P004", code: "PROD-004", name: "Imprimante Laser", description: "Imprimante monochrome réseau", unit: "Pièce", category: "Périphériques", createdAt: "2024-01-10", status: "En rupture", quantity: 0 },
  { id: "P005", code: "PROD-005", name: "Cartouche Encre Noire", description: "Cartouche haute capacité", unit: "Unité", category: "Consommables", createdAt: "2024-01-20", status: "Stock Faible", quantity: 12 },
  { id: "P006", code: "PROD-006", name: "Clavier Mécanique", description: "Clavier AZERTY filaire", unit: "Pièce", category: "Accessoires", createdAt: "2024-02-05", status: "Actif", quantity: 156 },
  { id: "P007", code: "PROD-007", name: "Disque SSD 1To", description: "SSD NVMe Gen4", unit: "Pièce", category: "Composants", createdAt: "2024-03-11", status: "Actif", quantity: 320 }
];

export const mockWarehouses = [
  { id: "W01", name: "Entrepôt Central", address: "Zone Industrielle, Casablanca", description: "Stockage principal", capacity: 10000, currentStock: 7500, status: "Actif" },
  { id: "W02", name: "Entrepôt Nord", address: "Tanger Free Zone", description: "Hub d'expédition Nord", capacity: 5000, currentStock: 1200, status: "Actif" },
  { id: "W03", name: "Entrepôt Rabat", address: "Technopolis, Rabat", description: "Stockage d'appoint", capacity: 2000, currentStock: 1950, status: "Saturé" },
];

export const mockMovements = [
  { id: "M-1001", type: "Entrée", product: "Ordinateur Portable Pro", quantity: 50, date: "2024-04-10 10:30", source: "-", destination: "Entrepôt Central", comment: "Réception fournisseur A", agent: "Ahmed R." },
  { id: "M-1002", type: "Sortie", product: "Souris Sans Fil", quantity: 5, date: "2024-04-11 14:15", source: "Entrepôt Rabat", destination: "-", comment: "Vente client #4092", agent: "Sara M." },
  { id: "M-1003", type: "Transfert", product: "Écran 27 pouces", quantity: 20, date: "2024-04-12 09:00", source: "Entrepôt Central", destination: "Entrepôt Nord", comment: "Équilibrage stock", agent: "Karim L." },
  { id: "M-1004", type: "Sortie", product: "Cartouche Encre Noire", quantity: 2, date: "2024-04-13 11:20", source: "Entrepôt Rabat", destination: "-", comment: "Utilisation interne", agent: "Leila B." },
  { id: "M-1005", type: "Entrée", product: "Disque SSD 1To", quantity: 100, date: "2024-04-14 16:45", source: "-", destination: "Entrepôt Central", comment: "Commande urgente", agent: "Ahmed R." },
  { id: "M-1006", type: "Transfert", product: "Clavier Mécanique", quantity: 15, date: "2024-04-15 10:10", source: "Entrepôt Nord", destination: "Entrepôt Rabat", comment: "Demande de Rabat", agent: "Sara M." },
  { id: "M-1007", type: "Sortie", product: "Imprimante Laser", quantity: 1, date: "2024-04-16 15:30", source: "Entrepôt Central", destination: "-", comment: "Vente client #4105", agent: "Karim L." },
];

export const mockAlerts = [
  { id: "AL-501", message: "Rupture de stock imminente", level: "Élevé", date: "2024-04-15", status: "En attente", product: "Imprimante Laser", warehouse: "Entrepôt Central", currentQuantity: 0 },
  { id: "AL-502", message: "Stock faible (seuil critique)", level: "Moyenne", date: "2024-04-16", status: "En cours de réappro", product: "Cartouche Encre Noire", warehouse: "Entrepôt Rabat", currentQuantity: 12 },
  { id: "AL-503", message: "Capacité entrepôt atteinte", level: "Élevé", date: "2024-04-17", status: "Non traité", product: "Multiple", warehouse: "Entrepôt Rabat", currentQuantity: 1950 },
  { id: "AL-504", message: "Rotation lente détectée", level: "Faible", date: "2024-04-10", status: "Clôturé", product: "Clavier Mécanique", warehouse: "Entrepôt Nord", currentQuantity: 50 },
];

export const mockAgents = [
  { id: "U-001", firstName: "Ahmed", lastName: "Radi", email: "ahmed.radi@compagnie.ma", role: "Admin", status: "Actif", lastActivity: "2024-04-17 08:30" },
  { id: "U-002", firstName: "Sara", lastName: "Mernissi", email: "sara.mernissi@compagnie.ma", role: "Gestionnaire", status: "Actif", lastActivity: "2024-04-17 09:15" },
  { id: "U-003", firstName: "Karim", lastName: "Lahlou", email: "karim.lahlou@compagnie.ma", role: "Agent", status: "Inactif", lastActivity: "2024-04-10 17:45" },
  { id: "U-004", firstName: "Leila", lastName: "Berrada", email: "leila.berrada@compagnie.ma", role: "Gestionnaire", status: "Actif", lastActivity: "2024-04-16 14:20" },
];

export const mockTraceability = [
  { id: "TR-9001", action: "Connexion utilisateur", date: "2024-04-17 08:30:15", details: "IP: 192.168.1.45, Succès", user: "Ahmed Radi" },
  { id: "TR-9002", action: "Création Produit", date: "2024-04-17 08:45:22", details: "ID: P008, Nom: Casque Audio", user: "Ahmed Radi" },
  { id: "TR-9003", action: "Validation Transfert", date: "2024-04-17 09:15:00", details: "Mvt: M-1006, Src: Nord, Dst: Rabat", user: "Sara Mernissi" },
  { id: "TR-9004", action: "Modification Entrepôt", date: "2024-04-17 10:05:11", details: "ID: W03, Update Capacité", user: "Ahmed Radi" },
  { id: "TR-9005", action: "Échec Connexion", date: "2024-04-17 11:20:45", details: "IP: 10.0.0.12, Mauvais mot de passe", user: "Inconnu" },
];

export const mockCategories = [
  { id: "CAT-001", name: "Électronique", description: "Appareils électroniques et ordinateurs", createdAt: "2023-10-01" },
  { id: "CAT-002", name: "Accessoires", description: "Câbles, souris, claviers", createdAt: "2023-10-15" },
  { id: "CAT-003", name: "Périphériques", description: "Imprimantes, scanners, moniteurs", createdAt: "2023-11-20" },
  { id: "CAT-004", name: "Consommables", description: "Cartouches, papier, toners", createdAt: "2024-01-05" },
  { id: "CAT-005", name: "Composants", description: "Disques, RAM, processeurs", createdAt: "2024-02-11" }
];

export const mockStocks = [
  { id: "STK-001", product: "Ordinateur Portable Pro", quantity: 100, warehouse: "Entrepôt Central", updatedAt: "2024-04-10 10:30" },
  { id: "STK-002", product: "Ordinateur Portable Pro", quantity: 45, warehouse: "Entrepôt Nord", updatedAt: "2024-04-05 14:00" },
  { id: "STK-003", product: "Souris Sans Fil", quantity: 130, warehouse: "Entrepôt Rabat", updatedAt: "2024-04-11 14:15" },
  { id: "STK-004", product: "Souris Sans Fil", quantity: 300, warehouse: "Entrepôt Central", updatedAt: "2024-03-22 09:20" },
  { id: "STK-005", product: "Écran 27 pouces", quantity: 50, warehouse: "Entrepôt Central", updatedAt: "2024-04-12 09:00" },
  { id: "STK-006", product: "Écran 27 pouces", quantity: 35, warehouse: "Entrepôt Nord", updatedAt: "2024-04-12 09:00" },
  { id: "STK-007", product: "Imprimante Laser", quantity: 0, warehouse: "Entrepôt Central", updatedAt: "2024-04-16 15:30" },
  { id: "STK-008", product: "Clavier Mécanique", quantity: 15, warehouse: "Entrepôt Rabat", updatedAt: "2024-04-15 10:10" }
];
