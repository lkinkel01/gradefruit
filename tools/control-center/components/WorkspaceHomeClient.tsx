"use client";

import Link from "next/link";
import { useWorkspace } from "@/lib/use-workspace";
import { Loading, Notice } from "./ui";

const MOTIVATION = [
  "Ein klarer nächster Schritt reicht.",
  "Heute zählt, was du wirklich voranbringst.",
  "Mach es einfach. Dann mach es besser.",
  "Konzentriere dich auf das, was jetzt wichtig ist.",
];

const AREAS = [
  { href: "/tasks", title: "Meine Aufgaben", count: "tasks" },
  { href: "/ideas", title: "Ideen", count: "ideas" },
  { href: "/milestones", title: "Milestones" },
  { href: "/links", title: "Seiten & Apps" },
] as const;

export function WorkspaceHomeClient() {
  const { workspace, error } = useWorkspace();
  const day = Number(new Intl.DateTimeFormat("de-DE", { day: "numeric", timeZone: "Europe/Berlin" }).format(new Date()));
  const motivation = MOTIVATION[day % MOTIVATION.length];
  const openTasks = workspace?.tasks.filter((task) => task.status !== "erledigt").length ?? 0;
  const ideaCount = workspace?.ideas.length ?? 0;

  return (
    <div className="home-page">
      <header className="home-heading">
        <h1>Willkommen zurück, Leon.</h1>
        <p>{motivation}</p>
      </header>
      <Notice message={error} error />
      {!workspace ? <Loading /> : (
        <>
        <nav className="home-menu" aria-label="Workspace-Bereiche">
          {AREAS.map((area) => {
            const count = "count" in area ? area.count === "tasks" ? openTasks : ideaCount : null;
            return (
              <Link href={area.href} key={area.href} className="home-menu-item">
                <strong>{area.title}</strong>
                {count !== null ? <span>{count}</span> : null}
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
              </Link>
            );
          })}
        </nav>
        <Link className="import-link" href="/import">Bestehende lokale Daten importieren</Link>
        </>
      )}
    </div>
  );
}
