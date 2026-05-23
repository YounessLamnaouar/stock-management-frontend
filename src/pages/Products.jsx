import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Eye, Edit, Trash2, SlidersHorizontal, X } from "lucide-react";
import { mockProducts, mockCategories } from "../data/mock";
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

export default function Products() {
  const { can } = usePermissions();
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");
  // const [statusFilter, setStatusFilter] = useState("Tous");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    code: "", name: "", category: "", description: ""
  });

  const categories = ["Toutes", ...new Set(mockProducts.map(p => p.category))];
  // const statuses = ["Tous", "Actif", "Stock Faible", "En rupture"];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === "Toutes" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (id) => {
    if(window.confirm("Confirmer la suppression de ce produit ?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveAdd = () => {
    if(!formData.code || !formData.name || !formData.category) return alert("Veuillez remplir les champs obligatoires (Code, Nom, Catégorie)");
    setProducts([{ ...formData, id: Date.now().toString(), unit: "Pièce" }, ...products]);
    setIsAddOpen(false);
    setFormData({code: "", name: "", category: "", description: ""});
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
            {can.manageProducts
              ? "Gérez votre catalogue de produits et leurs niveaux de stock globaux."
              : "Consultez le catalogue de produits et leurs informations."}
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
              <Input
                placeholder="Rechercher par code ou nom..."
                className="pl-9 bg-surface/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select 
                className="h-9 rounded-md border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
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
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-primary">{product.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-foreground/50">{product.description}</div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary" onClick={() => { setSelectedProduct(product); setIsViewOpen(true); }}>
                        <Eye size={16} />
                      </Button>
                      {can.manageProducts && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setSelectedProduct(product); setIsEditOpen(true); }}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                            <Trash2 size={16} />
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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Ajouter un produit" onSave={handleSaveAdd}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">Code</label><Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Ex: PROD-123" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Nom</label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nom du produit" /></div>
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Catégorie</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="" disabled>Sélectionner une catégorie...</option>
              {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 space-y-2"><label className="text-sm font-medium">Description</label><Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description courte..." /></div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier le produit" onSave={handleSaveEdit}>
        {selectedProduct && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Code</label><Input disabled value={selectedProduct.code} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Nom</label><Input value={selectedProduct.name} onChange={e => setSelectedProduct({...selectedProduct, name: e.target.value})} /></div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Catégorie</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                value={selectedProduct.category} onChange={e => setSelectedProduct({...selectedProduct, category: e.target.value})}>
                {mockCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails du produit">
        {selectedProduct && (
          <div className="space-y-3">
            <p><strong>Code:</strong> {selectedProduct.code}</p>
            <p><strong>Nom:</strong> {selectedProduct.name}</p>
            <p><strong>Catégorie:</strong> {selectedProduct.category}</p>
            <p><strong>Description:</strong> {selectedProduct.description}</p>
          </div>
        )}
      </Modal>

    </div>
  );
}
