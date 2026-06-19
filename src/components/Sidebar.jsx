import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldAlert,
  CalendarDays,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { key: "jugadores", label: "Jugadores", icon: Users, color: "accent" },
  {
    key: "restricciones",
    label: "Restricciones",
    icon: ShieldAlert,
    color: "amber",
  },
  { key: "partidos", label: "Partidos", icon: CalendarDays, color: "accent" },
];

function NavButton({ item, active, badge, onClick }) {
  const { icon: Icon, label, color } = item;

  const activeStyles =
    color === "amber"
      ? "text-amber-500 bg-amber-500/10 border-amber-500"
      : "text-[var(--c-accent)] bg-[var(--c-accent-dim)] border-[var(--c-accent)]";

  const badgeStyles =
    color === "amber"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
      : "bg-[var(--c-accent-dim)] text-[var(--c-accent)] border-[var(--c-accent)]/20";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all border-l-4 w-full ${
        active
          ? activeStyles
          : "text-[var(--c-muted)] border-transparent hover:text-[var(--c-text)] hover:bg-[var(--c-surface2)]/50"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
      {badge != null && badge !== 0 && (
        <span
          className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeStyles}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// Contenido compartido entre desktop y drawer mobile
function SidebarContent({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  badges,
  onNavClick,
}) {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--c-border)] shrink-0">
        <span className="text-2xl">🏐</span>
        <span className="font-display text-xl font-bold tracking-wider text-[var(--c-accent)] uppercase">
          VolleyWood
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col mt-3 flex-1 min-h-0">
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.key}
            item={item}
            active={activeTab === item.key}
            badge={badges[item.key]}
            onClick={() => {
              setActiveTab(item.key);
              onNavClick?.();
            }}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[var(--c-border)] space-y-2 shrink-0">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--c-border)] py-2 text-xs font-semibold text-[var(--c-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-surface2)] transition"
        >
          {darkMode ? (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
          {darkMode ? "Modo claro" : "Modo oscuro"}
        </button>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({
  totalJugadores,
  totalRestricciones,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const badges = {
    jugadores: totalJugadores,
    restricciones: totalRestricciones,
    partidos: null,
  };

  // Cerrar drawer al pasar a desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Bloquear scroll del body con el drawer abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ══ DESKTOP: sidebar fijo lateral ══ */}
      <div className="hidden lg:block w-56 flex-shrink-0" aria-hidden="true" />
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-56 border-r border-[var(--c-border)] bg-[var(--c-surface)] flex-col z-30">
        <SidebarContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          badges={badges}
        />
      </aside>

      {/* ══ MOBILE: topbar + drawer ══ */}
      <div className="lg:hidden">
        {/* Topbar fija */}
        <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-[var(--c-surface)] border-b border-[var(--c-border)]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏐</span>
            <span className="font-display text-base font-bold tracking-wider text-[var(--c-accent)] uppercase">
              VolleyWood
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-[var(--c-muted)] hover:bg-[var(--c-surface2)] hover:text-[var(--c-text)] transition"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Spacer para compensar la topbar */}
        <div className="h-14" />

        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        />

        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 h-screen w-64 z-50 bg-[var(--c-surface)] border-r border-[var(--c-border)] shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Botón cerrar */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--c-muted)] hover:bg-[var(--c-surface2)] hover:text-[var(--c-text)] transition"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>

          <SidebarContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            badges={badges}
            onNavClick={() => setMobileOpen(false)}
          />
        </aside>
      </div>
    </>
  );
}
