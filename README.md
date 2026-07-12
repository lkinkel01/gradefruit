# Gradefruit

**Die Lernplattform für das schriftliche Mathe-Abitur Hessen 2027.**
Prüfungsnahe Original-Aufgaben mit Schritt-für-Schritt-Lösungen,
Erklärvideos mit echter Stimme, ein KI-Coach und ein Wiederholungssystem
mit drei Lernstufen — für Grundkurs und Leistungskurs.

Live: [www.gradefruit.de](https://www.gradefruit.de)

## Stack

Next.js 16 (App Router) · TypeScript · CSS Modules · Supabase (Auth +
Postgres mit RLS) · Stripe (Checkout, Webhook, Kundenportal) · ElevenLabs
(Video-Stimme) · Anthropic API (KI-Coach) · Vercel (Auto-Deploy von `main`)

## Projektstruktur

```
src/app/          Seiten & API-Routen (App Router); /feed = Reel-Modus
src/components/   UI-Komponenten mit CSS-Modulen
src/lib/          Inhalte (Aufgaben, Formeln, Videos) & Logik (Fortschritt)
supabase/         SQL-Referenz (Schema, Seeds, RLS)
scripts/          Hilfsskripte (Audio-Generierung, Webhook-Check, Testkonten)
public/audio/     mp3s der Erklärvideos
```

## Lokales Setup

```bash
npm install
# .env.local mit den Schlüsseln anlegen (Namen siehe CLAUDE.md — Werte
# kommen aus Supabase/Stripe/ElevenLabs/Anthropic, niemals einchecken)
npm run dev        # http://localhost:3000
```

Build und Typecheck:

```bash
./node_modules/.bin/tsc --noEmit
unset ANTHROPIC_API_KEY && npm run build
```

## Entwicklungsworkflow

Das Projekt wird von Leon (Produkt) gemeinsam mit Claude Code (Umsetzung)
entwickelt — in Sprints, mit Verifikation vor jedem Push (Typecheck, Build,
Browser-Test hell/dunkel/mobil). Push auf `main` deployt automatisch live.
Details und alle Regeln: [CLAUDE.md](CLAUDE.md).

## Wichtige Dokumente

| Datei | Inhalt |
|---|---|
| [PRODUCT.md](PRODUCT.md) | Produktvision, Zielgruppe, Marke, Prinzipien, Strategie |
| [DESIGN.md](DESIGN.md) | Designsystem: Tokens, Typografie, Komponenten, Motion |
| [CLAUDE.md](CLAUDE.md) | Entwicklungsregeln, Sicherheitsregeln, Befehle |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Aktueller Stand + Sprint-Historie |
| [HANDOUT.md](HANDOUT.md) | Session-Übergabe |
