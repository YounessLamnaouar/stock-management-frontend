import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, User, TrendingUp, TrendingDown } from "lucide-react";
import { tracabilitesApi } from "../api/tracabilites";

export default function Traceability() {
  const [traces,     setTraces]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    tracabilitesApi.list().then(setTraces).finally(() => setLoading(false));
  }, []);

  const filtered = traces.filter(t => {
    const userName   = t.user ? `${t.user.prenom || ""} ${t.user.name || ""}`.trim() : "";
    const productName = t.produit?.nomProduit || "";
    const matchSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = dateFilter === "" || (t.dateAction || "").startsWith(dateFilter);
    return matchSearch && matchDate;
  });

  const totalPages      = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTraces = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex items-center justify-center h-64 text-foreground/50">Chargement...</div>;

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
              <Input placeholder="Rechercher un utilisateur, un produit..."
                className="pl-9 bg-surface/30" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <Input type="date" className="h-9 w-40" value={dateFilter}
                onChange={e => setDateFilter(e.target.value)} />
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
              {paginatedTraces.map((trace) => {
                const isIncrease = (trace.nouvelleQuantite || 0) > (trace.ancienneQuantite || 0);
                const userName   = trace.user ? `${trace.user.prenom || ""} ${trace.user.name || ""}`.trim() : "—";
                return (
                  <TableRow key={trace.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-primary" />
                        <span className="font-medium">{userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{trace.produit?.nomProduit || "—"}</TableCell>
                    <TableCell className="font-bold text-foreground/70">{trace.ancienneQuantite ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {isIncrease
                          ? <TrendingUp size={14} className="text-primary" />
                          : <TrendingDown size={14} className="text-destructive" />
                        }
                        <span className={`font-bold ${isIncrease ? "text-primary" : "text-destructive"}`}>
                          {trace.nouvelleQuantite ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-foreground/70">
                      {trace.dateAction?.replace("T", " ").slice(0, 16) || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedTraces.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-foreground/40">Aucune trace trouvée</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-foreground/60">Page {currentPage} sur {totalPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(c => Math.max(1, c - 1))} disabled={currentPage === 1}>Précédent</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} disabled={currentPage === totalPages}>Suivant</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
