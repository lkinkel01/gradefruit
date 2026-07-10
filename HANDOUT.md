# HANDOUT — Übergabe für die nächste Claude-Code-Session

> Zweck: Diese Datei überbrückt den Chat-Wechsel. Die neue Session liest zuerst
> diese Datei + PROJECT_STATUS.md und kann dann nahtlos weitermachen.
> Dauerhafte Regeln stehen in CLAUDE.md (lädt automatisch), der laufende
> Projektstand in PROJECT_STATUS.md (auch die Übergabe an ChatGPT).

## So startest du die neue Session (Leon)

1. Neue Claude-Code-Session **im Projektordner `/Users/leonkinkel/Gradefruit`**
   starten (im Desktop-App den Gradefruit-Ordner als Projekt öffnen). Nur dann
   lädt die CLAUDE.md mit allen Projektregeln automatisch.
2. Erste Nachricht (kopierbar):
   > „Lies HANDOUT.md und PROJECT_STATUS.md. Dann mach weiter mit: [dein Ziel,
   > z. B. Verkaufsstart-Checkliste / Sprint 10 / hier sind meine
   > Impressums-Daten …]"
3. Die Sprint-Prompts der letzten Sessions haben sehr gut funktioniert —
   gleiches Format weiterverwenden (Ziel, nummerierte Punkte, Verbote,
   „Nach Abschluss: Typecheck, Build, Browser testen, Commit, Push").

## Stand (03.07.2026, letzter Commit `c9a2898`, alles live auf gradefruit.de)

Sprints 01–09 sind abgeschlossen und deployt. Höhepunkte: warme Farbwelt +
neues Grapefruit-Logo (`src/components/Logo.tsx`, `filled`-Prop 0–6 für
künftige Fortschritts-Anzeigen), zentrierte Landing („Die eine Plattform für
dein Mathe-Abi"), Lernbereich mit Zusammenfassung/Übungen + klickbaren
Formeln/Schritten, Gradefruit-Coach mit echter Spracheingabe (Web Speech API),
Lernfeed V3 („TikTok für Mathe": 20 Karten aus 7 Typen, Videos mit
Autoplay + menschlicher Stimme), Dashboard mit Namens-Begrüßung und
Prüfungs-Countdown, AGB + Widerrufsbelehrung + rechtssicherer Checkout
(MwSt.-Ausweis, Pflicht-Checkbox nach § 356 Abs. 5 BGB).

Details pro Feature: siehe PROJECT_STATUS.md.

## 🔴 Nächster großer Block: Verkaufsstart (Leon + Claude gemeinsam)

**Stripe läuft noch im TESTMODUS — niemand kann echt bezahlen.** Reihenfolge:

1. **Platzhalter füllen** (Claude trägt ein, sobald Leon die Daten nennt):
   Impressum, `/agb`, `/widerruf` enthalten rote Felder — vollständiger Name,
   Anschrift, E-Mail, USt-Status, Zugangs-Enddatum (z. B. 31.07.2027),
   AGB-Stand-Datum. **Offene Frage an Leon: Kleinunternehmer nach § 19 UStG?**
   Falls ja: „inkl. MwSt." überall gegen den § 19-Hinweis tauschen
   (CheckoutModal.tsx, LandingPage.tsx Kurse-Sektion, AGB § 5).
2. **Juristische Prüfung** der drei Rechtstexte (eRecht24 / IT-Recht Kanzlei /
   Anwalt) — die Texte sind sorgfältige Entwürfe, keine Rechtsberatung.
3. **Stripe TEST → LIVE** (Leon im Stripe-Dashboard, ~20 Min):
   a) Schalter auf „Live", ggf. Konto-Verifizierung abschließen.
   b) Live-Produkte + Preise anlegen: GK 79 € einmalig + 14,90 €/Monat,
      LK 99 € einmalig + 17,90 €/Monat → die 4 `price_…`-IDs kopieren.
   c) Live-Webhook: Entwickler → Webhooks → `https://www.gradefruit.de/api/stripe/webhook`
      mit Ereignissen `checkout.session.completed`,
      `customer.subscription.created/updated/deleted`, `charge.refunded`
      → `whsec_…` kopieren.
   d) Vercel → Environment Variables auf Live umstellen: `STRIPE_SECRET_KEY`
      (sk_live), `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ONE_TIME`,
      `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_LK_ONE_TIME`,
      `STRIPE_PRICE_LK_MONTHLY` → Redeploy.
   e) Echter Testkauf mit eigener Karte → Freischaltung prüfen → in Stripe
      erstatten → prüfen, dass der Zugang wieder entzogen wird.
   Claude verifiziert die Schritte von lokal mit (read-only Skripte).

## 🟠 Kleinere offene Punkte

- **ElevenLabs-Kontingent leer** (95/10.000 Zeichen): Video `l1` („Abstand
  zweier Punkte") läuft stumm mit Untertiteln. Nach Aufstockung:
  `node --env-file=.env.local scripts/generate-audio.mjs` ausführen und in
  `src/lib/scenes.ts` bei `l1` `hasAudio: true` setzen.
- **Prüfungsdatum ist Platzhalter** (03.05.2027 „voraussichtlich") — steht an
  ZWEI Stellen: `src/components/Dashboard.tsx` und `src/app/feed/page.tsx`
  (Konstante `EXAM_DATE`). Offiziellen Termin eintragen, sobald bekannt.
- **Fortschritts-Zähler** („x/79 Aufgaben") zählen die DB-Tabelle `lessons`
  (79 Einträge), nicht die 133 echten Aufgaben — Angleichen ist ein eigener
  kleiner Sprint (DB-Seed + ProgressContext).
- **1:1 Nachhilfe** ist ehrliche „Bald verfügbar"-Seite; Tutor-Funktionen
  überall nur als „bald" markiert — nichts vortäuschen.

## Wichtige Orte im Code

- `PROJECT_STATUS.md` — Projektstand, auch Übergabe an ChatGPT (nach großen
  Änderungen aktualisieren; Leon kopiert ihn in ChatGPT).
- `CLAUDE.md` — dauerhafte Regeln (Sicherheit, Konventionen, Befehle).
- Inhalte: `src/lib/*Tasks.ts` (133 Aufgaben, GK+LK), `src/lib/summaries.ts`
  (Formelsammlungen), `src/lib/scenes.ts` (7 Videos, mp3s in `public/audio/`).
- Feed: `src/app/feed/page.tsx` (Kartentypen-System V3).
- Player: `SceneModal.tsx` (exportiert `ScenePlayer` für Inline-Nutzung).
- Deep-Links: `localStorage` `gf-open-topic` / `gf-open-tab` (einmalig,
  StrictMode-sicher via Refs konsumiert).

## Bewährte Arbeitsweise (Kurzfassung)

- Pro Sprint: umsetzen → `./node_modules/.bin/tsc --noEmit` → `unset
  ANTHROPIC_API_KEY && npm run build` → im Preview-Browser verifizieren →
  gezielt `git add <dateien>` → Commit → Push (Vercel deployt automatisch).
- UI-Tests, die Login brauchen: Wegwerf-Konto
  `gradefruit.<zweck>.test@gmail.com` registrieren, danach per Admin-Skript
  löschen (Muster siehe CLAUDE.md/Chat-Historie; E-Mail-Bestätigung ist aus).
- Ehrlichkeit ist Produktprinzip: keine erfundenen Zahlen, Bewertungen,
  Termine oder Features; „bald" klar kennzeichnen.
