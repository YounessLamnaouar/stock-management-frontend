import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Package, Bell, Menu, X, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { getRoleFromPath } from "../../config/roles";
import { useAuth } from "../../context/AuthContext";

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
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between bg-surface/50">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              <p className="text-sm text-foreground/50 p-4 text-center">Aucune notification</p>
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
