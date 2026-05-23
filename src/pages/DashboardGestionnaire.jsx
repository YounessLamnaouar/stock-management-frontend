import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import {
  Package,
  Layers,
  ArrowRightLeft,
  AlertTriangle,
  TrendingUp,
  PackageMinus,
  Boxes,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  mockProducts,
  mockMovements,
  mockAlerts,
  mockStocks,
} from "../data/mock";
import { cn } from "../lib/utils";

const stockByWarehouse = [
  { name: "Central", entrees: 400, sorties: 240 },
  { name: "Nord", entrees: 300, sorties: 139 },
  { name: "Rabat", entrees: 200, sorties: 280 },
];

export default function DashboardGestionnaire() {
  const lowStock = mockStocks.filter((s) => s.quantity > 0 && s.quantity <= 15);
  const outOfStock = mockStocks.filter((s) => s.quantity === 0);
  const activeAlerts = mockAlerts.filter((a) => a.status !== "Clôturé");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Espace Gestionnaire
          </h2>
          <p className="text-foreground/60">
            Pilotez les stocks, les mouvements et les alertes de réapprovisionnement.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/gestionnaire/mouvements">
            <ArrowRightLeft size={16} /> Enregistrer un mouvement
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Références suivies
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
            <p className="text-xs text-foreground/50">Produits actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lignes de stock
            </CardTitle>
            <Layers className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStocks.length}</div>
            <p className="text-xs text-foreground/50">Réparties sur 3 entrepôts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stock faible
            </CardTitle>
            <PackageMinus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {lowStock.length}
            </div>
            <p className="text-xs text-foreground/50">À réapprovisionner</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Ruptures
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {outOfStock.length}
            </div>
            <p className="text-xs text-foreground/50">Action immédiate requise</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        {/* Graphique mouvements par entrepôt */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Flux par entrepôt</CardTitle>
            <CardDescription>Entrées et sorties cette semaine</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stockByWarehouse}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFE1B9" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="entrees" name="Entrées" fill="#718355" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sorties" name="Sorties" fill="#97A97C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alertes à traiter */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Alertes à traiter</CardTitle>
            <CardDescription>
              {activeAlerts.length} alerte(s) active(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAlerts.map((alerte) => (
                <div
                  key={alerte.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        alerte.level === "Élevé"
                          ? "bg-destructive"
                          : alerte.level === "Moyenne"
                          ? "bg-amber-500"
                          : "bg-primary"
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium">{alerte.message}</p>
                      <p className="text-xs text-foreground/50">
                        {alerte.product} • {alerte.warehouse}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{alerte.level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mouvements récents */}
      <Card>
        <CardHeader>
          <CardTitle>Mouvements récents</CardTitle>
          <CardDescription>
            Dernières opérations enregistrées dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMovements.slice(0, 5).map((mvt) => (
              <div
                key={mvt.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface flex items-center justify-center text-primary">
                    {mvt.type === "Entrée" ? (
                      <TrendingUp size={16} />
                    ) : mvt.type === "Sortie" ? (
                      <PackageMinus size={16} />
                    ) : (
                      <Boxes size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {mvt.type} — {mvt.product}
                    </p>
                    <p className="text-xs text-foreground/50">
                      Qté: {mvt.quantity} • {mvt.agent}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-foreground/50 bg-muted/30 px-2 py-1 rounded">
                  {mvt.date.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
