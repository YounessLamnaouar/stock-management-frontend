import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Download, Search, Edit, Ban, X } from "lucide-react";
import { mockMovements, mockWarehouses, mockProducts } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";

const Modal = ({ isOpen, onClose, title, subtitle, children, onSave }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border border-border/60 overflow-hidden max-h-[90vh] flex flex-col">
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
            <Button onClick={onSave} className="h-9 bg-primary text-primary-foreground">Enregistrer</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, required, hint, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground/80">
      {label}{required && <span className="text-destructive ml-1">*</span>}
      {hint && <span className="text-foreground/40 font-normal ml-1 text-xs">{hint}</span>}
    </label>
    {children}
  </div>
);

const selectClass = "flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

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
    product: "", quantity: "", source: "", destination: "", date: "", status: "En cours"
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
        setSelectedMovement({
          ...mvt,
          source: mvt.source === "_" ? "" : mvt.source,
          destination: mvt.destination === "_" ? "" : mvt.destination,
          status: mvt.status || "En cours",
        });
        setIsEditModalOpen(true);
      }
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setMovements(movements.map(m => m.id === id ? { ...m, status: newStatus } : m));
  };

  const handleSaveAdd = () => {
    if (!formData.product || !formData.quantity || !formData.date)
      return alert("Produit, Quantité et Date sont obligatoires.");
    if (!formData.source && !formData.destination)
      return alert("Au moins une Source ou une Destination doit être sélectionnée.");
    setMovements([{
      id: `M-${Date.now().toString().slice(-4)}`,
      type: "Transfert",
      product: formData.product,
      quantity: formData.quantity,
      source: formData.source || "_",
      destination: formData.destination || "_",
      date: formData.date,
      agent: "Ahmed R.",
      comment: "Ajout manuel",
      status: formData.status || "En cours",
    }, ...movements]);
    setIsAddModalOpen(false);
    setFormData({ product: "", quantity: "", source: "", destination: "", date: "", status: "En cours" });
  };

  const handleSaveEdit = () => {
    if (!selectedMovement.product || !selectedMovement.quantity || !selectedMovement.date)
      return alert("Produit, Quantité et Date sont obligatoires.");
    if (!selectedMovement.source && !selectedMovement.destination)
      return alert("Au moins une Source ou une Destination doit être sélectionnée.");
    setMovements(movements.map(m => m.id === selectedMovement.id ? {
      ...selectedMovement,
      source: selectedMovement.source || "_",
      destination: selectedMovement.destination || "_",
    } : m));
    setIsEditModalOpen(false);
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
          <Button className="gap-2 text-white" onClick={() => setIsAddModalOpen(true)}>
            Nouveau Transfert
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-wrap items-center gap-4">
            <Input type="date" className="h-9 w-40 bg-surface/30 px-3" value={dateFilter}
              onChange={e => setDateFilter(e.target.value)} />
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input placeholder="Rechercher un produit, ID transfert..."
                className="pl-9 w-full bg-surface/30"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(mvt => (
                <TableRow key={mvt.id}>
                  <TableCell className="font-medium text-xs">{mvt.id}</TableCell>
                  <TableCell className="font-medium">{mvt.product}</TableCell>
                  <TableCell className="font-bold">{mvt.quantity}</TableCell>
                  <TableCell className={mvt.source === "_" ? "text-foreground/35 italic" : ""}>{mvt.source}</TableCell>
                  <TableCell className={mvt.destination === "_" ? "text-foreground/35 italic" : ""}>{mvt.destination}</TableCell>
                  <TableCell className="text-xs text-foreground/70">{mvt.date}</TableCell>
                  <TableCell>{mvt.agent}</TableCell>
                  <TableCell>
                    {can.editMovements ? (
                      <select
                        value={mvt.status || "En cours"}
                        onChange={e => handleStatusChange(mvt.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer outline-none ${
                          (mvt.status || "En cours") === "Validée"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : (mvt.status || "En cours") === "Annulée"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <option value="En cours">En cours</option>
                        <option value="Validée">Validée</option>
                        <option value="Annulée">Annulée</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border inline-block ${
                        (mvt.status || "En cours") === "Validée"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : (mvt.status || "En cours") === "Annulée"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {mvt.status || "En cours"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {can.editMovements ? (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary"
                            onClick={() => handleAction("modifier", mvt.id)} title="Modifier">
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                            onClick={() => handleAction("annuler", mvt.id)} title="Annuler">
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
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-foreground/40">
                    Aucun transfert trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Add Modal ── */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
        title="Nouveau transfert" subtitle="Au moins une Source ou une Destination est requise"
        onSave={handleSaveAdd}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Produit" required>
              <select className={selectClass} value={formData.product}
                onChange={e => setFormData({ ...formData, product: e.target.value })}>
                <option value="" disabled>Sélectionner un produit...</option>
                {mockProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Quantité" required>
              <Input type="number" value={formData.quantity} placeholder="0"
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Source" hint="(optionnel)">
              <select className={selectClass} value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value })}>
                <option value="">— aucune —</option>
                {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </Field>
            <Field label="Destination" hint="(optionnel)">
              <select className={selectClass} value={formData.destination}
                onChange={e => setFormData({ ...formData, destination: e.target.value })}>
                <option value="">— aucune —</option>
                {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Date" required>
            <Input type="date" value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="bg-surface/30 h-10" />
          </Field>

          <Field label="Statut">
            <select className={selectClass} value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option value="En cours">En cours</option>
              <option value="Validée">Validée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </Field>

          <p className="text-xs text-foreground/45 bg-surface/40 rounded-lg px-3 py-2">
            Si une Source ou Destination n'est pas sélectionnée, elle sera enregistrée comme « _ ».
            Les deux champs vides ne sont pas acceptés.
          </p>
        </div>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        title="Modifier le transfert" subtitle="Au moins une Source ou une Destination est requise"
        onSave={handleSaveEdit}>
        {selectedMovement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Produit" required>
                <select className={selectClass} value={selectedMovement.product}
                  onChange={e => setSelectedMovement({ ...selectedMovement, product: e.target.value })}>
                  <option value="" disabled>Sélectionner un produit...</option>
                  {mockProducts.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Quantité" required>
                <Input type="number" value={selectedMovement.quantity}
                  onChange={e => setSelectedMovement({ ...selectedMovement, quantity: e.target.value })}
                  className="bg-surface/30 h-10" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Source" hint="(optionnel)">
                <select className={selectClass} value={selectedMovement.source}
                  onChange={e => setSelectedMovement({ ...selectedMovement, source: e.target.value })}>
                  <option value="">— aucune —</option>
                  {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </Field>
              <Field label="Destination" hint="(optionnel)">
                <select className={selectClass} value={selectedMovement.destination}
                  onChange={e => setSelectedMovement({ ...selectedMovement, destination: e.target.value })}>
                  <option value="">— aucune —</option>
                  {warehouseOptions.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Date" required>
              <Input type="date" value={selectedMovement.date}
                onChange={e => setSelectedMovement({ ...selectedMovement, date: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>

            <Field label="Statut">
              <select className={selectClass} value={selectedMovement.status || "En cours"}
                onChange={e => setSelectedMovement({ ...selectedMovement, status: e.target.value })}>
                <option value="En cours">En cours</option>
                <option value="Validée">Validée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </Field>

            <p className="text-xs text-foreground/45 bg-surface/40 rounded-lg px-3 py-2">
              Si une Source ou Destination n'est pas sélectionnée, elle sera enregistrée comme « _ ».
              Les deux champs vides ne sont pas acceptés.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
