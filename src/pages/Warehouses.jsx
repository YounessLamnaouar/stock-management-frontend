import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Plus, Search, MapPin, Eye, Edit, Trash2, X, Factory, BarChart2 } from "lucide-react";
import { entrepotsApi } from "../api/entrepots";
import { stocksApi } from "../api/stocks";
import { usePermissions } from "../hooks/usePermissions";
import { TableSkeleton } from "../components/ui/skeleton";

const Modal = ({ isOpen, onClose, title, subtitle, children, onSave, saveLabel = "Enregistrer", size = "md" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-md'} bg-background rounded-2xl shadow-2xl border border-border/60 overflow-hidden max-h-[90vh] flex flex-col`}>
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

const InfoRow = ({ label, value }) => (
  <div className="bg-surface/40 rounded-xl px-4 py-3">
    <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold">{value ?? "—"}</p>
  </div>
);

export default function Warehouses() {
  const { can } = usePermissions();
  const [warehouses, setWarehouses] = useState([]);
  const [allStocks, setAllStocks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedWarehouseForStock, setSelectedWarehouseForStock] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ nomEntrepot: "", adresse: "", capaciteMax: "" });

  useEffect(() => {
    Promise.all([entrepotsApi.list(), stocksApi.list()])
      .then(([w, s]) => { setWarehouses(w); setAllStocks(s); })
      .finally(() => setLoading(false));
  }, []);

  const getWarehouseStock = (warehouseId) =>
    allStocks.filter(s => s.entrepot_id === warehouseId || s.entrepot?.id === warehouseId)
             .reduce((sum, s) => sum + (s.quantite || 0), 0);

  const getWarehouseStocks = (warehouseId) =>
    allStocks.filter(s => s.entrepot_id === warehouseId || s.entrepot?.id === warehouseId);

  const filtered = warehouses.filter(w =>
    (w.nomEntrepot || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.adresse || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet entrepôt ?")) return;
    try {
      await entrepotsApi.delete(id);
      setWarehouses(warehouses.filter(w => w.id !== id));
      toast.success("Entrepôt supprimé avec succès.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updated = await entrepotsApi.update(selectedWarehouse.id, {
        nomEntrepot: selectedWarehouse.nomEntrepot,
        adresse:     selectedWarehouse.adresse,
        capaciteMax: parseInt(selectedWarehouse.capaciteMax),
      });
      setWarehouses(warehouses.map(w => w.id === updated.id ? updated : w));
      setIsEditOpen(false);
      toast.success("Entrepôt mis à jour avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally { setSaving(false); }
  };

  const handleSaveAdd = async () => {
    if (!formData.nomEntrepot || !formData.adresse || !formData.capaciteMax)
      return toast.error("Remplissez tous les champs obligatoires.");
    setSaving(true);
    try {
      const created = await entrepotsApi.create({
        nomEntrepot: formData.nomEntrepot,
        adresse:     formData.adresse,
        capaciteMax: parseInt(formData.capaciteMax),
      });
      setWarehouses([created, ...warehouses]);
      setIsAddOpen(false);
      setFormData({ nomEntrepot: "", adresse: "", capaciteMax: "" });
      toast.success("Entrepôt créé avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création.");
    } finally { setSaving(false); }
  };

  if (loading) return <TableSkeleton rows={5} cols={4} />;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Entrepôts</h2>
          <p className="text-foreground/60">
            {can.manageWarehouses ? "Gérez vos espaces de stockage et surveillez leur capacité." : "Consultez vos espaces de stockage."}
          </p>
        </div>
        {can.manageWarehouses && (
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Ajouter un entrepôt
          </Button>
        )}
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
        <Input placeholder="Rechercher un entrepôt..." className="pl-9 bg-surface/30"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(warehouse => {
          const currentStock = getWarehouseStock(warehouse.id);
          const occupancy    = warehouse.capaciteMax > 0 ? (currentStock / warehouse.capaciteMax) * 100 : 0;
          const isFull       = occupancy >= 90;
          return (
            <Card key={warehouse.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-1.5 ${isFull ? 'bg-destructive' : 'bg-primary'}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Factory size={17} className="text-primary" />
                    </div>
                    <CardTitle className="text-base">{warehouse.nomEntrepot}</CardTitle>
                  </div>
                  <Badge variant={isFull ? 'destructive' : 'success'} className="text-xs">
                    {isFull ? 'Saturé' : 'Actif'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5 mt-2 text-xs">
                  <MapPin size={12} /> {warehouse.adresse}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground/60">Capacité utilisée</span>
                      <span className={`font-semibold ${isFull ? 'text-destructive' : 'text-primary'}`}>
                        {Math.round(occupancy)}%
                      </span>
                    </div>
                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isFull ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-foreground/50 mt-1.5">
                      <span>{currentStock.toLocaleString()} stockés</span>
                      <span>Max: {warehouse.capaciteMax?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-full gap-2"
                      onClick={() => { setSelectedWarehouseForStock(warehouse); setIsStockModalOpen(true); }}>
                      <BarChart2 size={14} /> Consulter le stock
                    </Button>
                    {can.manageWarehouses && (
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:bg-secondary/10"
                          onClick={() => { setSelectedWarehouse(warehouse); setIsViewOpen(true); }}>
                          <Eye size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={() => { setSelectedWarehouse({ ...warehouse }); setIsEditOpen(true); }}>
                          <Edit size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(warehouse.id)}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-foreground/40">Aucun entrepôt trouvé</div>
        )}
      </div>

      {/* Stock Modal */}
      <Modal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)}
        title={`Stock — ${selectedWarehouseForStock?.nomEntrepot}`}
        subtitle="Produits actuellement stockés" size="lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Mise à jour</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getWarehouseStocks(selectedWarehouseForStock?.id).map(stock => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">{stock.produit?.nomProduit || "—"}</TableCell>
                <TableCell className="text-xs text-foreground/60">{stock.dateMiseAJour || "—"}</TableCell>
                <TableCell className={`text-right font-bold ${stock.quantite === 0 ? 'text-destructive' : 'text-primary'}`}>
                  {stock.quantite}
                </TableCell>
              </TableRow>
            ))}
            {getWarehouseStocks(selectedWarehouseForStock?.id).length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-foreground/40">Aucun produit en stock</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouvel entrepôt"
        subtitle="Renseignez les informations de l'entrepôt"
        onSave={handleSaveAdd} saveLabel={saving ? "..." : "Enregistrer"}>
        <div className="space-y-4">
          <Field label="Nom de l'entrepôt" required>
            <Input value={formData.nomEntrepot} onChange={e => setFormData({ ...formData, nomEntrepot: e.target.value })}
              placeholder="Ex: Entrepôt Sud" className="bg-surface/30 h-10" />
          </Field>
          <Field label="Adresse" required>
            <Input value={formData.adresse} onChange={e => setFormData({ ...formData, adresse: e.target.value })}
              placeholder="Zone industrielle, Ville" className="bg-surface/30 h-10" />
          </Field>
          <Field label="Capacité maximale" required>
            <Input type="number" value={formData.capaciteMax} onChange={e => setFormData({ ...formData, capaciteMax: e.target.value })}
              placeholder="Ex: 5000" className="bg-surface/30 h-10" />
          </Field>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier l'entrepôt"
        subtitle="Mettez à jour les informations"
        onSave={handleSaveEdit} saveLabel={saving ? "..." : "Enregistrer"}>
        {selectedWarehouse && (
          <div className="space-y-4">
            <Field label="Nom de l'entrepôt" required>
              <Input value={selectedWarehouse.nomEntrepot || ""}
                onChange={e => setSelectedWarehouse({ ...selectedWarehouse, nomEntrepot: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>
            <Field label="Adresse" required>
              <Input value={selectedWarehouse.adresse || ""}
                onChange={e => setSelectedWarehouse({ ...selectedWarehouse, adresse: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>
            <Field label="Capacité maximale" required>
              <Input type="number" value={selectedWarehouse.capaciteMax || ""}
                onChange={e => setSelectedWarehouse({ ...selectedWarehouse, capaciteMax: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails de l'entrepôt">
        {selectedWarehouse && (() => {
          const currentStock = getWarehouseStock(selectedWarehouse.id);
          const occupancy    = selectedWarehouse.capaciteMax > 0 ? (currentStock / selectedWarehouse.capaciteMax) * 100 : 0;
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Factory size={22} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base">{selectedWarehouse.nomEntrepot}</p>
                  <p className="text-sm text-foreground/50">{selectedWarehouse.adresse}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Capacité maximale" value={selectedWarehouse.capaciteMax?.toLocaleString()} />
                <InfoRow label="Stock actuel"      value={currentStock.toLocaleString()} />
                <InfoRow label="Occupation"        value={`${Math.round(occupancy)}%`} />
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
