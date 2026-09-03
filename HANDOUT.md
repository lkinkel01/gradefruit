# HANDOUT — Übergabe für die nächste Session

## Aktuelle operative Übergabe — 2026-09-03 (Claude Code, nach Codex)

- **Stand:** `codex/launch-readiness` ist per Fast-Forward nach `main` gemerged
  und gepusht. `main` = `origin/main` = `9dc3171`, **live auf
  www.gradefruit.de**. Der Branch bleibt als Historie stehen.
- **Von Codex übernommen und selbst nachgeprüft:** Server-Grenzen gehärtet,
  React-Lint-Fehler beseitigt, Launch-Env-Gate (`npm run check:launch-env`),
  sechs LK-Erklärvideos angelegt und mit LK-Aufgaben verknüpft. Eigene
  Prüfung: tsc, ESLint (0 Fehler, 16 Altwarnungen), Produktions-Build,
  `check-content` (PASS), `check-launch-env.test.mjs`, dazu ein Rundum-Check
  der geänderten API-Grenzen (freie Analysis 200; bezahltes Thema, Checkout,
  Portal, Kontolöschung und KI ohne Sitzung 401; Webhook ohne Signatur 400).
- **Danach ergänzt:**
  - `fix(videos)`: Dasselbe LK-Video war in der Liste „kommt bald" und
    gesperrt, lief im Reel-Modus aber längst. Jetzt überall spielbar und
    überall gleich beschriftet: **„noch ohne Ton"**. Der Inhalt ist
    vollständig (Schritte, Formeln, Sprechtext als Untertitel) — es fehlt nur
    die Stimme.
  - `fix(wachhalten)`: Fehlte `CRON_SECRET`, wies die Route **jeden** Aufruf
    ab, auch Vercels Cron. Der Weckruf wäre still ausgefallen und Supabase
    hätte pausiert — die Seite wäre tot gewesen. Jetzt: Geheimnis gesetzt →
    wird verlangt (401/401/200 geprüft); Geheimnis fehlt → Weckruf läuft und
    meldet `ungeschuetzt: true`. `check:launch-env` verlangt es weiterhin.
- **Offen, nur Leon:** Gewerbe/ELSTER/Steuernummer, juristische Freigabe der
  Rechtstexte, Stripe TEST → LIVE samt Live-Preisen (GK 49 €, LK 69 €,
  Einmalkauf), `CRON_SECRET` und `STRIPE_PRICE_LK_ONE_TIME` in Vercel,
  Supabase auf einen bezahlten Tarif. Werte nur im Vercel-Dashboard, nie in
  Chat oder Git.
- **Bewusst vertagt (kostet Geld, braucht Leons Freigabe):** 42 fehlende
  mp3-Dateien für die sechs LK-Szenen. Bis dahin laufen die Videos stumm mit
  Untertiteln und sind als „noch ohne Ton" gekennzeichnet.
- **Nicht anfassen oder stagen:** `# Gradefruit Logokonzept.zip`, `final/`,
  `stash@{0}` (Creative Direction).
- **Nächster Schritt:** Durchgang durch die verbliebenen Wege fortsetzen —
  Wiederholen-Seite, Anmelde- und Kaufweg —, jeweils in Webseite **und** App,
  hell und dunkel.

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
