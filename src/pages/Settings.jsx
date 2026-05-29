import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { User, Lock, Palette } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { role } = usePermissions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Profil");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleSave = () => {
    alert("Modifications sauvegardées avec succès !");
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
          <Button
            variant="ghost"
            onClick={() => setActiveTab("Profil")}
            className={`justify-start gap-2 ${activeTab === "Profil" ? "bg-surface hover:bg-surface text-primary" : "text-foreground/70"}`}
          >
            <User size={16} /> Profil
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("Sécurité")}
            className={`justify-start gap-2 ${activeTab === "Sécurité" ? "bg-surface hover:bg-surface text-primary" : "text-foreground/70"}`}
          >
            <Lock size={16} /> Sécurité
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("Apparence")}
            className={`justify-start gap-2 ${activeTab === "Apparence" ? "bg-surface hover:bg-surface text-primary" : "text-foreground/70"}`}
          >
            <Palette size={16} /> Apparence
          </Button>
        </nav>

        <div className="space-y-6">
          {activeTab === "Profil" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Informations Personnelles</CardTitle>
                  <CardDescription>Mettez à jour vos informations de compte.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prénom</label>
                      <Input key={role.id + "-fn"} defaultValue={user?.prenom || ""} className="bg-surface/30 px-3" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <Input key={role.id + "-ln"} defaultValue={user?.name || ""} className="bg-surface/30 px-3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email professionnel</label>
                    <Input
                      key={role.id + "-em"}
                      defaultValue={user?.email || ""}
                      type="email"
                      className="bg-surface/30 px-3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rôle</label>
                    <Input value={role.label} disabled className="bg-surface/30 px-3" />
                  </div>
                  <Button onClick={handleSave}>Sauvegarder les modifications</Button>
                </CardContent>
              </Card>

            </>
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
                  <Input type="password" placeholder="••••••••" className="bg-surface/30 px-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau mot de passe</label>
                  <Input type="password" placeholder="••••••••" className="bg-surface/30 px-3" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
                  <Input type="password" placeholder="••••••••" className="bg-surface/30 px-3" />
                </div>
                <Button onClick={handleSave}>Sauvegarder les modifications</Button>
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
                  <button
                    onClick={toggleDarkMode}
                    className={`w-14 h-7 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-surface/50 border'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-0 bg-primary'}`}></div>
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
