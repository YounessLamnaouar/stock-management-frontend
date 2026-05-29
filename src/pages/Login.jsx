import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Zap, Lock, BarChart2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import WareTrackLogo from "../components/ui/WareTrackLogo";

const FEATURES = [
  { icon: Zap,      text: "Interface intuitive et réactive" },
  { icon: Lock,     text: "Données sécurisées et chiffrées" },
  { icon: BarChart2, text: "Tableaux de bord en temps réel" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate(result.role.homePath, { replace: true });
    } else {
      setError("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[46%] bg-primary flex-col justify-between p-14 text-primary-foreground relative overflow-hidden"
        style={{ borderRadius: "0 4rem 4rem 0" }}
      >
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-16 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2 flex items-center justify-center">
            <WareTrackLogo className="w-10 h-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight">WareTrack</span>
        </div>

        {/* Headline */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Gérez vos stocks<br />avec précision
          </h1>
          <p className="text-white/65 text-base leading-relaxed max-w-sm">
            Plateforme complète de gestion des stocks et entrepôts. Suivez vos transferts, gérez vos équipes et optimisez votre chaîne logistique.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="relative space-y-3">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-white/80" />
                </div>
                <span className="text-white/70 text-sm">{feat.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="rounded-lg bg-primary p-1.5 flex items-center justify-center">
              <WareTrackLogo className="w-8 h-[22px]" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">WareTrack</span>
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
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-11 gap-2 text-sm font-medium" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <> Se connecter <ArrowRight size={15} /> </>
              )}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
