import { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Layers, Search, Plus, X, Eye, Edit, Trash2, Package } from "lucide-react";
import { mockStocks, mockWarehouses, mockProducts } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";

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

export default function Stocks() {
  const { can } = usePermissions();
  const [stocks, setStocks] = useState(mockStocks);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("Tous");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ product: "", warehouse: "", quantity: "" });
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const warehouses = ["Tous", ...mockWarehouses.map(w => w.name)];

  const filteredStocks = stocks.filter(s => {
    const matchSearch = s.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchWarehouse = warehouseFilter === "Tous" || s.warehouse === warehouseFilter;
    return matchSearch && matchWarehouse;
  });

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSaveAdd = () => {
    if (!formData.product || !formData.warehouse || !formData.quantity)
      return alert("Tous les champs sont obligatoires.");
    setStocks([{
      id: `STK-${Date.now().toString().slice(-3)}`,
      product: formData.product,
      warehouse: formData.warehouse,
      quantity: parseInt(formData.quantity, 10),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }, ...stocks]);
    setIsAddOpen(false);
    setFormData({ product: "", warehouse: "", quantity: "" });
  };

  const handleSaveEdit = () => {
    if (!selectedStock.product || !selectedStock.warehouse) return alert("Champs obligatoires manquants.");
    setStocks(stocks.map(s => s.id === selectedStock.id
      ? { ...selectedStock, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
      : s
    ));
    setIsEditOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer ce stock ?")) setStocks(stocks.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Layers className="h-8 w-8" /> Stock Actuel
          </h2>
          <p className="text-foreground/60">Consultez le niveau des stocks par entrepôt.</p>
        </div>
        {can.manageStocks && (
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Nouveau Stock
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3 border-b space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input placeholder="Rechercher par produit ou ID..." className="pl-9 bg-surface/30 w-full"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-9 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border"
              value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}>
              {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Stock</TableHead>
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
                      <span className="font-semibold text-primary">{stock.product}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/70">{stock.warehouse}</TableCell>
                  <TableCell>
                    <span className={`font-bold text-base ${stock.quantity === 0 ? 'text-destructive' : stock.quantity <= 15 ? 'text-amber-600' : 'text-primary'}`}>
                      {stock.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-foreground/50">{stock.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:bg-secondary/10"
                        onClick={() => { setSelectedStock(stock); setIsViewOpen(true); }}>
                        <Eye size={14} />
                      </Button>
                      {can.manageStocks && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => { setSelectedStock(stock); setIsEditOpen(true); }}>
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
        subtitle="Associez un produit à un entrepôt" onSave={handleSaveAdd}>
        <div className="space-y-4">
          <Field label="Produit" required>
            <select className="flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })}>
              <option value="" disabled>Sélectionner un produit...</option>
              {mockProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Entrepôt" required>
            <select className="flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.warehouse} onChange={e => setFormData({ ...formData, warehouse: e.target.value })}>
              <option value="" disabled>Sélectionner un entrepôt...</option>
              {mockWarehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </Field>
          <Field label="Quantité" required>
            <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Ex: 50" className="bg-surface/30 h-10" />
          </Field>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier le stock"
        subtitle="Mettez à jour la quantité" onSave={handleSaveEdit}>
        {selectedStock && (
          <div className="space-y-4">
            <Field label="Produit" required>
              <select className="flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedStock.product} onChange={e => setSelectedStock({ ...selectedStock, product: e.target.value })}>
                {mockProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Entrepôt" required>
              <select className="flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedStock.warehouse} onChange={e => setSelectedStock({ ...selectedStock, warehouse: e.target.value })}>
                {mockWarehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              </select>
            </Field>
            <Field label="Quantité" required>
              <Input type="number" value={selectedStock.quantity}
                onChange={e => setSelectedStock({ ...selectedStock, quantity: parseInt(e.target.value) || 0 })}
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
                <p className="font-semibold text-base">{selectedStock.product}</p>
                <p className="text-sm text-foreground/50">{selectedStock.warehouse}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="ID Stock" value={selectedStock.id} />
              <InfoRow label="Quantité actuelle" value={selectedStock.quantity} highlight />
              <InfoRow label="Produit" value={selectedStock.product} />
              <InfoRow label="Entrepôt" value={selectedStock.warehouse} />
              <div className="col-span-2">
                <InfoRow label="Dernière mise à jour" value={selectedStock.updatedAt} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
