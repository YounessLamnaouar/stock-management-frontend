import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Download, Search, Edit, Ban, X, ChevronDown } from "lucide-react";
import { movementsApi } from "../api/movements";
import { produitsApi } from "../api/produits";
import { entrepotsApi } from "../api/entrepots";
import { statusMovementsApi } from "../api/statusMovements";
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

const STATUS_STYLES = {
  "En cours": { dot: "bg-blue-500",  pill: "bg-blue-50 text-blue-700 border-blue-200",   hover: "hover:bg-blue-50 hover:text-blue-700" },
  "Validée":  { dot: "bg-green-500", pill: "bg-green-50 text-green-700 border-green-200", hover: "hover:bg-green-50 hover:text-green-700" },
  "Annulée":  { dot: "bg-red-500",   pill: "bg-red-50 text-red-700 border-red-200",       hover: "hover:bg-red-50 hover:text-red-700" },
};

const getStatusStyle = (name) => STATUS_STYLES[name] || { dot: "bg-gray-400", pill: "bg-gray-100 text-gray-600 border-gray-200", hover: "hover:bg-gray-100" };

const StatusSelect = ({ value, onChange, disabled, statusList }) => {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0 });
  const btnRef  = useRef(null);
  const dropRef = useRef(null);
  const style   = getStatusStyle(value);

  const handleOpen = () => {
    if (disabled) return;
    if (!open) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="inline-block">
      <button ref={btnRef} type="button" onClick={handleOpen}
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border transition-colors ${style.pill} ${disabled ? "" : "cursor-pointer"}`}>
        {value || "—"}
        {!disabled && <ChevronDown size={11} className="opacity-50" />}
      </button>

      {open && createPortal(
        <div ref={dropRef}
          style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-white border border-border/60 rounded-xl shadow-2xl overflow-hidden min-w-[130px] py-1">
          {statusList.map(s => {
            const st = getStatusStyle(s.nomStatus);
            return (
              <button key={s.id} type="button"
                onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full text-left text-xs font-medium px-3 py-2.5 flex items-center gap-2.5 transition-colors ${
                  s.nomStatus === value ? st.pill : `text-foreground/70 ${st.hover}`
                }`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                {s.nomStatus}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
};

export default function Movements() {
  const { can } = usePermissions();
  const [movements,   setMovements]   = useState([]);
  const [products,    setProducts]    = useState([]);
  const [warehouses,  setWarehouses]  = useState([]);
  const [statusList,  setStatusList]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [dateFilter,  setDateFilter]  = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isAddModalOpen,  setIsAddModalOpen]  = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState(null);

  const [formData, setFormData] = useState({
    produit_id: "", quantite: "", entrepot_source_id: "", entrepot_destination_id: "",
    dateMouvement: "", status_mouvement_id: ""
  });

  useEffect(() => {
    Promise.all([
      movementsApi.list(),
      produitsApi.list(),
      entrepotsApi.list(),
      statusMovementsApi.list(),
    ]).then(([m, p, e, s]) => {
      setMovements(m);
      setProducts(p);
      setWarehouses(e);
      setStatusList(s);
      if (s.length > 0) setFormData(f => ({ ...f, status_mouvement_id: s[0].id }));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = movements.filter(m => {
    const productName = m.produit?.nomProduit || "";
    const matchSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(m.id).includes(searchTerm);
    const matchDate = dateFilter === "" || (m.dateMouvement || "").startsWith(dateFilter);
    return matchSearch && matchDate;
  });

  const totalPages        = Math.ceil(filtered.length / itemsPerPage);
  const paginatedMovements = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleStatusChange = async (mvt, newStatus) => {
    try {
      const updated = await movementsApi.update(mvt.id, { status_mouvement_id: newStatus.id });
      setMovements(movements.map(m => m.id === updated.id ? updated : m));
      toast.success("Statut mis à jour.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Annuler ce transfert ?")) return;
    try {
      await movementsApi.delete(id);
      setMovements(movements.filter(m => m.id !== id));
      toast.success("Transfert supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.produit_id || !formData.quantite || !formData.dateMouvement)
      return toast.error("Produit, Quantité et Date sont obligatoires.");
    if (!formData.entrepot_source_id && !formData.entrepot_destination_id)
      return toast.error("Au moins une Source ou une Destination doit être sélectionnée.");
    setSaving(true);
    try {
      const payload = {
        produit_id:              parseInt(formData.produit_id),
        quantite:                parseInt(formData.quantite),
        dateMouvement:           formData.dateMouvement,
        status_mouvement_id:     parseInt(formData.status_mouvement_id),
        entrepot_source_id:      formData.entrepot_source_id      ? parseInt(formData.entrepot_source_id)      : null,
        entrepot_destination_id: formData.entrepot_destination_id ? parseInt(formData.entrepot_destination_id) : null,
      };
      const created = await movementsApi.create(payload);
      setMovements([created, ...movements]);
      setIsAddModalOpen(false);
      setFormData({ produit_id: "", quantite: "", entrepot_source_id: "", entrepot_destination_id: "", dateMouvement: "", status_mouvement_id: statusList[0]?.id || "" });
      toast.success("Transfert créé avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création.");
    } finally { setSaving(false); }
  };

  const handleSaveEdit = async () => {
    if (!selectedMovement.produit_id || !selectedMovement.quantite || !selectedMovement.dateMouvement)
      return toast.error("Produit, Quantité et Date sont obligatoires.");
    if (!selectedMovement.entrepot_source_id && !selectedMovement.entrepot_destination_id)
      return toast.error("Au moins une Source ou une Destination doit être sélectionnée.");
    setSaving(true);
    try {
      const updated = await movementsApi.update(selectedMovement.id, {
        produit_id:              parseInt(selectedMovement.produit_id),
        quantite:                parseInt(selectedMovement.quantite),
        dateMouvement:           selectedMovement.dateMouvement,
        status_mouvement_id:     parseInt(selectedMovement.status_mouvement_id),
        entrepot_source_id:      selectedMovement.entrepot_source_id      ? parseInt(selectedMovement.entrepot_source_id)      : null,
        entrepot_destination_id: selectedMovement.entrepot_destination_id ? parseInt(selectedMovement.entrepot_destination_id) : null,
      });
      setMovements(movements.map(m => m.id === updated.id ? updated : m));
      setIsEditModalOpen(false);
      toast.success("Transfert mis à jour avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally { setSaving(false); }
  };

  const handleExport = async () => {
    try {
      const blob = await movementsApi.exportCsv();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "mouvements.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Erreur lors de l'export."); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-foreground/50">Chargement...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Historique des transferts</h2>
          <p className="text-foreground/60">Suivez tous les transferts de stock entre entrepôts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
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
              onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }} />
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input placeholder="Rechercher un produit, ID transfert..."
                className="pl-9 w-full bg-surface/30"
                value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
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
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMovements.map(mvt => {
                const statusName = mvt.status_mouvement?.nomStatus || "En cours";
                return (
                  <TableRow key={mvt.id}>
                    <TableCell className="font-medium text-xs">{mvt.id}</TableCell>
                    <TableCell className="font-medium">{mvt.produit?.nomProduit || "—"}</TableCell>
                    <TableCell className="font-bold">{mvt.quantite}</TableCell>
                    <TableCell className={!mvt.entrepot_source ? "text-foreground/35 italic" : ""}>
                      {mvt.entrepot_source?.nomEntrepot || "—"}
                    </TableCell>
                    <TableCell className={!mvt.entrepot_destination ? "text-foreground/35 italic" : ""}>
                      {mvt.entrepot_destination?.nomEntrepot || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-foreground/70">{mvt.dateMouvement || "—"}</TableCell>
                    <TableCell>
                      <StatusSelect
                        value={statusName}
                        onChange={(newStatus) => handleStatusChange(mvt, newStatus)}
                        disabled={!can.editMovements}
                        statusList={statusList}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {can.editMovements ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary"
                              onClick={() => {
                                setSelectedMovement({
                                  ...mvt,
                                  produit_id:              mvt.produit?.id              || mvt.produit_id,
                                  entrepot_source_id:      mvt.entrepot_source?.id      || mvt.entrepot_source_id      || "",
                                  entrepot_destination_id: mvt.entrepot_destination?.id || mvt.entrepot_destination_id || "",
                                  status_mouvement_id:     mvt.status_mouvement?.id     || mvt.status_mouvement_id,
                                });
                                setIsEditModalOpen(true);
                              }} title="Modifier">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                              onClick={() => handleDelete(mvt.id)} title="Annuler">
                              <Ban size={14} />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-foreground/40">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedMovements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-foreground/40">
                    Aucun transfert trouvé
                  </TableCell>
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
        title="Nouveau transfert" subtitle="Au moins une Source ou une Destination est requise"
        onSave={handleSaveAdd}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Produit" required>
              <select className={selectClass} value={formData.produit_id}
                onChange={e => setFormData({ ...formData, produit_id: e.target.value })}>
                <option value="" disabled>Sélectionner un produit...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.nomProduit}</option>)}
              </select>
            </Field>
            <Field label="Quantité" required>
              <Input type="number" value={formData.quantite} placeholder="0"
                onChange={e => setFormData({ ...formData, quantite: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Source" hint="(optionnel)">
              <select className={selectClass} value={formData.entrepot_source_id}
                onChange={e => setFormData({ ...formData, entrepot_source_id: e.target.value })}>
                <option value="">— aucune —</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.nomEntrepot}</option>)}
              </select>
            </Field>
            <Field label="Destination" hint="(optionnel)">
              <select className={selectClass} value={formData.entrepot_destination_id}
                onChange={e => setFormData({ ...formData, entrepot_destination_id: e.target.value })}>
                <option value="">— aucune —</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.nomEntrepot}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Date" required>
            <Input type="date" value={formData.dateMouvement}
              onChange={e => setFormData({ ...formData, dateMouvement: e.target.value })}
              className="bg-surface/30 h-10" />
          </Field>

          <Field label="Statut">
            <select className={selectClass} value={formData.status_mouvement_id}
              onChange={e => setFormData({ ...formData, status_mouvement_id: e.target.value })}>
              {statusList.map(s => <option key={s.id} value={s.id}>{s.nomStatus}</option>)}
            </select>
          </Field>

          <p className="text-xs text-foreground/45 bg-surface/40 rounded-lg px-3 py-2">
            Si une Source ou Destination n'est pas sélectionnée, elle sera enregistrée comme vide.
            Les deux champs vides ne sont pas acceptés.
          </p>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        title="Modifier le transfert" subtitle="Au moins une Source ou une Destination est requise"
        onSave={handleSaveEdit}>
        {selectedMovement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Produit" required>
                <select className={selectClass} value={selectedMovement.produit_id || ""}
                  onChange={e => setSelectedMovement({ ...selectedMovement, produit_id: e.target.value })}>
                  <option value="" disabled>Sélectionner un produit...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.nomProduit}</option>)}
                </select>
              </Field>
              <Field label="Quantité" required>
                <Input type="number" value={selectedMovement.quantite || ""}
                  onChange={e => setSelectedMovement({ ...selectedMovement, quantite: e.target.value })}
                  className="bg-surface/30 h-10" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Source" hint="(optionnel)">
                <select className={selectClass} value={selectedMovement.entrepot_source_id || ""}
                  onChange={e => setSelectedMovement({ ...selectedMovement, entrepot_source_id: e.target.value })}>
                  <option value="">— aucune —</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.nomEntrepot}</option>)}
                </select>
              </Field>
              <Field label="Destination" hint="(optionnel)">
                <select className={selectClass} value={selectedMovement.entrepot_destination_id || ""}
                  onChange={e => setSelectedMovement({ ...selectedMovement, entrepot_destination_id: e.target.value })}>
                  <option value="">— aucune —</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.nomEntrepot}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Date" required>
              <Input type="date" value={selectedMovement.dateMouvement || ""}
                onChange={e => setSelectedMovement({ ...selectedMovement, dateMouvement: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>

            <Field label="Statut">
              <select className={selectClass} value={selectedMovement.status_mouvement_id || ""}
                onChange={e => setSelectedMovement({ ...selectedMovement, status_mouvement_id: e.target.value })}>
                {statusList.map(s => <option key={s.id} value={s.id}>{s.nomStatus}</option>)}
              </select>
            </Field>

            <p className="text-xs text-foreground/45 bg-surface/40 rounded-lg px-3 py-2">
              Si une Source ou Destination n'est pas sélectionnée, elle sera enregistrée comme vide.
              Les deux champs vides ne sont pas acceptés.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
