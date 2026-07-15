"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/lib/use-workspace";
import { Loading, Notice } from "./ui";

const AREAS = [
  { href: "/tasks", title: "Meine Aufgaben" },
  { href: "/ideas", title: "Ideen" },
  { href: "/milestones", title: "Milestones" },
  { href: "/links", title: "Links" },
] as const;

function formatDateTime(date: Date): string {
  const dateText = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
  const timeText = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(date);
  const capitalizedDate = dateText.charAt(0).toLocaleUpperCase("de-DE") + dateText.slice(1);
  return `${capitalizedDate} · ${timeText} Uhr`;
}

export function WorkspaceHomeClient() {
  const { workspace, error } = useWorkspace();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    updateClock();
    const interval = window.setInterval(updateClock, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <header className="home-heading">
        <h1>Willkommen zurück Leon.</h1>
        <time dateTime={now?.toISOString()}>{now ? formatDateTime(now) : "Datum und Uhrzeit werden geladen …"}</time>
      </header>
      <Notice message={error} error />
      {!workspace ? <Loading /> : (
        <nav className="home-menu" aria-label="Workspace-Bereiche">
          {AREAS.map((area) => (
            <Link href={area.href} key={area.href} className="home-menu-item">
              <strong>{area.title}</strong>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
