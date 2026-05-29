import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { User, Lock, Palette } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/auth";

export default function Settings() {
  const { role } = usePermissions();
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("Profil");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({ prenom: "", name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({ prenom: user.prenom || "", name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileForm.name || !profileForm.email) return toast.error("Le nom et l'email sont obligatoires.");
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile(profileForm);
      updateUser(updated);
      toast.success("Profil mis à jour avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.errors?.email?.[0] || "Erreur lors de la mise à jour.");
    } finally { setSavingProfile(false); }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.password || !passwordForm.password_confirmation)
      return toast.error("Veuillez remplir tous les champs.");
    if (passwordForm.password !== passwordForm.password_confirmation)
      return toast.error("Les nouveaux mots de passe ne correspondent pas.");
    if (passwordForm.password.length < 6)
      return toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
    setSavingPassword(true);
    try {
      await authApi.updatePassword(passwordForm);
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
      toast.success("Mot de passe mis à jour avec succès.");
    } catch (e) {
      toast.error(e.response?.data?.message || "Mot de passe actuel incorrect.");
    } finally { setSavingPassword(false); }
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Paramètres</h2>
        <p className="text-foreground/60">Gérez les préférences de votre compte et du système.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-col gap-2">
          {["Profil", "Sécurité", "Apparence"].map(tab => {
            const Icon = tab === "Profil" ? User : tab === "Sécurité" ? Lock : Palette;
            return (
              <Button key={tab} variant="ghost" onClick={() => setActiveTab(tab)}
                className={`justify-start gap-2 ${activeTab === tab ? "bg-surface hover:bg-surface text-primary" : "text-foreground/70"}`}>
                <Icon size={16} /> {tab}
              </Button>
            );
          })}
        </nav>

        <div className="space-y-6">
          {activeTab === "Profil" && (
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de compte.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prénom</label>
                    <Input value={profileForm.prenom} onChange={e => setProfileForm({ ...profileForm, prenom: e.target.value })}
                      placeholder="Prénom" className="bg-surface/30 px-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Nom" className="bg-surface/30 px-3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email professionnel</label>
                  <Input value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    type="email" placeholder="email@exemple.com" className="bg-surface/30 px-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rôle</label>
                  <Input value={role.label} disabled className="bg-surface/30 px-3" />
                </div>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? "Sauvegarde..." : "Sauvegarder les modifications"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "Sécurité" && (
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>Gérez votre mot de passe et vos paramètres de connexion.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mot de passe actuel</label>
                  <Input type="password" placeholder="••••••••" className="bg-surface/30 px-3"
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau mot de passe</label>
                  <Input type="password" placeholder="••••••••" className="bg-surface/30 px-3"
                    value={passwordForm.password}
                    onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                  <Input type="password" placeholder="••••••••" className="bg-surface/30 px-3"
                    value={passwordForm.password_confirmation}
                    onChange={e => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })} />
                </div>
                <Button onClick={handleSavePassword} disabled={savingPassword}>
                  {savingPassword ? "Sauvegarde..." : "Changer le mot de passe"}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "Apparence" && (
            <Card>
              <CardHeader>
                <CardTitle>Apparence de l'application</CardTitle>
                <CardDescription>Personnalisez le thème de votre espace de travail.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-lg">Mode Sombre (Dark Mode)</p>
                    <p className="text-sm text-foreground/60">Basculer l'interface en thème foncé.</p>
                  </div>
                  <button onClick={toggleDarkMode}
                    className={`w-14 h-7 rounded-full p-1 transition-colors ${isDarkMode ? "bg-primary" : "bg-surface/50 border"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-7" : "translate-x-0 bg-primary"}`} />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
