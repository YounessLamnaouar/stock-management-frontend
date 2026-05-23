import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Layers, Search, Plus, X, Eye, Edit, Trash2 } from "lucide-react";
import { mockStocks, mockWarehouses, mockProducts } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";

// Generic Modal Wrapper
const Modal = ({ isOpen, onClose, title, children, onSave }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg bg-background shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
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
    if(!formData.product || !formData.warehouse || !formData.quantity) {
       return alert("Tous les champs (Produit, Entrepôt, Quantité) sont obligatoires.");
    }
    
    setStocks([{
      id: `STK-${Date.now().toString().slice(-3)}`,
      product: formData.product,
      warehouse: formData.warehouse,
      quantity: parseInt(formData.quantity, 10),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }, ...stocks]);
    setIsAddOpen(false);
    setFormData({ product: "", warehouse: "", quantity: "" });
    alert("Stock ajouté avec succès !");
  };

  const handleSaveEdit = () => {
    if(!selectedStock.product || !selectedStock.warehouse || !selectedStock.quantity) {
       return alert("Tous les champs sont obligatoires.");
    }
    setStocks(stocks.map(s => s.id === selectedStock.id ? { ...selectedStock, updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') } : s));
    setIsEditOpen(false);
    alert("Stock modifié avec succès !");
  };

  const handleDelete = (id) => {
    if(window.confirm("Êtes-vous sûr de vouloir supprimer ce stock ?")) {
      setStocks(stocks.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Layers className="h-8 w-8" />
            Stock Actuel
          </h2>
          <p className="text-foreground/60">Consultez en temps réel le niveau des stocks par entrepôt.</p>
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
              <Input
                placeholder="Rechercher par produit ou ID..."
                className="pl-9 bg-surface/30 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select 
                className="h-9 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border"
                value={warehouseFilter} onChange={e => setWarehouseFilter(e.target.value)}
              >
                {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Stock</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Entrepôt</TableHead>
                <TableHead>Quantité Actuelle</TableHead>
                <TableHead>Date de mise à jour</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium text-xs">{stock.id}</TableCell>
                  <TableCell className="font-semibold text-primary">{stock.product}</TableCell>
                  <TableCell>{stock.warehouse}</TableCell>
                  <TableCell className={stock.quantity === 0 ? 'text-destructive font-bold' : 'font-bold'}>{stock.quantity}</TableCell>
                  <TableCell className="text-xs text-foreground/50">{stock.updatedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary" onClick={() => { setSelectedStock(stock); setIsViewOpen(true); }} title="Voir">
                        <Eye size={14} />
                      </Button>
                      {can.manageStocks && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => { setSelectedStock(stock); setIsEditOpen(true); }} title="Modifier">
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(stock.id)} title="Supprimer">
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
                  <TableCell colSpan={5} className="text-center py-6 text-foreground/50">Aucun stock trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-foreground/60">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(c => Math.max(1, c - 1))} disabled={currentPage === 1}>Précédent</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))} disabled={currentPage === totalPages}>Suivant</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Ajouter un Stock" onSave={handleSaveAdd}>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Produit</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
              value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})}>
              <option value="" disabled>Sélectionner un produit...</option>
              {mockProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Entrepôt</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
              value={formData.warehouse} onChange={e => setFormData({...formData, warehouse: e.target.value})}>
              <option value="" disabled>Sélectionner un entrepôt...</option>
              {mockWarehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantité à ajouter</label>
            <Input type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="Ex: 50" />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier le Stock" onSave={handleSaveEdit}>
        {selectedStock && (
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Produit</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                value={selectedStock.product} onChange={e => setSelectedStock({...selectedStock, product: e.target.value})}>
                {mockProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Entrepôt</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                value={selectedStock.warehouse} onChange={e => setSelectedStock({...selectedStock, warehouse: e.target.value})}>
                {mockWarehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantité</label>
              <Input type="number" value={selectedStock.quantity} onChange={e => setSelectedStock({...selectedStock, quantity: e.target.value})} />
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails du Stock">
        {selectedStock && (
          <div className="space-y-3">
            <p><strong>ID Stock:</strong> {selectedStock.id}</p>
            <p><strong>Produit:</strong> {selectedStock.product}</p>
            <p><strong>Entrepôt:</strong> {selectedStock.warehouse}</p>
            <p><strong>Quantité Actuelle:</strong> {selectedStock.quantity}</p>
            <p><strong>Dernière mise à jour:</strong> {selectedStock.updatedAt}</p>
          </div>
        )}
      </Modal>

    </div>
  );
}
