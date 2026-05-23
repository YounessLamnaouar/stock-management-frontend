import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Plus, Search, Eye, Edit, Trash2, X, Tags } from "lucide-react";
import { mockCategories } from "../data/mock";
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

export default function Categories() {
  const { can } = usePermissions();
  const [categories, setCategories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "", description: ""
  });

  const filteredCategories = categories.filter(c => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id) => {
    if(window.confirm("Confirmer la suppression de cette catégorie ?")) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleSaveAdd = () => {
    if(!formData.name) return alert("Veuillez saisir au moins le Nom de la catégorie.");
    setCategories([{ 
        ...formData, 
        id: `CAT-00${categories.length + 1}`, 
        createdAt: new Date().toISOString().split('T')[0] 
      }, ...categories]);
    setIsAddOpen(false);
    setFormData({name: "", description: ""});
  };

  const handleSaveEdit = () => {
    setCategories(categories.map(c => c.id === selectedCategory.id ? selectedCategory : c));
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Tags className="h-8 w-8" />
            Catégories
          </h2>
          <p className="text-foreground/60">
            {can.manageCategories
              ? "Gérez la classification de vos produits."
              : "Consultez la classification des produits."}
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Rechercher une catégorie..."
                className="pl-9 bg-surface/30 w-full"
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
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium text-xs">{cat.id}</TableCell>
                  <TableCell className="font-semibold text-primary">{cat.name}</TableCell>
                  <TableCell className="text-foreground/70">{cat.description || "-"}</TableCell>
                  <TableCell className="text-xs text-foreground/50">{cat.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-secondary" onClick={() => { setSelectedCategory(cat); setIsViewOpen(true); }} title="Voir">
                        <Eye size={14} />
                      </Button>
                      {can.manageCategories && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => { setSelectedCategory(cat); setIsEditOpen(true); }} title="Modifier">
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(cat.id)} title="Supprimer">
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Ajouter une catégorie" onSave={handleSaveAdd}>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nom</label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nom de la catégorie" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description..." />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier la catégorie" onSave={handleSaveEdit}>
        {selectedCategory && (
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input value={selectedCategory.name} onChange={e => setSelectedCategory({...selectedCategory, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input value={selectedCategory.description} onChange={e => setSelectedCategory({...selectedCategory, description: e.target.value})} />
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails de la catégorie">
        {selectedCategory && (
          <div className="space-y-3">
            <p><strong>ID:</strong> {selectedCategory.id}</p>
            <p><strong>Nom:</strong> {selectedCategory.name}</p>
            <p><strong>Description:</strong> {selectedCategory.description || "Aucune description"}</p>
            <p><strong>Date de création:</strong> {selectedCategory.createdAt}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
