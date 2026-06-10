"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Code2,
  PlayCircle,
  RotateCcw,
  BarChart3,
  CalendarCheck,
  BookOpen,
  Target,
  Settings,
  Rocket,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { StreakChip } from "./StreakChip";

const primaryNav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patterns", label: "Patterns", icon: Layers },
  { href: "/problems", label: "Problems", icon: Code2 },
  { href: "/videos", label: "Videos", icon: PlayCircle },
  { href: "/revisions", label: "Revisions", icon: RotateCcw },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/review", label: "Weekly review", icon: CalendarCheck },
  { href: "/journal", label: "Journal", icon: BookOpen },
];

// Secondary nav (settings-style) — kept out of primary list to reduce clutter.
const secondaryNav = [
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Sidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
} = {}) {
  const pathname = usePathname();

  const renderLink = (item: (typeof primaryNav)[number]) => {
    const isActive =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={`
          flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150
          ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
          ${
            isActive
              ? "bg-[var(--color-accent-blue-dim)]/50 text-[var(--color-accent-blue)]" +
                (collapsed ? "" : " nav-active")
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)]"
          }
        `}
      >
        <Icon className="w-4.5 h-4.5 shrink-0" />
        {!collapsed && item.label}
      </Link>
    );
  };

  return (
    <aside className="h-full w-full sidebar-glass flex flex-col">
      {/* Logo */}
      <div className={`border-b border-[var(--color-border-subtle)] ${collapsed ? "p-3" : "p-5"}`}>
        <Link
          href="/"
          onClick={onNavigate}
          className={`flex items-center gap-3 group ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "DSA Mission Control" : undefined}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-shadow shrink-0">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)]">
                DSA Mission
              </h1>
              <p className="text-[10px] font-medium text-[var(--color-accent-blue)] uppercase tracking-widest">
                Control
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Primary navigation */}
      <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
        {primaryNav.map(renderLink)}

        <div className="pt-4 mt-2 border-t border-[var(--color-border-subtle)] space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
              Settings
            </p>
          )}
          {secondaryNav.map(renderLink)}
        </div>
      </nav>

      {/* Footer */}
      <div className={`border-t border-[var(--color-border-subtle)] space-y-2 ${collapsed ? "p-2" : "p-3"}`}>
        {!collapsed && <StreakChip />}

        {/* Collapse toggle (desktop only — mobile drawer has no collapse) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`w-full flex items-center gap-2 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors py-2 ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                Collapse
              </>
            )}
          </button>
        )}

        {!collapsed && (
          <div className="text-[10px] text-[var(--color-text-muted)] text-center">
            <span className="font-mono">v0.2.0</span>
            <span className="mx-1.5">·</span>
            <span>Prakash</span>
          </div>
        )}
      </div>
    </aside>
  );
}
