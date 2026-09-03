<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Gemeinsame Arbeitsweise für Codex und Claude Code

- Vor Änderungen `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`,
  `PROJECT_STATUS.md` und `HANDOUT.md` lesen sowie Branch, `git status` und den
  vorhandenen Diff prüfen.
- Notion ist das priorisierte Arbeitsboard. Pro Sprint gibt es genau eine
  aktive technische Aufgabe; neue Ideen kommen zuerst ins Backlog.
- Immer nur ein Coding-Agent arbeitet im lokalen Arbeitsbaum. Bei einem Wechsel
  werden Branch, Diff, erledigte Schritte, Prüfungen, offene Punkte und der
  nächste Schritt in `HANDOUT.md` festgehalten.
- Vorhandene Änderungen, ungetrackte Dateien und Stashes nicht überschreiben,
  löschen, anwenden oder neu formatieren, bevor Herkunft und Zweck geklärt sind.
- Leon nur für echte Produkt-, Kreativ-, Rechts-, Kosten- oder externe
  Freigaben unterbrechen. Technische Detailentscheidungen selbstständig treffen.
- Nach vollständig bestandener Prüfung dürfen Codex und Claude Code einen
  lokalen, selektiv gestagten Sicherungs-Commit selbstständig erstellen.
  Push, Merge und Deployment bleiben ausdrücklich freigabepflichtig.
