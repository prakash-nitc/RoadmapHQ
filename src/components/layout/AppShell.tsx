"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Rocket } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* Desktop sidebar — visible above 768px via .app-sidebar-desktop */}
      <div className="app-sidebar-desktop app-sidebar-fixed">
        <Sidebar />
      </div>

      {/* Mobile drawer — only rendered/visible below 768px */}
      <div className="app-mobile-drawer-root">
        {drawerOpen && (
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden />
        )}
        <div
          className={`drawer-panel ${
            drawerOpen ? "drawer-panel-open" : "drawer-panel-closed"
          }`}
        >
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      {/* Main content wrapper — padded left on desktop via .app-main-wrapper */}
      <div
        className="app-main-wrapper"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Mobile top bar — hidden on desktop via .app-mobile-header */}
        <header
          className="app-mobile-header"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            height: "56px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg-secondary)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--color-bg-card)]"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold">DSA Mission</span>
          </Link>
          <div style={{ width: 36 }} />
        </header>

        <main className="app-main-padding" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </>
  );
}
