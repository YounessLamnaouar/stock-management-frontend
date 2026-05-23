import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Plus, Search, MapPin, Package, Eye, Edit, Trash2, X } from "lucide-react";
import { mockWarehouses, mockStocks } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";

// Generic Modal Wrapper
const Modal = ({ isOpen, onClose, title, children, onSave }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl bg-background shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-3 shrink-0">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
        </CardHeader>
        <CardContent className="pt-4 overflow-y-auto">
          {children}
          {onSave && (
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>Annuler</Button>
              <Button onClick={onSave} className="bg-primary text-primary-foreground">Enregistrer</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function Warehouses() {
  const { can } = usePermissions();
  const [warehouses, setWarehouses] = useState(mockWarehouses);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedWarehouseForStock, setSelectedWarehouseForStock] = useState(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "", description: "", capacity: "" });

  const filtered = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if(window.confirm("Supprimer cet entrepôt ?")) {
      setWarehouses(warehouses.filter(w => w.id !== id));
    }
  };

  const handleSaveEdit = () => {
    setWarehouses(warehouses.map(w => w.id === selectedWarehouse.id ? selectedWarehouse : w));
    setIsEditOpen(false);
  };

  const handleConsultStock = (w) => {
    setSelectedWarehouseForStock(w);
    setIsStockModalOpen(true);
  };

  const handleSaveAdd = () => {
    if(!formData.name || !formData.address || !formData.capacity) return alert("Remplissez les champs obligatoires.");
    setWarehouses([{
      id: `W-${Date.now().toString().slice(-4)}`,
      status: "Actif",
      currentStock: 0,
      ...formData
    }, ...warehouses]);
    setIsAddOpen(false);
    setFormData({ name: "", address: "", description: "", capacity: "" });
  };



  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Entrepôts</h2>
          <p className="text-foreground/60">
            {can.manageWarehouses
              ? "Gérez vos espaces de stockage et surveillez leur capacité."
              : "Consultez vos espaces de stockage et leur capacité."}
          </p>
        </div>
        {can.manageWarehouses && (
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Ajouter un entrepôt
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
          <Input
            placeholder="Rechercher un entrepôt..."
            className="pl-9 bg-surface/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((warehouse) => {
          const occupancy = (warehouse.currentStock / warehouse.capacity) * 100;
          return (
            <Card key={warehouse.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className={`h-2 ${warehouse.status === 'Saturé' ? 'bg-destructive' : 'bg-primary'}`}></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={warehouse.status === 'Actif' ? 'success' : 'destructive'}>{warehouse.status}</Badge>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {warehouse.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/60">Capacité utilisée</span>
                    <span className="font-medium text-primary">{Math.round(occupancy)}%</span>
                  </div>
                  <div className="w-full bg-surface relative h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full ${occupancy > 90 ? 'bg-destructive' : 'bg-secondary'}`}
                      style={{ width: `${occupancy}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t text-foreground/60">
                    <span className="flex items-center gap-1"><Package size={14}/> {warehouse.currentStock} stockés</span>
                    <span>Max: {warehouse.capacity}</span>
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                     <Button className="w-full" variant="outline" size="sm" onClick={() => handleConsultStock(warehouse)}>
                       Consulter Stock
                     </Button>
                     {can.manageWarehouses && (
                       <div className="flex gap-2 justify-end mt-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary" onClick={() => { setSelectedWarehouse(warehouse); setIsViewOpen(true); }}>
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setSelectedWarehouse(warehouse); setIsEditOpen(true); }}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(warehouse.id)}>
                            <Trash2 size={16} />
                          </Button>
                       </div>
                     )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Stock Modal */}
      <Modal 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
        title={`Stock - ${selectedWarehouseForStock?.name}`}
      >
        <p className="mb-4 text-sm text-foreground/70">Aperçu dynamique du stock assigné à cet entrepôt.</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Mise à jour</TableHead>
              <TableHead>Qté</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStocks.filter(s => s.warehouse === selectedWarehouseForStock?.name).map((stock) => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">{stock.product}</TableCell>
                <TableCell className="text-xs text-foreground/60">{stock.updatedAt}</TableCell>
                <TableCell className="font-bold">{stock.quantity}</TableCell>
              </TableRow>
            ))}
            {mockStocks.filter(s => s.warehouse === selectedWarehouseForStock?.name).length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-foreground/50">Aucun produit en stock</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Ajouter un entrepôt" onSave={handleSaveAdd}>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">Nom</label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Adresse</label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Description</label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Capacité</label><Input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} /></div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier l'entrepôt" onSave={handleSaveEdit}>
        {selectedWarehouse && (
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Nom</label><Input value={selectedWarehouse.name} onChange={e => setSelectedWarehouse({...selectedWarehouse, name: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Adresse</label><Input value={selectedWarehouse.address} onChange={e => setSelectedWarehouse({...selectedWarehouse, address: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Capacité</label><Input type="number" value={selectedWarehouse.capacity} onChange={e => setSelectedWarehouse({...selectedWarehouse, capacity: e.target.value})} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={selectedWarehouse.status} onChange={e => setSelectedWarehouse({...selectedWarehouse, status: e.target.value})}>
                <option value="Actif">Actif</option><option value="Saturé">Saturé</option><option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails de l'entrepôt">
        {selectedWarehouse && (
          <div className="space-y-3">
            <p><strong>Nom:</strong> {selectedWarehouse.name}</p>
            <p><strong>Adresse:</strong> {selectedWarehouse.address}</p>
            <p><strong>Statut:</strong> {selectedWarehouse.status}</p>
            <p><strong>Capacité Totale:</strong> {selectedWarehouse.capacity}</p>
            <p><strong>Stock Actuel:</strong> {selectedWarehouse.currentStock}</p>
          </div>
        )}
      </Modal>

    </div>
  );
}
