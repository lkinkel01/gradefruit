"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAVIGATION = [
  { href: "/tasks", label: "Meine Aufgaben" },
  { href: "/ideas", label: "Ideen" },
  { href: "/milestones", label: "Milestones" },
  { href: "/links", label: "Seiten & Apps" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isOverview = pathname === "/overview";

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("gradefruit-workspace-theme", next);
  }

  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#workspace-content">Zum Inhalt</a>
      <header className={`workspace-topbar${isLogin ? " login-topbar" : ""}`}>
        <Link className="workspace-brand" href={isLogin ? "/login" : "/overview"}>Gradefruit Workspace</Link>
        {!isOverview && !isLogin ? (
          <nav className="compact-navigation" aria-label="Hauptbereiche">
            {NAVIGATION.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={active ? "active" : undefined}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : <span />}
        <div className="topbar-actions">
        {!isLogin ? <form action="/api/auth/logout" method="post"><button className="logout-button" type="submit">Abmelden</button></form> : null}
        <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Darstellung wechseln" title="Darstellung wechseln">
          <svg className="sun-icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></svg>
          <svg className="moon-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 15.2A8 8 0 1 1 8.8 4 6.3 6.3 0 0 0 20 15.2Z" /></svg>
        </button>
        </div>
      </header>
      <main className="workspace-main" id="workspace-content">{children}</main>
    </div>
  );
}
