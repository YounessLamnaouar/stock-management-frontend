import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Package, Factory, ArrowRightLeft, AlertTriangle, TrendingUp } from "lucide-react";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { mockProducts, mockWarehouses, mockMovements, mockAlerts, mockCategories } from "../data/mock";
import { cn } from "../lib/utils";

/* ─── static chart data ─── */
const weeklyStockData = [
  { name: 'Lun', Central: 7200, Nord: 1100, Rabat: 1920 },
  { name: 'Mar', Central: 7350, Nord: 1150, Rabat: 1930 },
  { name: 'Mer', Central: 7100, Nord: 1200, Rabat: 1940 },
  { name: 'Jeu', Central: 7400, Nord: 1250, Rabat: 1950 },
  { name: 'Ven', Central: 7500, Nord: 1200, Rabat: 1948 },
  { name: 'Sam', Central: 7450, Nord: 1180, Rabat: 1945 },
  { name: 'Dim', Central: 7500, Nord: 1200, Rabat: 1950 },
];

const warehouseStockData = mockWarehouses.map(w => ({
  name: w.name.replace('Entrepôt ', ''),
  stock: w.currentStock,
  capacite: w.capacity,
}));

const categoryData = Object.entries(
  mockProducts.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {})
).map(([name, value]) => ({ name, value }));

const COLORS = ['#718355', '#97A97C', '#CFE1B9', '#B5C99A', '#87986A'];

/* ─── shared tooltip ─── */
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
  const transferts = mockMovements.filter(m => m.type === "Transfert");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Vue d'ensemble</h2>
        <p className="text-foreground/60">Gérez vos stocks et surveillez vos activités.</p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
            <p className="text-xs text-foreground/50">{mockCategories.length} catégories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrepôts Actifs</CardTitle>
            <Factory className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockWarehouses.length}</div>
            <p className="text-xs text-foreground/50">
              Capacité totale: {mockWarehouses.reduce((s, w) => s + w.capacity, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferts (Total)</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transferts.length}</div>
            <p className="text-xs text-secondary flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Tous les transferts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {mockAlerts.filter(a => a.status !== "Clôturé").length}
            </div>
            <p className="text-xs text-foreground/50">2 critiques nécessitant action</p>
          </CardContent>
        </Card>
      </div>

      {/* ── 1. Area chart ─ full width ── */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution du stock hebdomadaire</CardTitle>
          <CardDescription>Niveaux de stock par entrepôt sur les 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyStockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCentral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#718355" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#718355" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gNord" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#97A97C" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#97A97C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRabat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B5C99A" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#B5C99A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFE1B9" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Area type="monotone" dataKey="Central" name="Central" stroke="#718355" strokeWidth={2} fill="url(#gCentral)" dot={false} />
                <Area type="monotone" dataKey="Nord" name="Nord" stroke="#97A97C" strokeWidth={2} fill="url(#gNord)" dot={false} />
                <Area type="monotone" dataKey="Rabat" name="Rabat" stroke="#B5C99A" strokeWidth={2} fill="url(#gRabat)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Bar + 3. Pie ── */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Bar chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Stock par entrepôt</CardTitle>
            <CardDescription>Stock actuel vs capacité totale</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warehouseStockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CFE1B9" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Bar dataKey="stock" name="Stock actuel" fill="#718355" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="capacite" name="Capacité" fill="#CFE1B9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart */}
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
            <div className="mt-3 space-y-1.5">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-foreground/70">{cat.name}</span>
                  </div>
                  <span className="font-semibold">{cat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom cards ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Dernières Alertes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAlerts.slice(0, 4).map(alerte => (
                <div key={alerte.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full shrink-0",
                      alerte.level === 'Élevé' ? 'bg-destructive' : alerte.level === 'Moyenne' ? 'bg-amber-500' : 'bg-primary'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{alerte.message}</p>
                      <p className="text-xs text-foreground/50">{alerte.product} • {alerte.warehouse}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">{alerte.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Derniers Transferts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transferts.slice(0, 4).map(mvt => (
                <div key={mvt.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <ArrowRightLeft size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{mvt.product}</p>
                      <p className="text-xs text-foreground/50">
                        {mvt.source} → {mvt.destination} • Qté: {mvt.quantity}
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
      </div>
    </div>
  );
}
