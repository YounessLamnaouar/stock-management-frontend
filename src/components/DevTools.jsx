import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, UserCog, User, Code2, X, ChevronRight } from "lucide-react";
import { ROLE_LIST, getRoleFromPath } from "../config/roles";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const ROLE_ICONS = {
  admin: Shield,
  gestionnaire: UserCog,
  agent: User,
};

export default function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsRole } = useAuth();
  const currentRole = getRoleFromPath(location.pathname);

  const switchRole = (role) => {
    loginAsRole(role.id);
    navigate(role.homePath);
    setIsOpen(false);
  };

  if (location.pathname === "/login") return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 print:hidden">
      {isOpen && (
        <div className="w-72 rounded-xl border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Code2 size={16} />
              <span className="text-sm font-semibold">DevTools — Interfaces</span>
            </div>
            <button className="text-primary-foreground/80 hover:text-primary-foreground" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="p-3 space-y-1.5">
            <p className="px-1 pb-1 text-[11px] text-foreground/50">Basculer vers une interface :</p>
            {ROLE_LIST.map((role) => {
              const Icon = ROLE_ICONS[role.id];
              const isActive = currentRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => switchRole(role)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    isActive ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-surface"
                  )}
                >
                  <div className={cn("h-8 w-8 shrink-0 rounded-lg flex items-center justify-center",
                    isActive ? "bg-primary text-primary-foreground" : "bg-surface text-foreground/70"
                  )}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", isActive && "text-primary")}>{role.label}</span>
                      {isActive && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Actif</span>}
                    </div>
                    <p className="truncate text-xs text-foreground/50">{role.description}</p>
                  </div>
                  {!isActive && <ChevronRight size={16} className="text-foreground/40" />}
                </button>
              );
            })}
          </div>

          <div className="border-t px-4 py-2.5 bg-surface/40">
            <p className="text-[10px] text-foreground/50">Outil de développement — à désactiver en production.</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full pl-3 pr-4 py-3 shadow-lg transition-all",
          "bg-primary text-primary-foreground hover:bg-secondary",
          isOpen && "ring-2 ring-primary/30"
        )}
        title="Sélecteur d'interface (DevTools)"
      >
        <Code2 size={18} />
        <span className="text-sm font-semibold">{currentRole.label}</span>
      </button>
    </div>
  );
}
