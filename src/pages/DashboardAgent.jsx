import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Package, Factory, ArrowRightLeft, History, Eye, Boxes } from "lucide-react";
import { dashboardApi } from "../api/dashboard";
import { stocksApi } from "../api/stocks";

const quickLinks = [
  { title: "Consulter les produits",  description: "Catalogue et catégories",    icon: Package,  path: "/agent/produits" },
  { title: "Consulter les entrepôts", description: "Capacité et localisation",   icon: Factory,  path: "/agent/entrepot" },
  { title: "Consulter les stocks",    description: "Niveaux par entrepôt",       icon: Boxes,    path: "/agent/stocks" },
  { title: "Historique des transferts", description: "Transferts entre entrepôts", icon: History, path: "/agent/mouvements" },
];

export default function DashboardAgent() {
  const [stats,   setStats]   = useState(null);
  const [stocks,  setStocks]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.stats(), stocksApi.list()])
      .then(([s, stk]) => { setStats(s); setStocks(stk); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-foreground/50">Chargement...</div>;
  if (!stats)  return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Espace Agent</h2>
          <p className="text-foreground/60">Consultez les informations et enregistrez les transferts de stock.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/agent/mouvements">
            <ArrowRightLeft size={16} /> Enregistrer un transfert
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits au catalogue</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProduits}</div>
            <p className="text-xs text-foreground/50">Disponibles à la consultation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrepôts</CardTitle>
            <Factory className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntrepots}</div>
            <p className="text-xs text-foreground/50">Sites de stockage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mouvements</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMouvements}</div>
            <p className="text-xs text-foreground/50">Sur la période en cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Accès rapides */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground/50">Accès rapides</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{link.title}</p>
                      <p className="text-xs text-foreground/50">{link.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Derniers mouvements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Derniers mouvements</CardTitle>
              <CardDescription>Opérations récentes</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/agent/mouvements"><Eye size={14} /> Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats.recentMouvements || []).map(mvt => (
                <div key={mvt.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowRightLeft size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{mvt.produit?.nomProduit || "—"}</p>
                      <p className="text-xs text-foreground/50">
                        {mvt.entrepot_source?.nomEntrepot || "—"} → {mvt.entrepot_destination?.nomEntrepot || "—"} • Qté {mvt.quantite}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-foreground/50 bg-surface/60 px-2 py-1 rounded-lg">
                    {mvt.dateMouvement}
                  </span>
                </div>
              ))}
              {(stats.recentMouvements || []).length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-4">Aucun mouvement récent</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aperçu stock */}
        <Card>
          <CardHeader>
            <CardTitle>Aperçu des stocks</CardTitle>
            <CardDescription>Niveaux actuels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stocks.slice(0, 5).map(stock => (
                <div key={stock.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{stock.produit?.nomProduit || "—"}</p>
                    <p className="text-xs text-foreground/50">{stock.entrepot?.nomEntrepot || "—"}</p>
                  </div>
                  <span className={`font-bold text-sm ${stock.quantite === 0 ? "text-destructive" : stock.quantite <= 15 ? "text-amber-600" : "text-primary"}`}>
                    {stock.quantite}
                  </span>
                </div>
              ))}
              {stocks.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-4">Aucun stock disponible</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
