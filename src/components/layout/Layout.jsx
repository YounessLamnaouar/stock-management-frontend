import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Package, Bell, Menu, X, LogOut, AlertTriangle, PackageX, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { getRoleFromPath } from "../../config/roles";
import { useAuth } from "../../context/AuthContext";
import { stocksApi } from "../../api/stocks";

export function Sidebar({ isOpen, setIsOpen, role }) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 transform bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Package size={20} />
            </div>
            StockMaster
          </div>
          <button className="lg:hidden text-foreground/50 hover:text-foreground" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="mb-4 px-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Menu Principal</span>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{role.label}</span>
          </div>
          {role.nav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== role.homePath && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface hover:text-foreground/90"
                )}
              >
                <Icon size={18} className={cn(isActive ? "text-primary" : "text-foreground/70")} />
                {item.title}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}

export function Topbar({ onMenuClick, role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const currentTitle = role.nav.find((item) => item.path === location.pathname)?.title || "Page";

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu,      setShowUserMenu]      = useState(false);
  const [alerts,      setAlerts]      = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const fetchAlerts = useCallback(() => {
    stocksApi.list()
      .then(stocks => setAlerts(stocks.filter(s => s.quantite === 0 || s.quantite <= 15)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const visibleAlerts  = alerts.filter(a => !dismissedIds.has(a.id));
  const dismissOne  = (id) => setDismissedIds(prev => new Set([...prev, id]));
  const dismissAll  = () => setDismissedIds(new Set(alerts.map(a => a.id)));

  const displayName = user ? `${user.prenom || ""} ${user.name || ""}`.trim() : role.label;
  const initials    = user
    ? ((user.prenom?.[0] || "") + (user.name?.[0] || "")).toUpperCase() || "?"
    : role.label[0].toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-foreground/70 hover:text-foreground" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold hidden md:block">{currentTitle}</h1>
      </div>

      <div className="flex items-center gap-3 lg:gap-4">
        {/* Notifications bell */}
        <div className="relative">
          <button
            className="relative p-2 rounded-full hover:bg-surface transition-colors"
            onClick={() => { setShowNotifications(v => !v); setShowUserMenu(false); }}
          >
            <Bell size={20} className="text-foreground/70" />
            {visibleAlerts.length > 0 && (
              <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                {visibleAlerts.length > 9 ? "9+" : visibleAlerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between bg-surface/50">
                <h3 className="font-semibold text-sm">Alertes de stock</h3>
                {visibleAlerts.length > 0 && (
                  <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                    {visibleAlerts.length} alerte{visibleAlerts.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {visibleAlerts.length === 0 ? (
                <p className="text-sm text-foreground/50 p-4 text-center">Tous les stocks sont suffisants</p>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto divide-y">
                    {visibleAlerts.map(s => {
                      const isRupture = s.quantite === 0;
                      return (
                        <div key={s.id} className="px-4 py-3 flex items-start gap-3 hover:bg-surface/40 transition-colors group">
                          <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isRupture ? "bg-destructive/10" : "bg-amber-500/10"}`}>
                            {isRupture
                              ? <PackageX size={14} className="text-destructive" />
                              : <AlertTriangle size={14} className="text-amber-500" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{s.produit?.nomProduit || "—"}</p>
                            <p className="text-xs text-foreground/50">{s.entrepot?.nomEntrepot || "—"}</p>
                            <span className={`text-xs font-semibold ${isRupture ? "text-destructive" : "text-amber-500"}`}>
                              {isRupture ? "Rupture de stock" : `Stock faible : ${s.quantite} unités`}
                            </span>
                          </div>
                          <button onClick={() => dismissOne(s.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface text-foreground/40 hover:text-foreground flex-shrink-0 mt-0.5">
                            <X size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-2.5 border-t bg-surface/20">
                    <button onClick={dismissAll}
                      className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-destructive transition-colors font-medium">
                      <Trash2 size={12} /> Tout effacer
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(v => !v); setShowNotifications(false); }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs text-foreground/50 mt-1">{role.label}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {initials}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border bg-card shadow-lg z-50 overflow-hidden py-1">
              <Link
                to={`${role.homePath}/parametres`}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {initials}
                </div>
                <div>
                  <p className="font-medium text-xs">{displayName}</p>
                  <p className="text-[10px] text-foreground/50">{role.label}</p>
                </div>
              </Link>
              <div className="border-t my-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
              >
                <LogOut size={15} />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const role = getRoleFromPath(location.pathname);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} role={role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} role={role} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
