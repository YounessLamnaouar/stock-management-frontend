import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Plus, Search, Eye, Edit, Trash2, X, Package, Tag } from "lucide-react";
import { mockProducts, mockCategories } from "../data/mock";
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

export default function Products() {
  const { can } = usePermissions();
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({ code: "", name: "", category: "" });

  const categories = ["Toutes", ...new Set(mockProducts.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === "Toutes" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (id) => {
    if (window.confirm("Confirmer la suppression de ce produit ?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveAdd = () => {
    if (!formData.code || !formData.name || !formData.category)
      return alert("Veuillez remplir les champs obligatoires (Code, Nom, Catégorie)");
    setProducts([{ ...formData, id: Date.now().toString(), unit: "Pièce" }, ...products]);
    setIsAddOpen(false);
    setFormData({ code: "", name: "", category: "" });
  };

  const handleSaveEdit = () => {
    setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p));
    setIsEditOpen(false);
  };

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
              <Input placeholder="Rechercher par code ou nom..." className="pl-9 bg-surface/30"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="h-9 rounded-md border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom du produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs font-semibold text-primary">{product.code}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Tag size={10} /> {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:text-secondary hover:bg-secondary/10"
                        onClick={() => { setSelectedProduct(product); setIsViewOpen(true); }}>
                        <Eye size={15} />
                      </Button>
                      {can.manageProducts && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => { setSelectedProduct(product); setIsEditOpen(true); }}>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nouveau produit"
        subtitle="Remplissez les informations du produit" onSave={handleSaveAdd}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Code" required>
              <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="PROD-123" className="bg-surface/30 h-10" />
            </Field>
            <Field label="Nom du produit" required>
              <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du produit" className="bg-surface/30 h-10" />
            </Field>
          </div>
          <Field label="Catégorie" required>
            <select className="flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="" disabled>Sélectionner une catégorie...</option>
              {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier le produit"
        subtitle="Mettez à jour les informations" onSave={handleSaveEdit}>
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Code">
                <Input disabled value={selectedProduct.code} className="bg-surface/30 h-10 opacity-60" />
              </Field>
              <Field label="Nom du produit" required>
                <Input value={selectedProduct.name}
                  onChange={e => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                  className="bg-surface/30 h-10" />
              </Field>
            </div>
            <Field label="Catégorie" required>
              <select className="flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedProduct.category}
                onChange={e => setSelectedProduct({ ...selectedProduct, category: e.target.value })}>
                {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
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
                <p className="font-semibold text-base">{selectedProduct.name}</p>
                <p className="text-sm text-foreground/50 font-mono">{selectedProduct.code}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Code" value={selectedProduct.code} />
              <InfoRow label="Catégorie" value={selectedProduct.category} />
              <InfoRow label="Unité" value={selectedProduct.unit} />
              <InfoRow label="Statut" value={selectedProduct.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
