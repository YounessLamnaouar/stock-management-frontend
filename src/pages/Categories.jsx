import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Plus, Search, Eye, Edit, Trash2, X, Tags, Calendar } from "lucide-react";
import { categoriesApi } from "../api/categories";
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

const InfoRow = ({ label, value }) => (
  <div className="bg-surface/40 rounded-xl px-4 py-3">
    <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className="text-sm font-semibold">{value || "—"}</p>
  </div>
);

export default function Categories() {
  const { can } = usePermissions();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isAddOpen,  setIsAddOpen]  = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ nomCategorie: "" });

  useEffect(() => {
    categoriesApi.list().then(setCategories).finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter(c =>
    (c.nomCategorie || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.id).includes(searchTerm)
  );

  const totalPages        = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de cette catégorie ?")) return;
    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Catégorie supprimée avec succès.");
    } catch { toast.error("Erreur lors de la suppression."); }
  };

  const handleSaveAdd = async () => {
    if (!formData.nomCategorie) return toast.error("Veuillez saisir le nom de la catégorie.");
    setSaving(true);
    try {
      const created = await categoriesApi.create({ nomCategorie: formData.nomCategorie });
      setCategories([created, ...categories]);
      setIsAddOpen(false);
      setFormData({ nomCategorie: "" });
      toast.success("Catégorie créée avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création.");
    } finally { setSaving(false); }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updated = await categoriesApi.update(selectedCategory.id, { nomCategorie: selectedCategory.nomCategorie });
      setCategories(categories.map(c => c.id === updated.id ? updated : c));
      setIsEditOpen(false);
      toast.success("Catégorie mise à jour avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-foreground/50">Chargement...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Tags className="h-8 w-8" /> Catégories
          </h2>
          <p className="text-foreground/60">
            {can.manageCategories ? "Gérez la classification de vos produits." : "Consultez la classification des produits."}
          </p>
        </div>
        {can.manageCategories && (
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Ajouter une catégorie
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3 border-b space-y-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
            <Input placeholder="Rechercher une catégorie..." className="pl-9 bg-surface/30 w-full"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell className="font-mono text-xs text-foreground/50">{cat.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tags size={13} className="text-primary" />
                      </div>
                      <span className="font-semibold text-primary">{cat.nomCategorie}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                      <Calendar size={12} />
                      {cat.created_at?.slice(0, 10) || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:bg-secondary/10"
                        onClick={() => { setSelectedCategory(cat); setIsViewOpen(true); }}>
                        <Eye size={15} />
                      </Button>
                      {can.manageCategories && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => { setSelectedCategory({ ...cat }); setIsEditOpen(true); }}>
                            <Edit size={15} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(cat.id)}>
                            <Trash2 size={15} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-foreground/40">Aucune catégorie trouvée</TableCell>
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouvelle catégorie"
        subtitle="Ajoutez une catégorie à votre catalogue"
        onSave={handleSaveAdd} saveLabel={saving ? "..." : "Enregistrer"}>
        <Field label="Nom de la catégorie" required>
          <Input value={formData.nomCategorie} onChange={e => setFormData({ nomCategorie: e.target.value })}
            placeholder="Ex: Électronique" className="bg-surface/30 h-10" autoFocus />
        </Field>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier la catégorie"
        subtitle="Mettez à jour le nom"
        onSave={handleSaveEdit} saveLabel={saving ? "..." : "Enregistrer"}>
        {selectedCategory && (
          <Field label="Nom de la catégorie" required>
            <Input value={selectedCategory.nomCategorie || ""}
              onChange={e => setSelectedCategory({ ...selectedCategory, nomCategorie: e.target.value })}
              className="bg-surface/30 h-10" autoFocus />
          </Field>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails de la catégorie">
        {selectedCategory && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Tags size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">{selectedCategory.nomCategorie}</p>
                <p className="text-sm text-foreground/50 font-mono">#{selectedCategory.id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Identifiant"      value={selectedCategory.id} />
              <InfoRow label="Date de création" value={selectedCategory.created_at?.slice(0, 10)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
