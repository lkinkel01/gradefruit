"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAVIGATION = [
  { href: "/tasks", label: "Meine Aufgaben", icon: "tasks" },
  { href: "/ideas", label: "Ideen", icon: "ideas" },
  { href: "/milestones", label: "Milestones", icon: "milestones" },
  { href: "/links", label: "Links", icon: "links" },
] as const;

function NavigationIcon({ icon }: { icon: typeof NAVIGATION[number]["icon"] }) {
  if (icon === "tasks") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 6h11M8 12h11M8 18h11" /><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" /></svg>;
  }
  if (icon === "ideas") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 18h6M10 21h4" /><path d="M8.2 15.5A7 7 0 1 1 15.8 15.5c-.9.6-1.3 1.2-1.3 2h-5c0-.8-.4-1.4-1.3-2Z" /></svg>;
  }
  if (icon === "milestones") {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 20V5M5 6h11l-2.5 3L16 12H5" /><path d="m8.5 16 2 2 4-4" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></svg>;
}

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
                  <span className="navigation-icon"><NavigationIcon icon={item.icon} /></span>
                  <span className="navigation-label">{item.label}</span>
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
