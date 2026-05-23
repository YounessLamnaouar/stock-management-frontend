import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Package, Factory, ArrowRightLeft, History, Eye, Download, Boxes } from "lucide-react";
import { mockProducts, mockWarehouses, mockMovements, mockStocks } from "../data/mock";

const quickLinks = [
  { title: "Consulter les produits", description: "Catalogue et catégories", icon: Package, path: "/agent/produits" },
  { title: "Consulter les entrepôts", description: "Capacité et localisation", icon: Factory, path: "/agent/entrepot" },
  { title: "Consulter les stocks", description: "Niveaux par entrepôt", icon: Boxes, path: "/agent/stocks" },
  { title: "Historique des transferts", description: "Transferts entre entrepôts", icon: History, path: "/agent/mouvements" },
];

export default function DashboardAgent() {
  const transferts = mockMovements.filter(m => m.type === "Transfert").slice(0, 3);

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
            <div className="text-2xl font-bold">{mockProducts.length}</div>
            <p className="text-xs text-foreground/50">Disponibles à la consultation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrepôts</CardTitle>
            <Factory className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockWarehouses.length}</div>
            <p className="text-xs text-foreground/50">Sites de stockage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferts enregistrés</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMovements.filter(m => m.type === "Transfert").length}</div>
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
        {/* Derniers transferts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mes derniers transferts</CardTitle>
              <CardDescription>Opérations récentes</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/agent/mouvements"><Eye size={14} /> Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transferts.map(mvt => (
                <div key={mvt.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowRightLeft size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{mvt.product}</p>
                      <p className="text-xs text-foreground/50">
                        {mvt.source} → {mvt.destination} • Qté {mvt.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-foreground/50 bg-surface/60 px-2 py-1 rounded-lg">
                    {mvt.date.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Aperçu stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Aperçu des stocks</CardTitle>
              <CardDescription>Niveaux actuels</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={14} /> Exporter
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStocks.slice(0, 4).map(stock => (
                <div key={stock.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{stock.product}</p>
                    <p className="text-xs text-foreground/50">{stock.warehouse}</p>
                  </div>
                  <span className={stock.quantity === 0 ? "font-bold text-destructive" : "font-bold text-primary"}>
                    {stock.quantity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
