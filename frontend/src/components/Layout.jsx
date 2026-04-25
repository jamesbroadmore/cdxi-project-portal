import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard, Users, FolderKanban, Clock, FileText,
  Bot, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, Sun, Moon,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users,           label: "Clients",   href: "/clients" },
  { icon: FolderKanban,    label: "Projects",  href: "/projects" },
  { icon: Clock,           label: "Billing",   href: "/billing" },
  { icon: FileText,        label: "Contracts", href: "/contracts" },
  { icon: Bot,             label: "AI Ops",    href: "/agents" },
  { icon: Settings,        label: "Settings",  href: "/settings" },
];

/* ─── Iconic cdxi wordmark ─────────────────────────────── */
function CdxiLogo({ collapsed }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${collapsed ? "justify-center" : ""}`}>
      {collapsed ? (
        /* Collapsed: "cd" pill */
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-900/40">
          <span
            className="font-righteous text-sm text-white leading-none tracking-tight"
            style={{ fontFamily: "'Righteous', cursive" }}
          >
            cd
          </span>
        </div>
      ) : (
        <div className="flex items-baseline gap-0">
          {/* Main wordmark */}
          <span
            className="text-[26px] leading-none tracking-tight"
            style={{
              fontFamily: "'Righteous', cursive",
              background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 55%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            cdxi
          </span>
          {/* OS badge */}
          <span
            className="ml-1.5 mb-0.5 rounded-sm bg-indigo-500/15 border border-indigo-500/25 px-1 py-px text-[8px] font-mono text-indigo-400 leading-none uppercase tracking-widest self-end"
          >
            OS
          </span>
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === "dark";

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-800/70 bg-zinc-950
          transition-all duration-200 ease-in-out
          ${collapsed ? "w-16" : "w-56"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-zinc-800/70 px-4 py-4 ${collapsed ? "justify-center" : ""}`}>
          <CdxiLogo collapsed={collapsed} />
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map(({ icon: Icon, label, href }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 mb-0.5 text-sm transition-all
                 ${isActive
                   ? "bg-indigo-500/10 text-indigo-300 font-medium"
                   : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                 }
                 ${collapsed ? "justify-center" : ""}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-800/70 p-2 space-y-1">
          {!collapsed && user && (
            <div className="px-2 pb-1">
              <div className="text-xs font-medium text-zinc-300 truncate">
                {user.name || user.display_name || user.email}
              </div>
              <div className="text-[10px] text-zinc-500 capitalize">{user.role}</div>
            </div>
          )}
          <button
            onClick={logout}
            title="Sign out"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-800/50 hover:text-red-400 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex absolute -right-3 top-20 z-50 h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white shadow transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-200 ${collapsed ? "lg:pl-16" : "lg:pl-56"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-800/70 bg-zinc-950/90 backdrop-blur px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-600 font-mono">
            {new Date().toLocaleDateString("en-AU", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </div>

          <div className="flex items-center gap-2">
            {/* Live pill */}
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Live</span>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Avatar */}
            <div className="h-7 w-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-indigo-300">
                {(user?.name || user?.email || "?")[0].toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}
