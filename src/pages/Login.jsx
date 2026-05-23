import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Eye, EyeOff, ArrowRight, Shield, UserCog, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const QUICK_ROLES = [
  {
    key: "admin",
    label: "Admin",
    email: "ahmed.radi@compagnie.ma",
    password: "admin123",
    icon: Shield,
    color: "text-destructive",
    bg: "bg-destructive/10 hover:bg-destructive/20",
    desc: "Accès complet",
  },
  {
    key: "gestionnaire",
    label: "Gestionnaire",
    email: "sara.mernissi@compagnie.ma",
    password: "gest123",
    icon: UserCog,
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/20",
    desc: "Gestion stocks",
  },
  {
    key: "agent",
    label: "Agent",
    email: "karim.lahlou@compagnie.ma",
    password: "agent123",
    icon: User,
    color: "text-secondary",
    bg: "bg-secondary/10 hover:bg-secondary/20",
    desc: "Consultation",
  },
];

export default function Login() {
  const { login, loginAsRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.role.homePath, { replace: true });
    } else {
      setError("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
    }
  };

  const handleQuickLogin = async (roleKey) => {
    setError("");
    setActiveRole(roleKey);
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = loginAsRole(roleKey);
    setLoading(false);
    setActiveRole(null);
    if (result.success) navigate(result.role.homePath, { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-14 text-primary-foreground relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-20 -left-16 w-56 h-56 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
            <Package size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">StockMaster</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Gérez vos stocks<br />avec précision
          </h1>
          <p className="text-white/65 text-base leading-relaxed max-w-sm">
            Plateforme complète de gestion des stocks et entrepôts. Suivez vos transferts, gérez vos équipes et optimisez votre chaîne logistique.
          </p>
        </div>

        <div className="relative flex items-center gap-8">
          {[
            { value: "3", label: "Entrepôts" },
            { value: "7", label: "Produits" },
            { value: "3", label: "Rôles" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-8">
              {i > 0 && <div className="w-px h-10 bg-white/20" />}
              <div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-white/55 text-sm mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Package size={19} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">StockMaster</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Connexion</h2>
            <p className="mt-2 text-foreground/60">Bienvenue ! Connectez-vous à votre espace de travail.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email professionnel</label>
              <Input
                type="email"
                placeholder="prenom.nom@compagnie.ma"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-11 bg-card px-3"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mot de passe</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 bg-card pr-11 px-3"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 gap-2 text-sm font-medium"
              disabled={loading}
            >
              {loading && !activeRole ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <> Se connecter <ArrowRight size={15} /> </>
              )}
            </Button>
          </form>

          {/* Quick demo section */}
          <div className="mt-8">
            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-foreground/45 font-medium whitespace-nowrap">Accès rapide démo</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {QUICK_ROLES.map(role => {
                const Icon = role.icon;
                const isLoading = loading && activeRole === role.key;
                return (
                  <button
                    key={role.key}
                    onClick={() => handleQuickLogin(role.key)}
                    disabled={loading}
                    className={`group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/60 ${role.bg} transition-all duration-200 disabled:opacity-50 cursor-pointer`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      {isLoading
                        ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        : <Icon size={18} className={role.color} />
                      }
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold leading-none">{role.label}</div>
                      <div className="text-xs text-foreground/50 mt-1">{role.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-center text-xs text-foreground/40">
              Utilisez les boutons ci-dessus pour tester chaque interface sans identifiants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
