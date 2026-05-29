import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Package, Factory, ArrowRightLeft, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardApi } from "../api/dashboard";
import { DashboardSkeleton } from "../components/ui/skeleton";

const COLORS = ['#718355', '#97A97C', '#CFE1B9', '#B5C99A', '#87986A'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill || p.stroke || p.color }} />
          <span className="text-foreground/70">{p.name}:</span>
          <span className="font-medium">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!stats)  return null;

  const warehouseStockData = (stats.stockParEntrepot || []).map(w => ({
    name:        w.name,
    stock:       w.stock,
    capaciteMax: w.capaciteMax,
  }));

  const categoryData      = stats.produitsParCategorie || [];
  const mouvementsParJour = stats.mouvementsParJour || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Vue d'ensemble</h2>
        <p className="text-foreground/60">Gérez vos stocks et surveillez vos activités.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProduits}</div>
            <p className="text-xs text-foreground/50">{stats.totalEntrepots} entrepôts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrepôts Actifs</CardTitle>
            <Factory className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntrepots}</div>
            <p className="text-xs text-foreground/50">
              Total stock: {warehouseStockData.reduce((s, w) => s + w.stock, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mouvements</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMouvements}</div>
            <p className="text-xs text-foreground/50">Tous les mouvements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Ruptures de Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.ruptures}</div>
            <p className="text-xs text-foreground/50">Stocks à zéro</p>
          </CardContent>
        </Card>
      </div>

      {/* Area chart — Mouvements des 7 derniers jours */}
      <Card>
        <CardHeader>
          <CardTitle>Activité des transferts</CardTitle>
          <CardDescription>Nombre de mouvements par jour (7 derniers jours)</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mouvementsParJour} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradMvt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#718355" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#718355" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFE1B9" />
                <XAxis dataKey="date" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Mouvements" stroke="#718355" strokeWidth={2}
                  fill="url(#gradMvt)" dot={{ r: 4, fill: "#718355" }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar + Pie charts */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Stock par entrepôt</CardTitle>
            <CardDescription>Stock actuel vs capacité maximale</CardDescription>
          </CardHeader>
          <CardContent className="p-0 px-2 pb-4">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseStockData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFE1B9" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Bar dataKey="stock"       name="Stock actuel"      fill="#718355" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="capaciteMax" name="Capacité maximale" fill="#CFE1B9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Produits par catégorie</CardTitle>
            <CardDescription>Répartition du catalogue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    paddingAngle={4} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-foreground/70 truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader><CardTitle>Derniers Mouvements</CardTitle></CardHeader>
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
                      {mvt.entrepot_source?.nomEntrepot || "—"} → {mvt.entrepot_destination?.nomEntrepot || "—"} • Qté: {mvt.quantite}
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
    </div>
  );
}
