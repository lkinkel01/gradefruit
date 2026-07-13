<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Gemeinsame Regeln für Claude Code und Codex

- Vor Änderungen `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`,
  `PROJECT_STATUS.md` und `HANDOUT.md` lesen sowie Branch, `git status` und
  den vorhandenen Diff prüfen.
- `docs/creative-direction/` ist ein nicht freigegebener Entwurf. Ohne
  ausdrückliche Freigabe dürfen daraus keine Regeln in `PRODUCT.md`,
  `DESIGN.md`, `.impeccable/design.json` oder Produktcode übernommen werden.
- Vorhandene Änderungen nicht überschreiben, löschen, zurücksetzen oder neu
  formatieren, bevor Herkunft und Zweck geklärt sind.
- Repository-lokale Skills liegen kanonisch unter `.agents/skills/`.
  Agentenspezifische Ordner enthalten nur notwendige Adapter oder relative
  Symlinks.
- `gpt-taste` ist der Codex-orientierte Design-Craft-Skill;
  `redesign-existing-projects` dient Audits und Redesigns bestehender
  Oberflächen. Beide nur bei konkretem Mehrwert verwenden; `PRODUCT.md` und
  `DESIGN.md` haben immer Vorrang.
- Lokale Agenten- und Hook-Konfigurationen sowie Secrets werden nicht
  committed.
- Commit, Push, Merge und Deployment erfolgen nur auf ausdrückliche Anweisung.
- Bei einer Übergabe immer Branch, geänderte Dateien, Verifikation und offene
  Punkte nennen.
- Im selben lokalen Arbeitsbaum arbeitet immer nur ein Coding-Agent zur Zeit.
