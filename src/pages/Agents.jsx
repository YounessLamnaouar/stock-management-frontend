import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Edit, Eye, Trash2, Shield, User, UserCog, X } from "lucide-react";
import { mockAgents } from "../data/mock";
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

export default function Agents() {
  const { can } = usePermissions();
  const [agents, setAgents] = useState(mockAgents);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", role: "Agent", status: "Actif"
  });

  const roles = ["Tous", "Admin", "Gestionnaire", "Agent"];
  const statuses = ["Tous", "Actif", "Inactif"];

  const filtered = agents.filter(a => {
    const matchSearch = a.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      a.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "Tous" || a.role === roleFilter;
    const matchStatus = statusFilter === "Tous" || a.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleDelete = (id) => {
    if(window.confirm("Supprimer cet utilisateur ?")) setAgents(agents.filter(a => a.id !== id));
  }

  const handleSaveEdit = () => {
    setAgents(agents.map(a => a.id === selectedAgent.id ? selectedAgent : a));
    setIsEditOpen(false);
  };

  const handleSaveAdd = () => {
    if(!formData.firstName || !formData.lastName || !formData.email) return alert("Remplissez tous les champs.");
    setAgents([{
      ...formData, id: `U-00${agents.length + 1}`, lastActivity: "Aujourd'hui"
    }, ...agents]);
    setIsAddModalOpen(false);
    setFormData({ firstName: "", lastName: "", email: "", role: "Agent", status: "Actif" });
  }


  return (
    <div className="space-y-6 relative">
      {!can.manageUsers ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="mx-auto mb-4 h-10 w-10 text-foreground/30" />
            <h3 className="text-lg font-semibold">Accès restreint</h3>
            <p className="mt-1 text-sm text-foreground/60">
              La gestion des utilisateurs est réservée aux administrateurs.
            </p>
          </CardContent>
        </Card>
      ) : (
      <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Utilisateurs & Access</h2>
          <p className="text-foreground/60">Gérez les utilisateurs, rôles et permissions du système.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Ajouter un utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/50" />
              <Input
                placeholder="Rechercher par nom, email..."
                className="pl-9 bg-surface/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="h-9 rounded-md border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select 
                className="h-9 rounded-md border bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded bg-surface flex items-center justify-center font-bold text-primary">
                        {agent.firstName[0]}{agent.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium">{agent.firstName} {agent.lastName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/70">{agent.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {agent.role === 'Admin' ? <Shield size={14} className="text-destructive"/> : agent.role === 'Gestionnaire' ? <UserCog size={14} className="text-primary"/> : <User size={14} className="text-secondary"/>}
                      <span className="font-medium">{agent.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-foreground/60">{agent.lastActivity}</TableCell>
                  <TableCell>
                    <Badge variant={agent.status === 'Actif' ? 'success' : 'outline'}>
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary" onClick={() => { setSelectedAgent(agent); setIsViewOpen(true); }}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setSelectedAgent(agent); setIsEditOpen(true); }}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(agent.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Ajouter un utilisateur" onSave={handleSaveAdd}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-sm font-medium">Prénom</label><Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Prénom" /></div>
          <div className="space-y-2"><label className="text-sm font-medium">Nom</label><Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Nom" /></div>
          <div className="space-y-2 col-span-2"><label className="text-sm font-medium">Email</label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@compagnie.ma" /></div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Rôle</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Admin">Admin</option>
              <option value="Gestionnaire">Gestionnaire</option>
              <option value="Agent">Agent</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Statut</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
          </div>
        </div>
      </Modal>
      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modifier l'utilisateur" onSave={handleSaveEdit}>
        {selectedAgent && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-sm font-medium">Prénom</label><Input value={selectedAgent.firstName} onChange={e => setSelectedAgent({...selectedAgent, firstName: e.target.value})} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Nom</label><Input value={selectedAgent.lastName} onChange={e => setSelectedAgent({...selectedAgent, lastName: e.target.value})} /></div>
            <div className="space-y-2 col-span-2"><label className="text-sm font-medium">Email</label><Input type="email" value={selectedAgent.email} onChange={e => setSelectedAgent({...selectedAgent, email: e.target.value})} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={selectedAgent.role} onChange={e => setSelectedAgent({...selectedAgent, role: e.target.value})}>
                <option value="Admin">Admin</option>
                <option value="Gestionnaire">Gestionnaire</option>
                <option value="Agent">Agent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={selectedAgent.status} onChange={e => setSelectedAgent({...selectedAgent, status: e.target.value})}>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails de l'utilisateur">
        {selectedAgent && (
          <div className="space-y-3">
            <p><strong>Nom:</strong> {selectedAgent.firstName} {selectedAgent.lastName}</p>
            <p><strong>Email:</strong> {selectedAgent.email}</p>
            <p><strong>Rôle:</strong> {selectedAgent.role}</p>
            <p><strong>Statut:</strong> {selectedAgent.status}</p>
            <p><strong>Dernière activité:</strong> {selectedAgent.lastActivity}</p>
          </div>
        )}
      </Modal>
      </>
      )}
    </div>
  );
}
