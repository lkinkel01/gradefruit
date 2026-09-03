# HANDOUT — Übergabe für die nächste Claude-Code-Session

## Aktuelle operative Übergabe — 2026-09-03

Dieser Abschnitt ist die aktuelle Wahrheit für den Wechsel zwischen Codex und
Claude Code. Die ältere Übergabe darunter bleibt vorerst als Historie erhalten.

- **Aktiver Branch:** `codex/launch-readiness`, Basis `12a314f` = `main` =
  `origin/main` zum Start dieses Sprints.
- **Aktueller Sprint:** sechs fachlich passende Erklärvideos für den
  Leistungskurs ergänzen. Ziel ist ein gleichwertiges Grundangebot für GK und
  LK vor dem ersten Verkauf. Status: `Wartet auf andere`. Leon hat am
  03.09.2026 entschieden, externe Audioerzeugung zunächst zu vertagen und bis
  auf Weiteres keine ElevenLabs-Kosten auszulösen.
- **Lokal umgesetzt:** sechs LK-Szenen in `src/lib/scenes.ts`, Zuordnung zu je
  zwei LK-Aufgaben aus Analysis, Linearer Algebra und Stochastik, getrennte
  GK/LK-Auswahl in Videoübersicht und Reel-Modus sowie aktualisierter
  Content-Index. Beim Zwei-Sigma-Beispiel ist die 95,4-%-Näherungsregel jetzt
  sauber vom exakten Binomialwert 96,48 % getrennt.
- **Prüfstand:** Content-Check mit 133 Aufgaben und 0 Befunden bestanden;
  TypeScript bestanden; Produktions-Build bestanden; gezielter ESLint-Lauf
  ohne Fehler. Zwei bekannte Hinweise betreffen vorhandene `<img>`-Elemente
  der Landingpage. Desktop und 390-px-Landing wurden lokal im Browser geprüft:
  kein horizontaler Überlauf und keine Konsolenfehler. Das Repository besitzt
  kein `npm test`-Skript.
- **Bewusst vertagt:** 42 fehlende MP3-Dateien mit zusammen 5.410 Zeichen Sprechtext für
  die sechs neuen LK-Szenen. Der Generator kann sie jetzt gezielt auswählen,
  vorab als Dry-Run zählen und atomar speichern. Der Content-Check verhindert
  jetzt außerdem, dass eine unvollständige Szene versehentlich als vertont
  ausgeliefert wird.
  ElevenLabs wird vorerst nicht gestartet, weil Leon zunächst kostenlos
  weiterarbeiten möchte. Erst nach einer späteren neuen Freigabe dürfen Texte
  übertragen und Kontingent verbraucht werden. Erst vollständig erzeugte
  Szenen erhalten `hasAudio`.
- **Notion:** Launch-Plan auf MVP-first-Arbeitsweise aktualisiert; die
  LK-Video-Aufgabe steht auf `Wartet auf andere`. Vier neue Ideen liegen bewusst im späteren
  Ideen-Backlog: STARK-2027-Benchmark, Wettbewerbsvergleich, eigener
  Sprach-/Erklärstil und authentische Bildwelt.
- **Automatische Fortsetzung:** Der Codex-Task `Gradefruit Launch-Fortsetzung`
  arbeitet nach dem lokalen Sicherungs-Commit mit dem nächsten kostenlosen
  Launch-Blocker weiter. Mac und Codex-App können eingeschaltet bleiben; ein
  lokaler
  Wachprozess läuft. Die
  Automatik arbeitet nie parallel, führt keine kostenpflichtigen oder externen
  Aktionen ohne Freigabe aus und veröffentlicht nicht selbst. Vollständig
  geprüfte lokale Zwischenstände dürfen selektiv committet werden.
  Erreicht Codex sein Nutzungslimit, übernimmt Claude Code nicht technisch von
  allein: Leon startet Claude einmal, danach reicht `HANDOUT.md` für die
  nahtlose Fortsetzung.
- **Aktuelle Geschäftsentscheidung:** nur Einmalkauf, GK 49 €, LK 69 €. Ältere
  Angaben zu Abonnements oder 79 €/99 € weiter unten sind überholt.
- **Nicht anfassen oder stagen:** die schon vorher geänderte übrige Übergabe,
  `# Gradefruit Logokonzept.zip`, `final/` und `stash@{0}` zur
  Creative-Direction-Validierung.
- **Nächster Schritt:** Auf dem danach sauberen Arbeitsstand den nächsten
  kostenlosen Launch-Blocker aus Notion auswählen. Die Audioerzeugung bleibt
  vertagt. Kein Push, Merge oder Deployment ohne Leons ausdrückliche Freigabe.

> Zweck: Diese Datei überbrückt den Chat-Wechsel. Nur Start-Anleitung, aktueller
> Stand und offene Punkte. Details stehen genau einmal woanders:
> Regeln in [CLAUDE.md](CLAUDE.md) (lädt automatisch, enthält die
> Dokumenten-Landkarte), Produkt in [PRODUCT.md](PRODUCT.md), Design in
> [DESIGN.md](DESIGN.md), vollständige Historie in
> [PROJECT_STATUS.md](PROJECT_STATUS.md).
>
> **Letzte Aktualisierung: 2026-07-20** (nach der Feinschliff-Runde 4:
> Marken-Orange vereinheitlicht, Social-Links, TikTok-Reel).

## So startest du die neue Session (Leon)

1. Neue Claude-Code-Session **im Projektordner `/Users/leonkinkel/Gradefruit`**
   öffnen — nur dann lädt CLAUDE.md automatisch.
2. Erste Nachricht (kopierbar):
   > „Lies HANDOUT.md und PROJECT_STATUS.md, dann prüf Branch, `git status` und
   > den Diff. Danach mach weiter mit: [dein Ziel]."
3. Sprint-Prompts wie bisher: Ziel, nummerierte Punkte, klare Verbote, am Ende
   „Verifizieren (tsc, Lint, Build, Browser hell/dunkel/390px), dann committen,
   pushen, live". **Push/Merge/Deploy nur auf deine ausdrückliche Ansage.**

## Aktueller Git-Zustand (WICHTIG — erst prüfen)

- **Aktiver Branch: `codex/refine-logo-landing`.** Er ist mit `main` identisch
  (letzter Commit `5cb27c2`). `main` und `origin/main` zeigen ebenfalls auf
  `5cb27c2` und sind **live auf www.gradefruit.de**.
- Deploy-Modell: **Push auf `main` → Vercel deployt automatisch.** Arbeitsweise
  der letzten Sessions: auf einem `feature/…`- bzw. `codex/…`-Branch committen,
  pushen, dann per **Fast-Forward** nach `main` mergen und `main` pushen
  (kein Force-Push, kein Rebase fremder Historie).
- **Für die nächste Produkt-/Website-Aufgabe: neuen Branch von `main` ziehen**
  (`git checkout -b feature/<thema> main`).
- **Nicht committen (bewusst nur lokal, im Arbeitsbaum als „untracked"):**
  `# Gradefruit Logokonzept.zip`, der Ordner `final/`, der Ordner `.claude/`.
  Nie `git add -A` — immer gezielt die geänderten Quelldateien stagen.
- **`feature/control-center-mvp`** enthält ein separates, **nicht deploytes**
  Feature (privater „Gradefruit Workspace" unter `tools/control-center/`,
  ~178 Dateien Unterschied zu `main`). Nicht aus Versehen mitmergen.
- **Stash `stash@{0}` („wip: creative direction validation phase 1")** bleibt
  unangetastet — gehört zum Branch `codex/creative-direction`. Fragil: ein
  versehentliches `git stash drop` löscht ihn unwiederbringlich.

## Was zuletzt gemacht wurde (alles live auf `main`, verifiziert)

Vier Feinschliff-Runden an Landing, Navigation, Lernbereich und Reel-Modus
(Details je Commit in PROJECT_STATUS.md, Sprint-Historie ganz unten):

- **Marke/Farben:** Oberflächen-Akzent auf Logo-Orange `#FF7A00` vereinheitlicht;
  Weiterlernen-Buttons im dunkleren Logo-Orange (`--brand-rind-deep`); Eyebrow-
  Satz + Landing-Icons + Hero-Punkte in derselben Farbe.
- **Landing:** Headline „Deine gesamte Mathe-Abiturvorbereitung an einem Ort.";
  großes Hero-Logo entfernt (nur Text; kleine Marken bleiben); schwebender
  Menü-Knopf oben links beim Scrollen; **Social-Links (Instagram, TikTok,
  Facebook)** nach dem „Fang an."-Abschnitt; FAQ nicht mehr sticky; mobiles
  Menü (angemeldet) zeigt nur „Abmelden" rechtsbündig; Hero-Stichpunkte mobil
  einzeilig.
- **Lernbereich:** Sidebar im **hellen Modus dunkel-orange** (`--side: #4E2708`)
  mit heller Schrift; Themen per Klick ein-/ausklappbar, Hover öffnet erst nach
  160 ms; Brotkrumen vollständig klickbar; aktiver Sidebar-/Tab-Zustand markiert;
  Coach zeigt Aufgaben-Kontext vollständig (nicht mehr auf 120 Zeichen gekürzt).
- **Dashboard:** „Guten Tag, {Name}." ohne Zusatzsatz; Countdown klein;
  Fortschritt+Lernstand als eine klickbare Einheit (→ Wiederholen-Seite);
  offizielles Prüfungsdatum **05.05.2027** aus `src/lib/exam.ts`
  (`EXAM_DATE_IS_PRELIMINARY = false`, Quelle: HKM Landesabitur 2027).
- **Reel-Modus = echtes TikTok-Verhalten** (`SceneModal.tsx`, Variante `reel`,
  + `src/app/feed/`): kein Play-Button (nur Indikator bei Pause), keine
  Untertitel, Videotitel unten wie ein Creator-Name; Gesten: **Tippen =
  Play/Pause, Doppeltippen links/rechts = Segment zurück/vor, Gedrückthalten =
  schnelles Spulen**, vertikales Wischen bleibt fürs Reel-Wechseln.
  Video-Geschwindigkeit (1×–2×) gibt es im normalen Player (Modal), nicht im Reel.

## 🔴 Nächster großer Block: Verkaufsstart (Leon + Claude gemeinsam)

**Stripe läuft noch im TESTMODUS — niemand kann echt bezahlen.** Reihenfolge:

1. **Rechtstext-Platzhalter füllen** (Claude trägt ein, sobald Leon die Daten
   nennt): Impressum, `/agb`, `/widerruf` enthalten rote Felder — Name,
   Anschrift, E-Mail, USt-Status, Zugangs-Enddatum, AGB-Stand-Datum.
   **Offene Frage: Kleinunternehmer nach § 19 UStG?** Falls ja, „inkl. MwSt."
   überall gegen den § 19-Hinweis tauschen (CheckoutModal.tsx, Landing
   Kurse-Sektion, AGB § 5).
2. **Juristische Prüfung** der drei Rechtstexte (Entwürfe, keine Rechtsberatung).
3. **Stripe TEST → LIVE** (Leon im Stripe-Dashboard): Live-Modus,
   Live-Produkte/Preise (GK 49 € einmalig, LK 69 € einmalig → 2 `price_…`),
   Live-Webhook auf `https://www.gradefruit.de/api/stripe/webhook` mit
   `checkout.session.completed` und `charge.refunded` → `whsec_…`; in Vercel
   die Env-Variablen auf Live umstellen (`STRIPE_SECRET_KEY` sk_live,
   `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ONE_TIME` und
   `STRIPE_PRICE_LK_ONE_TIME`) →
   Redeploy → echter Testkauf → Freischaltung prüfen → erstatten → Entzug prüfen.
   **Env-Werte trägt Leon im Vercel-Dashboard ein, nicht in Code/Chat.**

## Offene Punkte / Backlog (Details in PROJECT_STATUS.md)

- ✅ Fortschritts-Zähler verwenden inzwischen den nach Kursstufe getrennten
  `contentIndex`; der frühere falsche Nenner aus allen DB-Lektionen ist behoben.
- 🟠 ElevenLabs-Kontingent war zuletzt fast leer (Szene `l1` läuft ggf. stumm);
  bei Bedarf `scripts/generate-audio.mjs` nach Aufstockung laufen lassen.
- Nicht freigegeben: **Creative-Direction-Board** unter
  `docs/creative-direction/` (index.html + README, nur lokal/Board, kein
  Produktcode). Enthält den vollständigen Richtungs-Entwurf. **Erst nach Leons
  ausdrücklicher Freigabe** dürfen Regeln daraus in DESIGN.md/PRODUCT.md/Code
  übernommen werden (steht auch in AGENTS.md).
- Sprint-Kandidaten: echtes Spaced-Repetition-Scheduling, LK-Inhalte im Reel,
  eigenständigere Body-Schrift (Inter ersetzen), mehr Aufgaben/Videos.

## Operative Stolpersteine (aus dieser Session gelernt — spart Zeit)

- **Produktion per `curl` gibt manchmal `403` mit `x-vercel-mitigated: challenge`.**
  Das ist **kein kaputtes Deployment**, sondern Vercels Bot-Challenge (wird durch
  viele schnelle Requests ausgelöst). Echte Browser kommen durch → Produktion
  **im echten Browser** verifizieren (Preview-Pane auf `https://www.gradefruit.de`
  navigieren), nicht nur mit curl.
- **Der Preview-Browser hängt gelegentlich im Auth-Ladezustand** („Einen
  Moment …", Supabase `getSession()` blockiert). **Fix: Dev-Server stoppen und
  neu starten** (`preview_stop` → `preview_start name:"dev"`), dann lädt es
  wieder. Danach klappt auch der Login.
- **Screenshot-Blank nach programmatischem Scrollen:** bekanntes Tool-Verhalten
  (fixes `body::before` + backdrop-filter). Workaround: hoher Viewport + frisch
  navigieren, oder gezielt DOM prüfen (`javascript_tool`) statt Screenshot.
- **Impeccable-Design-Hook** meldet nach jeder UI-Änderung „Verstöße". Echte
  Probleme fixen, bewusste Ausnahmen (z. B. neue Marken-Orange-Töne, Board-Datei)
  kurz begründen — nicht blind alles „nachbessern".

## Bewährte Arbeitsweise (Kurzfassung)

- Vor Änderungen: die vier Doku-Dateien frisch lesen (Codex ändert zwischendurch
  Dateien) + Branch/`git status`/Diff prüfen. Vorhandene Änderungen nicht
  überschreiben, bevor Herkunft klar ist.
- Pflicht vor Commit: `./node_modules/.bin/tsc --noEmit`, `./node_modules/.bin/eslint src`,
  Build (`unset ANTHROPIC_API_KEY && npm run build`), Browser (hell/dunkel,
  Desktop + 390 px). UI-Tests mit Login über `scripts/create-test-user.mjs
  <zweck>` / `delete-test-user.mjs <zweck>` (Testkonto danach löschen).
- Farben nur über CSS-Variablen (globals.css, hell + `body.dark`); keine Emojis
  im UI; nur transform/opacity/Farben animieren; Fortschritt nur als
  GrapefruitProgress. Ehrlichkeit ist Produktprinzip: keine erfundenen Zahlen,
  Bewertungen, Termine; „bald" klar kennzeichnen; Aufgaben „prüfungsnah",
  nie „echte Abituraufgaben".
- Push/Merge/Deploy **nur auf ausdrückliche Ansage**. Danach PROJECT_STATUS.md
  aktualisieren.
