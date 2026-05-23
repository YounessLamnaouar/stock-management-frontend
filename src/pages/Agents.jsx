import { useState } from "react";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Plus, Search, Edit, Eye, Trash2, Shield, User, UserCog, X, Mail } from "lucide-react";
import { mockAgents } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";

const Modal = ({ isOpen, onClose, title, subtitle, children, onSave }) => {
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
            <Button onClick={onSave} className="h-9 bg-primary text-primary-foreground">Enregistrer</Button>
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
    <p className="text-sm font-semibold">{value ?? "—"}</p>
  </div>
);

const selectClass = "flex h-10 w-full rounded-md border border-input bg-surface/30 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const RoleIcon = ({ role, size = 14 }) => {
  if (role === "Admin") return <Shield size={size} className="text-destructive" />;
  if (role === "Gestionnaire") return <UserCog size={size} className="text-primary" />;
  return <User size={size} className="text-secondary" />;
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
    const matchSearch =
      a.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "Tous" || a.role === roleFilter;
    const matchStatus = statusFilter === "Tous" || a.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cet utilisateur ?")) setAgents(agents.filter(a => a.id !== id));
  };

  const handleSaveEdit = () => {
    setAgents(agents.map(a => a.id === selectedAgent.id ? selectedAgent : a));
    setIsEditOpen(false);
  };

  const handleSaveAdd = () => {
    if (!formData.firstName || !formData.lastName || !formData.email)
      return alert("Remplissez tous les champs obligatoires.");
    setAgents([{ ...formData, id: `U-00${agents.length + 1}` }, ...agents]);
    setIsAddModalOpen(false);
    setFormData({ firstName: "", lastName: "", email: "", role: "Agent", status: "Actif" });
  };

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
              <h2 className="text-3xl font-bold tracking-tight text-primary">Utilisateurs & Accès</h2>
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
                  <Input placeholder="Rechercher par nom, email..." className="pl-9 bg-surface/30"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <select className="h-9 rounded-md border bg-surface/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select className="h-9 rounded-md border bg-surface/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(agent => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            {agent.firstName[0]}{agent.lastName[0]}
                          </div>
                          <span className="font-medium">{agent.firstName} {agent.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground/70">{agent.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <RoleIcon role={agent.role} />
                          <span className="font-medium">{agent.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={agent.status === "Actif" ? "success" : "outline"}>
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:bg-secondary/10"
                            onClick={() => { setSelectedAgent(agent); setIsViewOpen(true); }}>
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"
                            onClick={() => { setSelectedAgent(agent); setIsEditOpen(true); }}>
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(agent.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-foreground/40">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add Modal */}
          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}
            title="Ajouter un utilisateur" subtitle="Créez un nouveau compte utilisateur"
            onSave={handleSaveAdd}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénom" required>
                  <Input value={formData.firstName} placeholder="Prénom" className="bg-surface/30 h-10"
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </Field>
                <Field label="Nom" required>
                  <Input value={formData.lastName} placeholder="Nom" className="bg-surface/30 h-10"
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </Field>
              </div>
              <Field label="Email professionnel" required>
                <Input type="email" value={formData.email} placeholder="prenom.nom@compagnie.ma"
                  className="bg-surface/30 h-10"
                  onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rôle" required>
                  <select className={selectClass} value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="Admin">Admin</option>
                    <option value="Gestionnaire">Gestionnaire</option>
                    <option value="Agent">Agent</option>
                  </select>
                </Field>
                <Field label="Statut">
                  <select className={selectClass} value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </Field>
              </div>
            </div>
          </Modal>

          {/* Edit Modal */}
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}
            title="Modifier l'utilisateur" subtitle="Mettez à jour les informations"
            onSave={handleSaveEdit}>
            {selectedAgent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Prénom" required>
                    <Input value={selectedAgent.firstName} className="bg-surface/30 h-10"
                      onChange={e => setSelectedAgent({ ...selectedAgent, firstName: e.target.value })} />
                  </Field>
                  <Field label="Nom" required>
                    <Input value={selectedAgent.lastName} className="bg-surface/30 h-10"
                      onChange={e => setSelectedAgent({ ...selectedAgent, lastName: e.target.value })} />
                  </Field>
                </div>
                <Field label="Email professionnel" required>
                  <Input type="email" value={selectedAgent.email} className="bg-surface/30 h-10"
                    onChange={e => setSelectedAgent({ ...selectedAgent, email: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Rôle" required>
                    <select className={selectClass} value={selectedAgent.role}
                      onChange={e => setSelectedAgent({ ...selectedAgent, role: e.target.value })}>
                      <option value="Admin">Admin</option>
                      <option value="Gestionnaire">Gestionnaire</option>
                      <option value="Agent">Agent</option>
                    </select>
                  </Field>
                  <Field label="Statut">
                    <select className={selectClass} value={selectedAgent.status}
                      onChange={e => setSelectedAgent({ ...selectedAgent, status: e.target.value })}>
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}
          </Modal>

          {/* View Modal */}
          <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails de l'utilisateur">
            {selectedAgent && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                    {selectedAgent.firstName[0]}{selectedAgent.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-base">{selectedAgent.firstName} {selectedAgent.lastName}</p>
                    <p className="text-sm text-foreground/50 flex items-center gap-1.5 mt-0.5">
                      <Mail size={13} /> {selectedAgent.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <RoleIcon role={selectedAgent.role} size={13} />
                      <span className="text-xs text-foreground/60">{selectedAgent.role}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="ID Utilisateur" value={selectedAgent.id} />
                  <div className="bg-surface/40 rounded-xl px-4 py-3">
                    <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1.5">Statut</p>
                    <Badge variant={selectedAgent.status === "Actif" ? "success" : "outline"}>
                      {selectedAgent.status}
                    </Badge>
                  </div>
                  <InfoRow label="Prénom" value={selectedAgent.firstName} />
                  <InfoRow label="Nom" value={selectedAgent.lastName} />
                  <div className="col-span-2">
                    <InfoRow label="Email" value={selectedAgent.email} />
                  </div>
                  <div className="col-span-2">
                    <InfoRow label="Rôle" value={selectedAgent.role} />
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
