import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Layers, Search, Plus, X, Eye, Edit, Trash2, Package, Download } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { stocksApi } from "../api/stocks";
import { produitsApi } from "../api/produits";
import { entrepotsApi } from "../api/entrepots";
import { TableSkeleton } from "../components/ui/skeleton";

const Modal = ({ isOpen, onClose, title, subtitle, children, onSave, saveLabel = "Enregistrer" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border/60 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b bg-surface/30">
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-foreground/55 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface transition-colors text-foreground/50 hover:text-foreground ml-4">
            <X size={17} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {onSave && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-surface/20">
            <Button variant="outline" onClick={onClose} className="h-9">Annuler</Button>
            <Button onClick={onSave} className="h-9 bg-primary text-primary-foreground">{saveLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground/80">
      {label}{required && <span className="text-destructive ml-1">*</span>}
    </label>
    {children}
  </div>
);

const InfoRow = ({ label, value, highlight }) => (
  <div className="bg-surface/40 rounded-xl px-4 py-3">
    <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-sm font-semibold ${highlight ? 'text-primary' : ''}`}>{value ?? "—"}</p>
  </div>
);

const selectClass = "flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function Stocks() {
  const { can } = usePermissions();
  const [stocks,     setStocks]     = useState([]);
  const [products,   setProducts]   = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("Tous");
  const [isAddOpen,  setIsAddOpen]  = useState(false);
  const [formData,   setFormData]   = useState({ produit_id: "", entrepot_id: "", quantite: "" });
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    Promise.all([stocksApi.list(), produitsApi.list(), entrepotsApi.list()])
      .then(([s, p, e]) => { setStocks(s); setProducts(p); setWarehouses(e); })
      .finally(() => setLoading(false));
  }, []);

  const warehouseOptions = ["Tous", ...warehouses.map(w => w.nomEntrepot)];

  const filteredStocks = stocks.filter(s => {
    const productName   = s.produit?.nomProduit || "";
    const warehouseName = s.entrepot?.nomEntrepot || "";
    const matchSearch   = productName.toLowerCase().includes(searchTerm.toLowerCase()) || String(s.id).includes(searchTerm);
    const matchWarehouse = warehouseFilter === "Tous" || warehouseName === warehouseFilter;
    return matchSearch && matchWarehouse;
  });

  const totalPages      = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSaveAdd = async () => {
    if (!formData.produit_id || !formData.entrepot_id || formData.quantite === "")
      return toast.error("Tous les champs sont obligatoires.");
    if (parseInt(formData.quantite) < 0)
      return toast.error("La quantité ne peut pas être négative.");
    setSaving(true);
    try {
      const created = await stocksApi.create({
        produit_id:    parseInt(formData.produit_id),
        entrepot_id:   parseInt(formData.entrepot_id),
        quantite:      parseInt(formData.quantite),
        dateMiseAJour: new Date().toISOString().split("T")[0],
      });
      setStocks([created, ...stocks]);
      setIsAddOpen(false);
      setFormData({ produit_id: "", entrepot_id: "", quantite: "" });
      toast.success("Stock créé avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création.");
    } finally { setSaving(false); }
  };

  const handleSaveEdit = async () => {
    const newQty = parseInt(selectedStock.quantite);
    if (isNaN(newQty) || newQty < 0)
      return toast.error("La quantité à définir doit être supérieure ou égale à 0.");
    setSaving(true);
    try {
      const updated = await stocksApi.update(selectedStock.id, {
        quantite:    newQty,
        produit_id:  selectedStock.produit_id  || selectedStock.produit?.id,
        entrepot_id: selectedStock.entrepot_id || selectedStock.entrepot?.id,
      });
      setStocks(stocks.map(s => s.id === updated.id ? updated : s));
      setIsEditOpen(false);
      toast.success("Stock mis à jour avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally { setSaving(false); }
  };

  const handleExport = () => {
    const headers = ["ID", "Produit", "Entrepôt", "Quantité", "Mise à jour"];
    const rows = stocks.map(s => [
      s.id,
      `"${s.produit?.nomProduit || ""}"`,
      `"${s.entrepot?.nomEntrepot || ""}"`,
      s.quantite,
      s.dateMiseAJour || "",
    ]);
    const csv  = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "stocks.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce stock ?")) return;
    try {
      await stocksApi.delete(id);
      setStocks(stocks.filter(s => s.id !== id));
      toast.success("Stock supprimé avec succès.");
    } catch { toast.error("Erreur lors de la suppression."); }
  };

  if (loading) return <TableSkeleton rows={5} cols={6} />;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Layers className="h-8 w-8" /> Stock Actuel
          </h2>
          <p className="text-foreground/60">Consultez le niveau des stocks par entrepôt.</p>
        </div>
        <div className="flex gap-2">
          {can.exportStocks && (
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download size={16} /> Exporter
            </Button>
          )}
          {can.manageStocks && (
            <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
              <Plus size={16} /> Nouveau Stock
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input placeholder="Rechercher par produit..." className="pl-9 bg-surface/30 w-full"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-9 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border"
              value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
              {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Mise à jour</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStocks.map(stock => (
                <TableRow key={stock.id}>
                  <TableCell className="font-mono text-xs text-foreground/50">{stock.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package size={13} className="text-primary" />
                      </div>
                      <span className="font-semibold text-primary">{stock.produit?.nomProduit || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/70">{stock.entrepot?.nomEntrepot || "—"}</TableCell>
                  <TableCell>
                    <span className={`font-bold text-base ${stock.quantite === 0 ? 'text-destructive' : stock.quantite <= 15 ? 'text-amber-600' : 'text-primary'}`}>
                      {stock.quantite}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-foreground/50">{stock.dateMiseAJour || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:bg-secondary/10"
                        onClick={() => { setSelectedStock(stock); setIsViewOpen(true); }}>
                        <Eye size={14} />
                      </Button>
                      {can.manageStocks && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => { setSelectedStock({ ...stock }); setIsEditOpen(true); }}>
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(stock.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedStocks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-foreground/40">Aucun stock trouvé</TableCell>
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

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouveau stock"
        subtitle="Associez un produit à un entrepôt"
        onSave={handleSaveAdd} saveLabel={saving ? "..." : "Enregistrer"}>
        <div className="space-y-4">
          <Field label="Produit" required>
            <select className={selectClass} value={formData.produit_id}
              onChange={e => setFormData({ ...formData, produit_id: e.target.value })}>
              <option value="" disabled>Sélectionner un produit...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.nomProduit}</option>)}
            </select>
          </Field>
          <Field label="Entrepôt" required>
            <select className={selectClass} value={formData.entrepot_id}
              onChange={e => setFormData({ ...formData, entrepot_id: e.target.value })}>
              <option value="" disabled>Sélectionner un entrepôt...</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.nomEntrepot}</option>)}
            </select>
          </Field>
          <Field label="Quantité" required>
            <Input type="number" value={formData.quantite} onChange={e => setFormData({ ...formData, quantite: e.target.value })}
              placeholder="Ex: 50" className="bg-surface/30 h-10" />
          </Field>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier le stock"
        subtitle="Mettez à jour la quantité"
        onSave={handleSaveEdit} saveLabel={saving ? "..." : "Enregistrer"}>
        {selectedStock && (
          <div className="space-y-4">
            <div className="bg-surface/40 rounded-xl px-4 py-3 text-sm">
              <span className="text-foreground/50">Produit: </span>
              <span className="font-semibold">{selectedStock.produit?.nomProduit}</span>
              <span className="text-foreground/50 ml-4">Entrepôt: </span>
              <span className="font-semibold">{selectedStock.entrepot?.nomEntrepot}</span>
            </div>
            <Field label="Quantité" required>
              <Input type="number" value={selectedStock.quantite}
                onChange={e => setSelectedStock({ ...selectedStock, quantite: parseInt(e.target.value) || 0 })}
                className="bg-surface/30 h-10" />
            </Field>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails du stock">
        {selectedStock && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">{selectedStock.produit?.nomProduit}</p>
                <p className="text-sm text-foreground/50">{selectedStock.entrepot?.nomEntrepot}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="ID Stock"          value={selectedStock.id} />
              <InfoRow label="Quantité actuelle" value={selectedStock.quantite} highlight />
              <InfoRow label="Produit"           value={selectedStock.produit?.nomProduit} />
              <InfoRow label="Entrepôt"          value={selectedStock.entrepot?.nomEntrepot} />
              <div className="col-span-2">
                <InfoRow label="Dernière mise à jour" value={selectedStock.dateMiseAJour} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
