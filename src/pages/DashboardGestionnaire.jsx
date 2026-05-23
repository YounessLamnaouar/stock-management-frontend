import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Package, Layers, ArrowRightLeft, AlertTriangle, PackageMinus } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { mockProducts, mockMovements, mockAlerts, mockStocks, mockWarehouses } from "../data/mock";
import { cn } from "../lib/utils";

const warehouseStockData = mockWarehouses.map(w => ({
  name: w.name.replace('Entrepôt ', ''),
  stock: w.currentStock,
  capacite: w.capacity,
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border rounded-xl px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="text-foreground/70">{p.name}:</span>
            <span className="font-medium">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardGestionnaire() {
  const lowStock = mockStocks.filter(s => s.quantity > 0 && s.quantity <= 15);
  const outOfStock = mockStocks.filter(s => s.quantity === 0);
  const activeAlerts = mockAlerts.filter(a => a.status !== "Clôturé");
  const transferts = mockMovements.filter(m => m.type === "Transfert");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Espace Gestionnaire</h2>
          <p className="text-foreground/60">Pilotez les stocks, les transferts et les alertes de réapprovisionnement.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/gestionnaire/mouvements">
            <ArrowRightLeft size={16} /> Enregistrer un transfert
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Références suivies</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
            <p className="text-xs text-foreground/50">Produits actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lignes de stock</CardTitle>
            <Layers className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStocks.length}</div>
            <p className="text-xs text-foreground/50">Réparties sur {mockWarehouses.length} entrepôts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <PackageMinus className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStock.length}</div>
            <p className="text-xs text-foreground/50">À réapprovisionner</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Ruptures</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStock.length}</div>
            <p className="text-xs text-foreground/50">Action immédiate requise</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        {/* Stock par entrepôt */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Stock par entrepôt</CardTitle>
            <CardDescription>Stock actuel vs capacité totale</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseStockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFE1B9" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Bar dataKey="stock" name="Stock actuel" fill="#718355" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="capacite" name="Capacité" fill="#CFE1B9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alertes */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Alertes à traiter</CardTitle>
            <CardDescription>{activeAlerts.length} alerte(s) active(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAlerts.map(alerte => (
                <div key={alerte.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full shrink-0",
                      alerte.level === "Élevé" ? "bg-destructive" : alerte.level === "Moyenne" ? "bg-amber-500" : "bg-primary"
                    )} />
                    <div>
                      <p className="text-sm font-medium">{alerte.message}</p>
                      <p className="text-xs text-foreground/50">{alerte.product} • {alerte.warehouse}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{alerte.level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Derniers transferts */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers transferts</CardTitle>
          <CardDescription>Opérations de transfert récentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transferts.slice(0, 5).map(mvt => (
              <div key={mvt.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <ArrowRightLeft size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{mvt.product}</p>
                    <p className="text-xs text-foreground/50">
                      {mvt.source} → {mvt.destination} • Qté: {mvt.quantity} • {mvt.agent}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-foreground/50 bg-surface/60 px-2 py-1 rounded-lg">
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
