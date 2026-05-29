import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Plus, Search, Eye, Edit, Trash2, X, Package, Tag } from "lucide-react";
import { produitsApi } from "../api/produits";
import { categoriesApi } from "../api/categories";
import { usePermissions } from "../hooks/usePermissions";

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
    <p className="text-sm font-semibold">{value || "—"}</p>
  </div>
);

const selectClass = "flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function Products() {
  const { can } = usePermissions();
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isAddOpen,  setIsAddOpen]  = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ nomProduit: "", categorie_id: "", unite: "Pièce" });

  useEffect(() => {
    Promise.all([produitsApi.list(), categoriesApi.list()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .finally(() => setLoading(false));
  }, [products, categories]);

  const categoryOptions = ["Toutes", ...categories.map(c => c.nomCategorie)];

  const filteredProducts = products.filter(p => {
    const matchSearch = (p.nomProduit || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === "Toutes" || p.categorie?.nomCategorie === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalPages       = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce produit ?")) return;
    try {
      await produitsApi.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success("Produit supprimé avec succès.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.nomProduit || !formData.categorie_id)
      return toast.error("Veuillez remplir les champs obligatoires (Nom, Catégorie).");
    setSaving(true);
    try {
      const created = await produitsApi.create({
        nomProduit:   formData.nomProduit,
        categorie_id: parseInt(formData.categorie_id),
        unite:        formData.unite || "Pièce",
      });
      setProducts([created, ...products]);
      setIsAddOpen(false);
      setFormData({ nomProduit: "", categorie_id: "", unite: "Pièce" });
      toast.success("Produit créé avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création.");
    } finally { setSaving(false); }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updated = await produitsApi.update(selectedProduct.id, {
        nomProduit:   selectedProduct.nomProduit,
        categorie_id: parseInt(selectedProduct.categorie_id || selectedProduct.categorie?.id),
        unite:        selectedProduct.unite,
      });
      setProducts(products.map(p => p.id === updated.id ? updated : p));
      setIsEditOpen(false);
      toast.success("Produit mis à jour avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-foreground/50">Chargement...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Produits</h2>
          <p className="text-foreground/60">
            {can.manageProducts ? "Gérez votre catalogue de produits." : "Consultez le catalogue de produits."}
          </p>
        </div>
        {can.manageProducts && (
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} /> Ajouter un produit
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3 border-b space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input placeholder="Rechercher par nom..." className="pl-9 bg-surface/30"
                value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
            </div>
            <select className="h-9 rounded-md border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}>
              {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.nomProduit}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Tag size={10} /> {product.categorie?.nomCategorie || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground/60 text-sm">{product.unite || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/10"
                        onClick={() => { setSelectedProduct(product); setIsViewOpen(true); }}>
                        <Eye size={15} />
                      </Button>
                      {can.manageProducts && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => { setSelectedProduct({ ...product, categorie_id: product.categorie?.id }); setIsEditOpen(true); }}>
                            <Edit size={15} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(product.id)}>
                            <Trash2 size={15} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-foreground/40">Aucun produit trouvé</TableCell>
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouveau produit"
        subtitle="Remplissez les informations du produit"
        onSave={handleSaveAdd} saveLabel={saving ? "..." : "Enregistrer"}>
        <div className="space-y-4">
          <Field label="Nom du produit" required>
            <Input value={formData.nomProduit} onChange={e => setFormData({ ...formData, nomProduit: e.target.value })}
              placeholder="Nom du produit" className="bg-surface/30 h-10" />
          </Field>
          <Field label="Catégorie" required>
            <select className={selectClass} value={formData.categorie_id}
              onChange={e => setFormData({ ...formData, categorie_id: e.target.value })}>
              <option value="" disabled>Sélectionner une catégorie...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nomCategorie}</option>)}
            </select>
          </Field>
          <Field label="Unité">
            <Input value={formData.unite} onChange={e => setFormData({ ...formData, unite: e.target.value })}
              placeholder="Pièce" className="bg-surface/30 h-10" />
          </Field>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier le produit"
        subtitle="Mettez à jour les informations"
        onSave={handleSaveEdit} saveLabel={saving ? "..." : "Enregistrer"}>
        {selectedProduct && (
          <div className="space-y-4">
            <Field label="Nom du produit" required>
              <Input value={selectedProduct.nomProduit || ""}
                onChange={e => setSelectedProduct({ ...selectedProduct, nomProduit: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>
            <Field label="Catégorie" required>
              <select className={selectClass}
                value={selectedProduct.categorie_id || selectedProduct.categorie?.id || ""}
                onChange={e => setSelectedProduct({ ...selectedProduct, categorie_id: e.target.value })}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nomCategorie}</option>)}
              </select>
            </Field>
            <Field label="Unité">
              <Input value={selectedProduct.unite || ""}
                onChange={e => setSelectedProduct({ ...selectedProduct, unite: e.target.value })}
                className="bg-surface/30 h-10" />
            </Field>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails du produit">
        {selectedProduct && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package size={22} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">{selectedProduct.nomProduit}</p>
                <p className="text-sm text-foreground/50">{selectedProduct.categorie?.nomCategorie || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="ID"        value={selectedProduct.id} />
              <InfoRow label="Catégorie" value={selectedProduct.categorie?.nomCategorie} />
              <InfoRow label="Unité"     value={selectedProduct.unite} />
              <InfoRow label="Créé le"   value={selectedProduct.created_at?.slice(0, 10)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
