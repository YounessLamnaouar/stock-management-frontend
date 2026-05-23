import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Package, Factory, ArrowRightLeft, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { mockProducts, mockWarehouses, mockMovements, mockAlerts, mockAgents } from "../data/mock";
import { cn } from "../lib/utils";

const activityData = [
  { name: 'Lun', entrees: 4000, sorties: 2400 },
  { name: 'Mar', entrees: 3000, sorties: 1398 },
  { name: 'Mer', entrees: 2000, sorties: 9800 },
  { name: 'Jeu', entrees: 2780, sorties: 3908 },
  { name: 'Ven', entrees: 1890, sorties: 4800 },
  { name: 'Sam', entrees: 2390, sorties: 3800 },
  { name: 'Dim', entrees: 3490, sorties: 4300 },
];

const pieData = [
  { name: 'Entrées', value: 400 },
  { name: 'Sorties', value: 300 },
  { name: 'Transferts', value: 300 },
];

const COLORS = ['#718355', '#97A97C', '#CFE1B9'];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Vue d'ensemble</h2>
          <p className="text-foreground/60">Gérez vos stocks et surveillez vos activités.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
            <p className="text-xs text-foreground/50">+2 depuis hier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrepôts Actifs</CardTitle>
            <Factory className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockWarehouses.length}</div>
            <p className="text-xs text-foreground/50">Capacité totale: 17,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements (Semaine)</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-secondary flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +14% par rapport à la sem. pro.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Alertes Actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{mockAlerts.filter(a => a.status !== "Clôturé").length}</div>
            <p className="text-xs text-foreground/50">2 critiques nécessitant action</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Mouvements (7 derniers jours)</CardTitle>
            <CardDescription>Aperçu des entrées et sorties</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEntrees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#718355" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#718355" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSorties" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#97A97C" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#97A97C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="entrees" stroke="#718355" fillOpacity={1} fill="url(#colorEntrees)" />
                  <Area type="monotone" dataKey="sorties" stroke="#97A97C" fillOpacity={1} fill="url(#colorSorties)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Répartition des Opérations</CardTitle>
            <CardDescription>Aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary"></div>Entrées</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-accent"></div>Sorties</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-surface"></div>Transferts</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dernières Alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAlerts.slice(0, 4).map(alerte => (
                <div key={alerte.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full", 
                      alerte.level === 'Élevé' ? 'bg-destructive' : alerte.level === 'Moyenne' ? 'bg-amber-500' : 'bg-primary'
                    )}></div>
                    <div>
                      <p className="text-sm font-medium">{alerte.message}</p>
                      <p className="text-xs text-foreground/50">{alerte.product} • {alerte.warehouse}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{alerte.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMovements.slice(0, 4).map(mvt => (
                <div key={mvt.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface flex items-center justify-center text-primary">
                      {mvt.type === 'Entrée' ? <TrendingUp size={16} /> : mvt.type === 'Sortie' ? <ArrowRightLeft size={16} /> : <Package size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{mvt.type} - {mvt.product}</p>
                      <p className="text-xs text-foreground/50">Qte: {mvt.quantity} • {mvt.agent}</p>
                    </div>
                  </div>
                  <span className="text-xs text-foreground/50 bg-muted/30 px-2 py-1 rounded">{mvt.date.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
