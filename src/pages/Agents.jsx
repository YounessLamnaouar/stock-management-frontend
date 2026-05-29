import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TableSkeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Plus, Search, Edit, Eye, Trash2, Shield, User, UserCog, X, Mail } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { usersApi } from "../api/users";

const ROLE_MAP = { 1: "Admin", 2: "Gestionnaire", 3: "Agent" };

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
  if (role === "Admin")        return <Shield  size={size} className="text-destructive" />;
  if (role === "Gestionnaire") return <UserCog size={size} className="text-primary" />;
  return <User size={size} className="text-secondary" />;
};

export default function Agents() {
  const { can } = usePermissions();
  const [agents,  setAgents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [roleFilter,  setRoleFilter]  = useState("Tous");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewOpen,     setIsViewOpen]     = useState(false);
  const [isEditOpen,     setIsEditOpen]     = useState(false);
  const [selectedAgent,  setSelectedAgent]  = useState(null);

  const [formData, setFormData] = useState({
    prenom: "", name: "", email: "", password: "", role_id: 3
  });

  useEffect(() => {
    usersApi.list().then(setAgents).finally(() => setLoading(false));
  }, []);

  const getRoleName = (agent) => agent.role?.nomRole || ROLE_MAP[agent.role_id] || "Agent";

  const filtered = agents.filter(a => {
    const matchSearch =
      (a.prenom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.name   || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "Tous" || getRoleName(a) === roleFilter;
    return matchSearch && matchRole;
  });

  const totalPages     = Math.ceil(filtered.length / itemsPerPage);
  const paginatedAgents = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await usersApi.delete(id);
      setAgents(agents.filter(a => a.id !== id));
      toast.success("Utilisateur supprimé avec succès.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.update(selectedAgent.id, {
        prenom:  selectedAgent.prenom,
        name:    selectedAgent.name,
        email:   selectedAgent.email,
        role_id: parseInt(selectedAgent.role_id),
      });
      setAgents(agents.map(a => a.id === updated.id ? updated : a));
      setIsEditOpen(false);
      toast.success("Utilisateur mis à jour avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally { setSaving(false); }
  };

  const handleSaveAdd = async () => {
    if (!formData.prenom || !formData.name || !formData.email || !formData.password)
      return toast.error("Remplissez tous les champs obligatoires.");
    setSaving(true);
    try {
      const created = await usersApi.create({
        prenom:  formData.prenom,
        name:    formData.name,
        email:   formData.email,
        password: formData.password,
        role_id: parseInt(formData.role_id),
      });
      setAgents([created, ...agents]);
      setIsAddModalOpen(false);
      setFormData({ prenom: "", name: "", email: "", password: "", role_id: 3 });
      toast.success("Utilisateur créé avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de la création.");
    } finally { setSaving(false); }
  };

  if (loading) return <TableSkeleton rows={5} cols={5} />;

  return (
    <div className="space-y-6 relative">
      {!can.manageUsers ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="mx-auto mb-4 h-10 w-10 text-foreground/30" />
            <h3 className="text-lg font-semibold">Accès restreint</h3>
            <p className="mt-1 text-sm text-foreground/60">La gestion des utilisateurs est réservée aux administrateurs.</p>
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
                <select className="h-9 rounded-md border bg-surface/30 px-3 text-sm"
                  value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  {["Tous", "Admin", "Gestionnaire", "Agent"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAgents.map(agent => {
                    const roleName = getRoleName(agent);
                    const initials = ((agent.prenom?.[0] || "") + (agent.name?.[0] || "")).toUpperCase();
                    return (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                              {initials || "?"}
                            </div>
                            <span className="font-medium">{agent.prenom} {agent.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground/70">{agent.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <RoleIcon role={roleName} />
                            <span className="font-medium">{roleName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:bg-secondary/10"
                              onClick={() => { setSelectedAgent(agent); setIsViewOpen(true); }}>
                              <Eye size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10"
                              onClick={() => { setSelectedAgent({ ...agent }); setIsEditOpen(true); }}>
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(agent.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paginatedAgents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-foreground/40">Aucun utilisateur trouvé</TableCell>
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
            title="Ajouter un utilisateur" subtitle="Créez un nouveau compte utilisateur" onSave={handleSaveAdd}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Prénom" required>
                  <Input value={formData.prenom} placeholder="Prénom" className="bg-surface/30 h-10"
                    onChange={e => setFormData({ ...formData, prenom: e.target.value })} />
                </Field>
                <Field label="Nom" required>
                  <Input value={formData.name} placeholder="Nom" className="bg-surface/30 h-10"
                    onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </Field>
              </div>
              <Field label="Email professionnel" required>
                <Input type="email" value={formData.email} placeholder="prenom.nom@compagnie.ma"
                  className="bg-surface/30 h-10" onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </Field>
              <Field label="Mot de passe" required>
                <Input type="password" value={formData.password} placeholder="••••••••"
                  className="bg-surface/30 h-10" onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </Field>
              <Field label="Rôle" required>
                <select className={selectClass} value={formData.role_id}
                  onChange={e => setFormData({ ...formData, role_id: e.target.value })}>
                  <option value={1}>Admin</option>
                  <option value={2}>Gestionnaire</option>
                  <option value={3}>Agent</option>
                </select>
              </Field>
            </div>
          </Modal>

          {/* Edit Modal */}
          <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}
            title="Modifier l'utilisateur" subtitle="Mettez à jour les informations" onSave={handleSaveEdit}>
            {selectedAgent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Prénom" required>
                    <Input value={selectedAgent.prenom || ""} className="bg-surface/30 h-10"
                      onChange={e => setSelectedAgent({ ...selectedAgent, prenom: e.target.value })} />
                  </Field>
                  <Field label="Nom" required>
                    <Input value={selectedAgent.name || ""} className="bg-surface/30 h-10"
                      onChange={e => setSelectedAgent({ ...selectedAgent, name: e.target.value })} />
                  </Field>
                </div>
                <Field label="Email professionnel" required>
                  <Input type="email" value={selectedAgent.email || ""} className="bg-surface/30 h-10"
                    onChange={e => setSelectedAgent({ ...selectedAgent, email: e.target.value })} />
                </Field>
                <Field label="Rôle" required>
                  <select className={selectClass} value={selectedAgent.role_id}
                    onChange={e => setSelectedAgent({ ...selectedAgent, role_id: e.target.value })}>
                    <option value={1}>Admin</option>
                    <option value={2}>Gestionnaire</option>
                    <option value={3}>Agent</option>
                  </select>
                </Field>
              </div>
            )}
          </Modal>

          {/* View Modal */}
          <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails de l'utilisateur">
            {selectedAgent && (() => {
              const roleName = getRoleName(selectedAgent);
              const initials = ((selectedAgent.prenom?.[0] || "") + (selectedAgent.name?.[0] || "")).toUpperCase();
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                      {initials || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-base">{selectedAgent.prenom} {selectedAgent.name}</p>
                      <p className="text-sm text-foreground/50 flex items-center gap-1.5 mt-0.5">
                        <Mail size={13} /> {selectedAgent.email}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <RoleIcon role={roleName} size={13} />
                        <span className="text-xs text-foreground/60">{roleName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="ID Utilisateur" value={selectedAgent.id} />
                    <InfoRow label="Rôle"           value={roleName} />
                    <InfoRow label="Prénom"         value={selectedAgent.prenom} />
                    <InfoRow label="Nom"            value={selectedAgent.name} />
                    <div className="col-span-2"><InfoRow label="Email" value={selectedAgent.email} /></div>
                  </div>
                </div>
              );
            })()}
          </Modal>
        </>
      )}
    </div>
  );
}
