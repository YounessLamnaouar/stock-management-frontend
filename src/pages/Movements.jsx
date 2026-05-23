import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Download, Search, Edit, Ban, ArrowRightLeft, X } from "lucide-react";
import { mockMovements, mockWarehouses, mockProducts } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";

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

export default function Movements() {
  const { can } = usePermissions();
  const [movements, setMovements] = useState(
    mockMovements.filter(m => m.type === "Transfert")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const [formData, setFormData] = useState({
    product: "", quantity: "", source: "", destination: "", date: ""
  });

  const warehouseOptions = mockWarehouses.map(w => w.name);

  const filtered = movements.filter(m => {
    const matchSearch = m.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      m.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = dateFilter === "" || m.date.startsWith(dateFilter);
    return matchSearch && matchDate;
  });

  const handleAction = (action, id) => {
    if (action === "annuler") {
      if (window.confirm("Annuler ce transfert ?")) {
        setMovements(movements.filter(m => m.id !== id));
      }
    } else {
      const mvt = movements.find(m => m.id === id);
      if (mvt) {
        setSelectedMovement(mvt);
        setIsEditModalOpen(true);
      }
    }
  };

  const handleSaveEdit = () => {
    setMovements(movements.map(m => m.id === selectedMovement.id ? selectedMovement : m));
    setIsEditModalOpen(false);
  };

  const handleSaveAdd = () => {
    if (!formData.product || !formData.quantity || !formData.source || !formData.destination || !formData.date)
      return alert("Remplissez tous les champs.");
    setMovements([{
      id: `M-${Date.now().toString().slice(-4)}`,
      type: "Transfert",
      ...formData,
      agent: "Ahmed R.",
      comment: "Ajout manuel"
    }, ...movements]);
    setIsAddModalOpen(false);
    setFormData({ product: "", quantity: "", source: "", destination: "", date: "" });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Historique des transferts</h2>
          <p className="text-foreground/60">Suivez tous les transferts de stock entre entrepôts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download size={16} /> Exporter
          </Button>
          <Button className="gap-2 text-white" onClick={() => setIsAddModalOpen(true)}>Nouveau Transfert</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2 items-center flex-wrap shrink-0">
              <Input type="date" className="h-9 w-40 bg-surface/30 px-3" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Rechercher un produit, ID transfert..."
                className="pl-9 w-full bg-surface/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((mvt) => (
                <TableRow key={mvt.id}>
                  <TableCell className="font-medium text-xs">{mvt.id}</TableCell>
                  <TableCell className="font-medium">{mvt.product}</TableCell>
                  <TableCell className="font-bold">{mvt.quantity}</TableCell>
                  <TableCell>{mvt.source}</TableCell>
                  <TableCell>{mvt.destination}</TableCell>
                  <TableCell className="text-xs text-foreground/70">{mvt.date}</TableCell>
                  <TableCell>{mvt.agent}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {can.editMovements ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => handleAction("modifier", mvt.id)} title="Modifier">
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleAction("annuler", mvt.id)} title="Annuler">
                            <Ban size={14} />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-foreground/40">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nouveau transfert" onSave={handleSaveAdd}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Produit</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.product} onChange={e => setFormData({ ...formData, product: e.target.value })}>
              <option value="" disabled>Sélectionner un produit...</option>
              {mockProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantité</label>
            <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}
            >
              <option value="" disabled>Sélectionner...</option>
              {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Destination</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })}
            >
              <option value="" disabled>Sélectionner...</option>
              {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le transfert" onSave={handleSaveEdit}>
        {selectedMovement && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Produit</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedMovement.product} onChange={e => setSelectedMovement({ ...selectedMovement, product: e.target.value })}>
                <option value="" disabled>Sélectionner un produit...</option>
                {mockProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantité</label>
              <Input type="number" value={selectedMovement.quantity} onChange={e => setSelectedMovement({ ...selectedMovement, quantity: e.target.value })} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedMovement.source} onChange={e => setSelectedMovement({ ...selectedMovement, source: e.target.value })}
              >
                <option value="" disabled>Sélectionner...</option>
                {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedMovement.destination} onChange={e => setSelectedMovement({ ...selectedMovement, destination: e.target.value })}
              >
                <option value="" disabled>Sélectionner...</option>
                {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={selectedMovement.date} onChange={e => setSelectedMovement({ ...selectedMovement, date: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
