# Gradefruit — Projekt-Status

> Gemeinsame Wissensbasis für **Claude Code** (Umsetzung) & **ChatGPT** (Beratung).
> **Nach jeder größeren Änderung aktualisieren.** Stand: 2026-07-10 (Sprint 10: Premium-Design, Wiederholungssystem, Reel-Modus)

## Was ist Gradefruit?
Lernplattform fürs schriftliche Mathe-Abitur Hessen 2027. Nutzer kaufen Zugang zu
**Grundkurs (GK)** oder **Leistungskurs (LK)** — getrennt kaufbar — und lernen mit
Aufgaben, Schritt-für-Schritt-Lösungen, KI-Hilfe („Gradefruit-Coach") und Erklärvideos.
- **Live:** www.gradefruit.de (Vercel, Auto-Deploy bei jedem Push auf `main`)
- **Repo:** github.com/lkinkel01/gradefruit (Branch `main`)

## Tech Stack
- **Next.js 16.2.9** (App Router, Turbopack) + **TypeScript**
- **CSS Modules** (KEIN Tailwind)
- **Supabase**: Auth (E-Mail+Passwort, Google-OAuth aktiv) + Postgres mit **RLS**
- **Stripe** — aktuell **TEST/Sandbox-Modus** (Checkout, Webhook, Kundenportal)
- **ElevenLabs** (TTS für Videos), **Anthropic API** (KI-Coach)
- Secrets nur serverseitig (`.env.local` / Vercel Env), nie im Browser.

## Architektur — wichtige Entscheidungen
- **Inhalte liegen client-seitig** in `src/lib/*Tasks.ts` (6 Dateien: analysis/linalg/
  stochastik × GK/LK). Werden an den Browser ausgeliefert → Bezahlschranke ist ein
  **UX-Gate, keine harte Grenze** (server-seitiges Laden = offener Härtungspunkt).
- **Alle Aufgaben sind ORIGINAL** (selbst formuliert im Abi-Stil, NICHT aus echten
  Klausuren) → urheberrechtssicher & skalierbar. Werbetexte müssen ehrlich
  „prüfungsnahe Übungsaufgaben" sagen, NICHT „echte Abituraufgaben".
- **Nur `analysis` ist gratis**, Rest ist paid. Zugang wird **ausschließlich** vom
  signatur-geprüften, idempotenten **Stripe-Webhook** freigeschaltet
  (`upsert on user_id,course_id`), nie clientseitig.
- **KI-Coach** serverseitig (`/api/ask`), Key server-only, mit Tages-/Rate-Limit.
- **Kurse:** `mathe-gk` (79 € / 14,90 €/Mon), `mathe-lk` (99 € / 17,90 €/Mon).

## Implementierte Features
- ✅ Auth (E-Mail+Passwort + Google-Login)
- ✅ GK & LK, je 3 Themen, je ~22 Original-Aufgaben (Schritt-Lösungen, typische
  Fehler, Video-Verknüpfung)
- ✅ Lernbereich (Sprint 04, 07/2026): Kursstufe wird aus dem Kauf abgeleitet
  (kein GK/LK-Umschalter mehr in den Themen; Gäste wählen einmalig auf der
  Übersicht, localStorage `gf-level`), Themen-Seiten mit Tabs **Zusammenfassung
  (Formelsammlung, `src/lib/summaries.ts`) | Übungen**, Übungen als einklappbare
  **Lernkarten** pro Unterthema (Lösung, Video, KI, „Eigene Lösung prüfen" via
  KI-Drawer-Upload, Tutor-bald-Platzhalter, Verstanden/Später wiederholen),
  6 Erklärvideos an passende GK-Aufgaben verknüpft (`videoId`)
- ✅ KI-Coach (Fragen zu Aufgabe/Schritt), rate-limitiert. Seit Sprint 05 tief in
  die Inhalte integriert: **Formeln (Zusammenfassung) und Lösungsschritte sind
  klickbar** und öffnen den Coach mit passendem Kontext; Drawer als
  „Gradefruit-Coach" mit Begrüßung, prominenter **Upload-Zone „Eigene Lösung
  prüfen lassen"** (Foto/PDF, bestehende Funktion) und **Mikrofon-Platzhalter**
  für kommende Spracheingabe (bewusst deaktiviert, ehrlich beschriftet)
- ✅ Erklärvideos (ElevenLabs-Stimme + animierte Szenen)
- ✅ Checkout-Flow (GK+LK, einmalig+Abo), Webhook (inkl. Rückerstattung →
  Zugang entziehen), Stripe-Kundenportal
- ✅ Konto-Seite
- ✅ **Wiederholungssystem (Sprint 10, 07/2026):** statt „Verstanden/Gespeichert"
  gibt es drei Lernstufen — **Verstanden / Wiederholen / Noch unklar** — als
  Segment-Buttons unter jeder Aufgabe. Gespeichert wird OHNE DB-Änderung auf den
  zwei bestehenden Bool-Spalten (`understood`,`saved`) kodiert: verstanden=(1,0),
  wiederholen=(0,1), unklar=(1,1), keine=(0,0) → Logik in `ProgressContext.tsx`
  (`statusOf`/`setStatus`). Neue **Wiederholen-Seite** (`ReviewView.tsx`, ersetzt
  „Gespeichert"): Filter nach Lernstufe × Themen (mehrfach), sortiert
  Unklares zuerst; Klick öffnet die Aufgabe direkt (Deep-Link `gf-open-task`).
  Dashboard-Kacheln (Verstanden/Wiederholen/Noch unklar) sind klickbar und
  springen mit vorgewähltem Filter dorthin (`gf-review-status`). Vorbereitet
  für Active Recall/Spaced Repetition (Stufen = spätere Wiederhol-Intervalle).
  Grenze: Lernstufen gibt es bisher nur für Aufgaben (DB-Tabelle `lessons`);
  Zusammenfassungen/Formeln einzeln einordnen bräuchte neue DB-Spalten → Backlog.
- ✅ **Grapefruit als Fortschrittssprache (Sprint 10):** `GrapefruitProgress`
  in `Logo.tsx` (Frucht füllt sich exakt proportional, Kreissektor ab 12 Uhr,
  Segmentlinien darüber). Eingesetzt: Dashboard-Gesamtfortschritt (ersetzt den
  Ring), Themen-Liste, Sidebar-Kurskarte, Themenseiten-Fortschritt, Leerzustand
  der Wiederholen-Seite.
- ✅ Landing-Page (Sprint 02+03, 07/2026): Grapefruit-Logo (Querschnitt mit
  herausgezogenem Segment, SVG), Sticky-Nav mit Milchglas, Hero für GK+LK,
  USP-Leiste, **interaktive Produkt-Demo mit GK/LK-Umschalter** (echte
  Gratis-Aufgaben beider Stufen + Lösung + Video-Player; KI als markierte
  Beispiel-Antworten; Speichern/Tutor mit ehrlichen Hinweisen), Preisbereich mit
  GK- und LK-Karte (je Einmalzahlung + Abo, nur UI), global aufgewertete Buttons
- ✅ Impressum, Datenschutz, **AGB (`/agb`) + Widerrufsbelehrung (`/widerruf`)**
  (Sprint 09; Entwürfe mit Platzhaltern, juristisch prüfen lassen!) und
  **rechtssicherer Checkout**: „inkl. MwSt."-Ausweis + Pflicht-Checkbox
  (Widerrufsverzicht § 356 Abs. 5 BGB, Kauf-Button erst nach Zustimmung)
- ✅ Dark Mode (persistiert, kein Aufblitzen beim Laden)
- ✅ Design-Reife (Sprint 07, 07/2026): neues **Grapefruit-Logo**
  (`src/components/Logo.tsx`, flache Scheibe mit Segmentlinien + gefülltem
  Lern-Keil; `filled`-Prop 0–6 vorbereitet für Fortschritt/Level), **warme
  Farbwelt** (Papier-Beige statt kühlem Grau, hell + dunkel + Feed),
  zentrierter Hero („Die eine Plattform für dein Mathe-Abi"), Demo entfernt →
  Funktions-Übersicht, „Preise"→„Kurse", Dashboard mit Namens-Begrüßung,
  wechselnder Motivation und **Prüfungs-Countdown** (Platzhalter-Termin
  03.05.2027 „voraussichtlich" – offiziellen Termin in `Dashboard.tsx`
  eintragen!), Themenansicht ohne Badges/Einleitung, Zusammenfassung als
  Karten-Raster, Sidebar-Hover-Untermenü (Zusammenfassung/Übungen), Coach
  verschlankt (Beispielfragen hinter Klick) mit **funktionierender
  Spracheingabe** (Web Speech API, browserseitig), „Erklärvideos" aus der
  Navigation entfernt (Videos leben in Übungen + Swipe-Ansicht)
- ✅ **Reel-Modus** (`/feed`; hieß bis Sprint 09 „Swipe-Ansicht", **kein eigener
  Sidebar-Eintrag mehr**): erreichbar über den „Reel-Modus"-Button auf jeder
  Themenseite (öffnet einen dynamisch gebauten Feed NUR dieses Themas —
  `buildTopicFeed()` aus Videos, Formeln, Fehlern, Aufgaben, Zusammenfassungen;
  Übergabe via `localStorage gf-feed-topic`) und über den „Reel-Modus"-Button
  auf der Übersicht (gemischter Feed über alle Themen). „Merken" im Feed setzt
  die Lernstufe „Wiederholen". Ursprüngliche Beschreibung: volle dunkle Video-Bühne mit
  echtem Funktionsgraphen der Szene, Overlays im Reels-Stil (Thema, Titel,
  Beschreibung, Lernziel, geschätzte Dauer), Aktions-Leiste rechts (Üben +
  Formeln springen per Deep-Link ins Thema [`gf-open-topic`/`gf-open-tab`],
  KI öffnet den Coach mit Video-Kontext, Merken speichert die verknüpfte
  Aufgabe, Teilen via System-Share/Zwischenablage, Tutor „bald"),
  Story-Fortschritt oben („Video x von y"), „Nächstes Thema"-Hinweis,
  Desktop als zentrierte Reels-Spalte. Nur für eingeloggte Nutzer.
  **V3 (Sprint 08): gemischte Kartentypen** – 20 Karten aus 7 Typen
  (Erklärvideo, Formel des Tages, Zusammenfassung, Typischer Fehler,
  Beispielaufgabe, Abi-Tipp, Motivation mit Prüfungs-Countdown), alle aus
  echten Plattform-Daten (Aufgaben/Zusammenfassungen; Tipps/Motivation
  kuratiert statisch), je Kartentyp eigene Aktionen in der Leiste
  (Üben/Formeln/Erklären/Lösen/Merken/Teilen via Deep-Links + Coach).
  **Autoplay wie TikTok:** der aktive Video-Slide spielt VON SELBST (kein Klick,
  kein Modal; `ScenePlayer` mit dunkler Token-Palette eingebettet),
  Weiterwischen stoppt das alte und startet das neue Video. Blockiert der
  Browser den Ton, läuft das Video stumm mit Untertiteln und zeigt einen
  „Ton an"-Chip. **Roboterstimme komplett entfernt** (kein
  speechSynthesis-Fallback mehr; ohne mp3 → stumm mit Untertiteln).
- 🟠 **ElevenLabs-Kontingent leer** (95/10.000 Zeichen übrig): Szene `l1`
  („Abstand zweier Punkte") hat nur das Intro als mp3 und läuft bis zur
  Aufstockung stumm. Danach: `node --env-file=.env.local
  scripts/generate-audio.mjs` ausführen und in `scenes.ts` bei `l1`
  `hasAudio: true` setzen.

- ✅ **Premium-Design (Sprint 10):** Primär-Buttons in warmem Tinten-Schwarz
  (im Dark Mode invertiert hell, Apple-artig) statt Orange-Verlauf — Orange
  bleibt Grapefruit/Fortschritt/Akzenten vorbehalten. Gedeckte Themenfarben
  (`#DE5D43`/`#5D6BC9`/`#2F9E68` statt Signaltöne, überall konsistent inkl.
  `scenes.ts`). Neue `--glass`-Variable für Milchglas-Leisten. Einheitliche
  **Aktionsleiste „Video ansehen · KI fragen · Tutor (bald)"** an fester
  Position in Übungen UND Zusammenfassungs-Karten („Video folgt"/„Tutor · bald"
  ehrlich als inaktive Chips); „Lösung Schritt für Schritt" + „Eigene Lösung
  prüfen" als eigener Bereich darüber. Landing: neuer Hero („Die Prüfung kommt.
  Du wirst bereit sein."), neue Sektion **„Mehr als Aufgaben"** (Strategien aus
  Studium/Prüfungserfahrung: Operatoren, Punkte sichern, Wiederholen mit System).
- ✅ **Bugfixes (Sprint 10):** Dark Mode der oberen App-Leiste (der alte
  `body.dark .topbar`-Selektor griff bei CSS-Modulen nie → jetzt `--glass`);
  Video-Modal war erst nach Scrollen sichtbar (Einstiegs-Animation ließ eine
  Identity-Transform auf `.page` zurück → `position:fixed` wurde relativ zur
  Seite; Fix: SceneModal rendert per **React-Portal** an `document.body`);
  Begrüßung nach Uhrzeit korrigiert (bis 12 Uhr „Guten Morgen", bis 18 Uhr
  „Guten Tag"); Themen-Untermenü in der Sidebar bleibt im aktiven Thema
  dauerhaft offen (Klicks wechseln den Tab auch im bereits offenen Thema —
  `navSignal` in page.tsx); „Vollzugang aktiv"-Tag aus der Sidebar entfernt;
  Login/Registrierung ohne Placeholder, mit Fokus-Ring und autoComplete;
  Wiederholen-Seite ist frei zugänglich (nicht hinter der Bezahlschranke).

## Bekannte Probleme / offen
- 🔴 **Verkaufsstart-Blocker (Leon):** Impressum, AGB und Widerruf enthalten
  rote Platzhalter (Name, Adresse, E-Mail, USt-Status §19, Zugangs-Enddatum,
  AGB-Stand) → ausfüllen + juristisch prüfen lassen. Danach Stripe TEST→LIVE
  (Anleitung siehe Chat/unten): Live-Preise, Live-Keys + Live-Webhook-Secret
  in Vercel, Live-Webhook mit checkout.session.completed,
  customer.subscription.*, charge.refunded.
- 🟡 **Fortschritts-Zähler** („x/79 Aufgaben" in Sidebar/Übersicht) zählen die
  DB-Tabelle `lessons` (79 Einträge), nicht die 133 echten Aufgaben aus den
  Task-Dateien. Angleichen = kleine DB-/Kontext-Arbeit (eigener Sprint).
- 🔴 **Stripe im TEST-Modus** — echte Kunden können NICHT zahlen. Umstellung auf
  LIVE (Live-Keys in Vercel + Live-Webhook inkl. `charge.refunded`) = **größter
  Go-Live-Schritt für echten Umsatz.**
- 🟠 **Dark Mode in Safari** — Fix deployed (Elemente werden beim Umschalten neu
  aufgebaut, WebKit-Bug). **Von Leon in Safari zu verifizieren.**
- 🟠 **Inhalte client-seitig** — im Browser einsehbar; server-seitiges Laden würde
  die Bezahlschranke härten.

## Nächste sinnvolle Schritte
1. Safari-Dark-Mode verifizieren (Leon) — Sprint-10-Design zusätzlich prüfen.
2. **Stripe TEST → LIVE** schalten (echter Umsatz), davor AGB/Widerruf/MwSt-Ausweis.
3. Sprint-11-Kandidaten (bewusst aufgehoben): Lernstufen auch für
   Zusammenfassungs-Abschnitte/Formeln (braucht neue DB-Tabelle/Spalten),
   echtes Spaced-Repetition-Scheduling (Fälligkeits-Daten) und Interleaving-
   Mix auf der Wiederholen-Seite, LK-Karten im Reel-Modus (Feed nutzt bisher
   GK-Inhalte), eigenständigere Fließtext-Schrift (Inter ist austauschbar,
   Schibsted Grotesk bleibt Display).
4. Übersichts-Zähler an echte Aufgabenzahlen angleichen (DB `lessons` = 79
   vs. 133 Aufgaben in den Task-Dateien; eigener kleiner DB-Sprint).
5. Mehr Aufgaben / Themen-Tiefe; weitere Erklärvideos produzieren und verknüpfen.
6. (Optional) Inhalte server-seitig laden (Härtung der Bezahlschranke).

## Arbeitsteilung & Regeln
- **Claude Code**: kennt Codebasis, setzt um, committet/pusht **nur auf ausdrückliche
  Ansage** (Push = Live-Deploy auf Vercel).
- **ChatGPT**: Produktentscheidungen, Architektur, Priorisierung, schreibt optimierte
  Prompts für Claude Code auf Basis DIESER Datei.
- **Leon**: bedient Web-Dashboards (Stripe, Supabase, Vercel, Google Cloud, GitHub,
  Hostinger); editiert keine Dateien selbst.
