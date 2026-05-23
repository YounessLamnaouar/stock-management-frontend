import { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, User, TrendingUp, TrendingDown } from "lucide-react";
import { mockTraceability } from "../data/mock";

export default function Traceability() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("Tous");
  const [dateFilter, setDateFilter] = useState("");

  const users = ["Tous", ...new Set(mockTraceability.map(t => t.user))];

  const filtered = mockTraceability.filter(t => {
    const matchSearch = t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchUser = userFilter === "Tous" || t.user === userFilter;
    const matchDate = dateFilter === "" || t.date.startsWith(dateFilter);
    return matchSearch && matchUser && matchDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Traçabilité</h2>
          <p className="text-foreground/60">Suivi des modifications de quantités de stock par utilisateur.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Rechercher un utilisateur, un produit..."
                className="pl-9 bg-surface/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Input type="date" className="h-9 w-40" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
              <select
                className="h-9 rounded-md border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={userFilter} onChange={e => setUserFilter(e.target.value)}
              >
                <option value="" disabled>Utilisateur</option>
                {users.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Ancienne Qté</TableHead>
                <TableHead>Nouvelle Qté</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((trace) => {
                const isIncrease = trace.newQty > trace.oldQty;
                return (
                  <TableRow key={trace.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-primary" />
                        <span className="font-medium">{trace.user}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{trace.product}</TableCell>
                    <TableCell className="font-bold text-foreground/70">{trace.oldQty}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {isIncrease
                          ? <TrendingUp size={14} className="text-primary" />
                          : <TrendingDown size={14} className="text-destructive" />
                        }
                        <span className={`font-bold ${isIncrease ? "text-primary" : "text-destructive"}`}>
                          {trace.newQty}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-foreground/70">{trace.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
