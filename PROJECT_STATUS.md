# Gradefruit — Projekt-Status

> Gemeinsame Wissensbasis für **Claude Code** (Umsetzung) & **ChatGPT** (Beratung).
> **Nach jeder größeren Änderung aktualisieren.** Stand: 2026-07-20 (Feinschliff-Runde 6: Lernbereich neu strukturiert — Kästen, Ampel-Status, Sidebar-Dashboard)
>
> Aufbau: erst der **kompakte Ist-Zustand**, darunter die **vollständige
> Sprint-Historie** (chronologisch; ältere Einträge beschreiben den Stand
> ihrer Zeit — was später ersetzt wurde, ist markiert).
> Produktvision & Prinzipien: [PRODUCT.md](PRODUCT.md) · Designsystem:
> [DESIGN.md](DESIGN.md) · Entwicklungsregeln: [CLAUDE.md](CLAUDE.md).

## Was ist Gradefruit?
Lernplattform fürs schriftliche Mathe-Abitur Hessen 2027. Nutzer kaufen Zugang zu
**Grundkurs (GK)** oder **Leistungskurs (LK)** — getrennt kaufbar — und lernen mit
Aufgaben, Schritt-für-Schritt-Lösungen, KI-Hilfe („Gradefruit-Coach") und Erklärvideos.
- **Live:** www.gradefruit.de (Vercel, Auto-Deploy bei jedem Push auf `main`)
- **Repo:** github.com/lkinkel01/gradefruit (Branch `main`)

## Aktueller Stand (Kurzfassung, Stand Sprint 10)

**Das Produkt ist funktional komplett für den Verkaufsstart** — es fehlt nur
der Live-Gang (Rechtstexte-Platzhalter + Stripe TEST→LIVE, siehe „Bekannte
Probleme").

- **Landing** (`/`): Premium-Einstieg „Alles für dein Mathe-Abitur. Ein
  System.", geführter Lernweg, kontextueller Coach, Lernmethoden mit klarer
  Trennung zwischen vorhanden und geplant, visuelles Lernen, Hessen-/GK-/LK-
  Fokus, Kurse (GK 79 €/14,90 · LK 99 €/17,90), FAQ und Closing.
- **Lernbereich:** 3 Themen × Zusammenfassung | Übungen in einer gemeinsamen
  einspaltigen Akkordeon-Logik. Zusammenfassungsabschnitte sind direkt über
  Sidebar und Breadcrumb erreichbar. Lernhilfen und Status erscheinen erst
  nach dem bewussten Öffnen des Inhalts; klickbare Formeln/Schritte öffnen den
  Coach, „Eigene Lösung prüfen" nutzt den vorhandenen Foto/PDF-Upload.
- **Wiederholungssystem:** drei Lernstufen (Verstanden / Wiederholen / Nicht
  verstanden) pro Aufgabe; Wiederholen-Seite mit Filtern Stufe × Themen;
  Dashboard-Kacheln springen mit Vorauswahl dorthin.
- **Reel-Modus** (`/feed`, nur eingeloggt): vertikaler Video-Feed mit
  Autoplay und direkter Lernstatus-Auswahl. Die Lernbühne nutzt die verfügbare
  Breite ohne seitliche Aktionsleiste; unten bleiben nur Zurück und Übersicht.
- **Fortschritt** überall als sich füllende **Grapefruit**
  (`GrapefruitProgress`).
- **Konto & Kauf:** Auth (E-Mail + Google), Checkout mit Pflicht-Checkbox
  (§ 356 BGB) + MwSt.-Ausweis, Webhook schaltet frei (inkl. Refund-Entzug),
  Kundenportal, Konto-Seite.
- **Design:** modernes Weiß, tiefes Schwarz und eine Grapefruit-Akzentfarbe,
  Dark Mode, mobil optimiert — eigenständiges Grapefruit-Zeichen, schwebende
  Glas-Navigation mit richtungsabhängigem Ein-/Ausblenden und ein
  durchgängiges editoriales Flächen-, Icon- und Interaktionssystem.

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

## Sprint-Historie (chronologisch, vollständig)

> Jeder Eintrag beschreibt den Stand seines Sprints. Wo etwas später ersetzt
> wurde, steht eine *(→ später …)*-Anmerkung — so bleibt die Entwicklung
> nachvollziehbar, ohne dass die Liste dem Ist-Zustand widerspricht.

- ✅ **Mobile Landing und fokussierter Reel-Modus (18.07.2026):** Der mobile
  Hero besitzt größere Abstände, bricht Headline und Vorteile ohne Überlauf um
  und zeigt das vollständige Grapefruit-Visual. Der Reel-Modus nutzt die
  Bildschirmbreite für den Lerninhalt; Gefällt-mir-, Teilen- und
  Weiterlernen-Overlays wurden entfernt. Unten bleiben ein Zurück- und ein
  Übersicht-Button. Alle 47 Audiodateien der sechs Reel-Szenen sind vorhanden
  und den Szenenschritten vollständig zugeordnet.
- ✅ **Lernnavigation und Inhaltsansichten (18.07.2026):** Landing-Visual
  zentriert; transparente Liquid-Glass-Navigation verschwindet beim
  Herunterscrollen und erscheint nur am Seitenanfang. Produkt-Breadcrumb und
  Sidebar führen „Gradefruit" zur Übersicht. Zusammenfassungen besitzen eine
  dritte, anklickbare Navigationsebene; Übungen und Zusammenfassungen zeigen
  Aufgabe beziehungsweise Einleitung zuerst und blenden Lösung, Lernhilfen
  sowie Lernstatus erst auf Wunsch ein. Dashboard-Countdown mit Kalender-Icon,
  kompaktere Fortschrittszahl. Desktop, 390 px, Light und Dark geprüft.
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
  gibt es drei Lernstufen — **Verstanden / Wiederholen / Nicht verstanden**
  (ursprünglich „Noch unklar") — als
  Segment-Buttons unter jeder Aufgabe. Gespeichert wird OHNE DB-Änderung auf den
  zwei bestehenden Bool-Spalten (`understood`,`saved`) kodiert: verstanden=(1,0),
  wiederholen=(0,1), unklar=(1,1), keine=(0,0) → Logik in `ProgressContext.tsx`
  (`statusOf`/`setStatus`). Neue **Wiederholen-Seite** (`ReviewView.tsx`, ersetzt
  „Gespeichert"): Filter nach Lernstufe × Themen (mehrfach), sortiert
  Unklares zuerst; Klick öffnet die Aufgabe direkt (Deep-Link `gf-open-task`).
  Dashboard-Kacheln (Verstanden/Wiederholen/Nicht verstanden) sind klickbar und
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
  USP-Leiste, **interaktive Produkt-Demo mit GK/LK-Umschalter** *(→ Demo in
  Sprint 07 durch die Funktions-Übersicht ersetzt)*, Preisbereich mit
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
  zentrierter Hero („Die eine Plattform für dein Mathe-Abi") *(→ Hero-Text in
  Sprint 10 erneuert)*, Demo entfernt →
  Funktions-Übersicht, „Preise"→„Kurse", Dashboard mit Namens-Begrüßung,
  wechselnder Motivation und **Prüfungs-Countdown** (Platzhalter-Termin
  03.05.2027 „voraussichtlich" — offiziellen Termin in `src/lib/exam.ts`
  eintragen, seit dem Fundament-Sprint die einzige Quelle),
  Themenansicht ohne Badges/Einleitung, Zusammenfassung als
  Karten-Raster, Sidebar-Hover-Untermenü *(→ seit Sprint 10 im aktiven Thema
  dauerhaft offen)*, Coach
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
- ✅ **Fundament-Sprint (11.07.2026, nichts Sichtbares):** Projekt auf
  Produktionsniveau konsolidiert. Neu: **PRODUCT.md** (Vision, Zielgruppe,
  Marke, Prinzipien, Strategie, Content-Pipeline) und **DESIGN.md**
  (vollständiges Designsystem im Impeccable-/design.md-Format, inkl.
  `.impeccable/design.json`-Sidecar) — beide werden vom Impeccable-Skill
  automatisch geladen. CLAUDE.md komplett überarbeitet (Dokumenten-Landkarte,
  Skills & Hooks, localStorage-Register, Verifikations-Checkliste),
  README.md ersetzt (war noch das create-next-app-Template),
  PROJECT_STATUS/HANDOUT entdoppelt. Code-Basis: `src/lib/exam.ts` als
  einzige Quelle des Prüfungstermins (vorher doppelt in Dashboard + Feed);
  dauerhafte Testkonto-Skripte `scripts/create-test-user.mjs` /
  `delete-test-user.mjs`; TasteSkill über `.claude/skills/taste/` an die
  Skill-Erkennung angebunden; `.gitignore` um Impeccable-Cache ergänzt.
  Aufgeräumt: Ur-Prototyp nach `docs/archive/` verschoben, tote
  create-next-app-SVGs entfernt.
- ✅ **Premium-Sprint (12.07.2026, sichtbarer Qualitätssprung):** Motion- und
  Design-Fundament in `globals.css` — Haus-Easing-Tokens (`--ease-out`
  /`-in-out`/`-drawer`/`-press`, Emil: kein `ease-in`), Dauer-Tokens,
  wiederverwendbare Entrance-Choreografie (`gf-rise`/`gf-pop`/`gf-stagger`)
  und Scroll-Reveal (`useReveal`, reduced-motion-sicher, `--shadow-lift`).
  **Grapefruit** füllt sich beim Erscheinen animiert bis zum Zielwert
  (`GrapefruitProgress`, rAF ease-out, reduced-motion → sofort am Ziel) und
  trägt jetzt als kleiner Akzentbalken den aktiven Sidebar-Eintrag; großes,
  ruhiges Grapefruit-Motiv mit leichter Parallax hinter dem Landing-Hero.
  Landing: Eyebrow-Pill + Section-Eyebrows, Scroll-Reveals pro Sektion,
  Premium-Karten-Hover (Lift + weicher Schatten). Dashboard: gestaffelte
  Entrance, prominenter Countdown, größerer Fortschritts-Ring, Press-Feedback
  auf Kacheln/Zeilen. Topbar scroll-aware (Trennung erscheint erst beim
  Scrollen, Apple scroll-edge). Lernbereich: Karten-Lift, animierte Tabs,
  Press-Feedback auf Chips/Formeln/Status-Segment, warme statt kühle Schatten.
  Buttons projektweit mit stärkerem ease-out + Active-Press. Verifiziert in
  hell/dunkel, Desktop/mobil; Video-Modal öffnet weiterhin sofort sichtbar.
  Bewusst für später: Body-Font Inter durch eine eigenständigere Textschrift
  ersetzen (Impeccable-Hinweis; braucht Mathe-Lesbarkeits-Tests), Marketing-
  Type-Scale in DESIGN.md ergänzen, echte Gesten-Physik (Federn) im Reel-Modus.
- ✅ **Marken-Sprint (12.07.2026, eigene Designsprache):** Gradefruit soll
  ohne Logo erkennbar sein. **Display-Schrift Schibsted Grotesk → Bricolage
  Grotesque** (editoriale Grotesk mit Charakter, `font-optical-sizing: auto`;
  Inter bleibt Body, JetBrains Mono bleibt Mathe) — trägt jetzt alle
  Überschriften und großen Zahlen; DESIGN.md/Sidecar nachgezogen
  („Drei-Schriften-Regel"). **Grapefruit-Substrat**: aus der Querschnitt-
  Geometrie abgeleitete radiale Segmentlinien als extrem subtiler, fixer
  Hintergrund über der ganzen App (`body::before`, theme-fest) — das
  wiederkehrende Markenelement. **GrapefruitSpinner** (`Logo.tsx`): die sechs
  Segmente leuchten reihum auf, ersetzt das generische „Laden …" in App- und
  Reel-Gate (reduced-motion → ruhige volle Frucht). Hero editorialer
  (größere, engere Bricolage-Headline), Grapefruit-Motiv als balancierter
  Eck-Akzent (mobil dezenter). Verifiziert in hell/dunkel + Desktop/mobil,
  keine Konsolenfehler. Bewusst für später: Empty/Loading-States der
  KI-Drawer, Icon-Sprache vereinheitlichen, Karten-Signaturdetail
  (Grapefruit-Segment-Akzent), eigenständigere Body-Schrift.
- ✅ **Editorial-Sprint (12.07.2026, eigene Designsprache):** Landing und
  Dashboard **komplett neu** komponiert, weg vom SaaS-/KI-Template. Neue
  „Editorial-Regel" in DESIGN.md: Inhalt lebt auf dem Papier, geordnet durch
  Haarlinien (`.gf-rule`) und Weißraum statt weißer Karten-Boxen; verboten sind
  zentrierte Symmetrie, farbige Headline-Wörter, Pillen-Buttons und das
  Icon-Karten-Raster. Neue globale Primitive: kantige Buttons (7px statt Pille,
  Light-Button kehrt beim Hover um), `.gf-meta` (gesperrte Versal-Labels),
  `.gf-rule`, `.gf-index` (übergroße Bricolage-Zahlen), `.gf-arrow` (Text-Link
  mit wanderndem Pfeil). **Landing:** asymmetrischer Hero (linksbündige
  Riesen-Headline + Grapefruit als angeschnittenes Grafikelement), Zahlen-Reihe
  mit Countdown, nummerierte Feature-/Themen-Listen, 3-Spalten-Strategien,
  Kurs-Panels, Riesen-Closing. **Dashboard:** editoriales Cockpit — Countdown
  als Anker, Fortschritt präsent, Lernstand als klickbare Zahlen-Reihe, Themen
  als Liste. Verifiziert hell/dunkel + Desktop/mobil, tsc + Build sauber.
  Bewusst offen: Lernbereich (TopicView) und Sidebar erben Buttons/Typo, sind
  aber noch nicht voll editorial umgebaut (nächster Schritt); Reel-Modus,
  Wiederholen-Seite und Konto ebenso.
- ✅ **Premium-Landing (17.07.2026):** Die öffentliche Startseite wurde als
  zusammenhängende Produktgeschichte neu aufgebaut: klarer System-Hero,
  persönlicher Lernstand und Wiederholung, Gradefruit-Coach, Lernmethoden,
  audiovisuelle Erklärungen, Hessen-/GK-/LK-Fokus, Vertrauensbereich, Preise,
  FAQ und Abschluss-CTA. Reale Produktfunktionen sind von geplanten Methoden
  sichtbar getrennt; Spaced Repetition, adaptive Aufgaben und Interleaving
  heißen ausdrücklich „In Vorbereitung". Eine Community oder allgemeine
  Materialbibliothek wird nicht behauptet. Motion ist gezielt, reduziert und
  `prefers-reduced-motion`-sicher. Verifiziert in Hell/Dunkel, Desktop/375 px,
  inklusive Login, Registrierung, Kurs-Einstieg, Theme-Wechsel und Ankern.
- ✅ **Premium-Designsystem in der gesamten Website (17.07.2026):** Neues
  eigenständiges, monochromes Grapefruit-Zeichen für Navigation, Favicon,
  App-Icon und Rechtstexte. Die Landing-Navigation ist als dezente, funktionale
  Liquid-Glass-Leiste umgesetzt; Desktop und Mobile besitzen dieselbe klare
  Hierarchie und sichtbare Fokus-/Aktivzustände. Produktnavigation,
  Themenseiten, Wiederholen, Konto, Erklärvideos, Nachhilfe-Platzhalter,
  Coach-Drawer, Auth, Checkout und Video-Modal wurden auf eine gemeinsame
  Sprache aus Papierflächen, Haarlinien, wenigen Radien und zurückhaltender
  Tiefe gebracht. Das Dashboard behält seine bereits passende editoriale
  Komposition, der Reel-Modus seine bewusst eigenständige dunkle Bühne.
  Die Landing zeigt die geplante persönliche Lernbibliothek und Community
  ausdrücklich als Ausblick, klar getrennt von heute verfügbaren Funktionen.
- ✅ **Plattformweiter Design-Finish (18.07.2026):** Landing und Lernprodukt
  nutzen jetzt konsequent modernes Weiß, tiefes Schwarz und genau eine
  Grapefruit-Akzentfarbe; zusätzliche Markenfarben wurden entfernt.
  Wiederverwendbare System-Icons ersetzen gemischte Symbolstile. Dashboard,
  Themen, Wiederholen, Coach, Videos, Nachhilfe, Konto, Feed, Auth, Checkout,
  Modals und Rechtstexte teilen dieselben Radien, Linien, Fokuszustände,
  Schatten und reduzierten Bewegungsmuster. Das Grapefruit-Zeichen ist in
  Navigation, Fortschritt, Favicon und App-Icon geometrisch konsistent.
  TypeScript, ESLint und Produktions-Build sind sauber; visuell geprüft in
  Hell/Dunkel sowie Desktop und 390-Pixel-Ansicht.
- ✅ **Personalisierte Startseite und Lernnavigation (18.07.2026):**
  Angemeldete Nutzer bleiben auf der öffentlichen, personalisierten Startseite
  und wechseln erst über „Weiterlernen" ins Dashboard; explizite Deep Links
  bleiben erhalten. Dashboard-Begrüßung, Prüfungsdatum, Countdown sowie
  Fortschritt und Lernstand sind kompakter. Dreistufige Breadcrumbs,
  aktive Sidebar-Unterpunkte und vorausgewählte Lernstatus-Filter geben im
  Lernbereich klare Orientierung. Das reduzierte Grapefruit-Markenvisual ist
  für Gast-, Konto- und Mobilansicht abgestimmt. TypeScript, gezielter ESLint
  und Produktions-Build sind sauber; Chromium wurde in Hell/Dunkel sowie
  Desktop und 390-Pixel-Ansicht geprüft.
- ✅ **Mobile und Reel-Modus (18.07.2026):** Der Reel-Modus zeigt nur noch
  verknüpfte Erklärvideos als vertikalen, automatisch startenden Feed.
  Lernstatus stehen oben als „Verstanden", „Wiederholen" und „Nicht
  verstanden"; rechts bleiben Gefällt mir und Teilen, unten nur Übersicht und
  Weiterlernen in einer kompakten Glasleiste. Die neue Bezeichnung gilt auch
  in Aufgaben, Zusammenfassungen, Dashboard und Wiederholen. Mobile Hero-Aktion
  und Lernmethoden wurden für 390 px entzerrt und zentriert. TypeScript,
  gezielter ESLint und Produktions-Build sind sauber; die öffentliche Landing
  wurde in Hell/Dunkel auf Desktop und 390 px geprüft.
- ✅ **Marken-Orange vereinheitlicht, Hero beruhigt (19.07.2026, live):**
  Die Akzentfarbe der Oberfläche folgt jetzt in Hell und Dunkel dem
  Logo-Orange `#FF7A00` (inklusive Themen-, Video- und Szenenfarben; die
  funktionalen Fehler-/Erfolgsfarben bleiben eigenständig). Das große
  Hero-Logo steht kleiner und ruhig für sich — der zusätzliche
  Fortschritts-Außenring wurde entfernt (er verdoppelte die offene G-Form),
  der Parallax-Code dazu ebenso; mobil ist das Visual ausgeblendet.
  Angemeldete sehen „Weiterlernen" als orangen CTA in Navigation und Hero,
  der Kostenlos-Hinweis erscheint nur noch für Gäste; nebenbei behoben: das
  mobile Menü zeigte Angemeldeten fälschlich „Kostenlos testen". Verifiziert
  mit tsc, ESLint (src), Produktions-Build sowie im Browser (Gast + Login,
  Hell/Dunkel, Desktop + 390 px); als `f1f1dda` per Fast-Forward auf `main`
  deployt und in Produktion geprüft.
- ✅ **Feinschliff Marke und Navigation (19.07.2026, zweite Runde, live):**
  „Weiterlernen" auf den orangen Buttons trägt jetzt weiße Schrift. Der Hero
  der Startseite besteht auch auf Desktop nur noch aus Text — das große
  Logo ist entfernt, die kleinen Markenzeichen (Navigation, Footer,
  Favicon) bleiben. Die helle Produkt-Sidebar nutzt statt Weiß den zarten
  Orange-Ton des Logo-Hintergrunds (`--side: #FFF4E8`), damit sich Menü und
  Lernfläche abheben. Neu: ein kleiner schwebender Menü-Knopf oben links
  erscheint beim Scrollen der Startseite (Desktop und mobil) und holt die
  Navigation zurück; nach dem Klick bleibt sie stehen, bis wirklich neu
  gescrollt wird. Reel-Modus näher an TikTok: Tippen auf die Videobühne
  pausiert/startet, Pfeiltasten wechseln am Desktop das Video
  (reduced-motion-sicher), und die Bühnenfarben folgen dem neuen
  Marken-Orange. Verifiziert mit tsc, ESLint (src) und Produktions-Build;
  Browser-Prüfung für Hero, weiße Button-Schrift (hell + dunkel) und den
  schwebenden Menü-Knopf. Hinweis: Der lokale Preview-Browser verlor am Ende
  die externe Netzverbindung, daher liefen die letzten eingeloggten Checks
  über DOM-Prüfungen; Produktion nach dem Deploy per HTTP geprüft.
- ✅ **Feinschliff-Runde 3 (20.07.2026, live):** Hero-Stichpunkte kleiner und
  mobil bewusst auf einer Zeile; der Hinweissatz „Die Antwort bleibt bei
  deiner Aufgabe." ist entfernt. Die helle Sidebar ist kräftiger orange
  (`--side: #FFEAD3`) und hebt sich klar von der Lernfläche ab. Der
  Coach-Drawer zeigt Aufgaben-Kontexte jetzt vollständig (mehrzeilig, bei
  sehr langen Texten scrollbar) statt hart nach 120 Zeichen zu kürzen.
  Sidebar-Themen lassen sich per Klick auf das aktive Thema ein- und
  ausklappen; Hover öffnet Untermenüs erst nach 160 ms, damit nichts
  versehentlich aufklappt. Der Fortschrittskern im G füllt sich jetzt im
  Uhrzeigersinn (nach rechts). Aktive Themenfilter auf der
  Wiederholen-Seite sind orange. Die Weiterlernen-Buttons tragen ein
  dunkleres Logo-Orange (`--brand-rind-deep`, aus den beiden
  Original-Logofarben gemischt). Die FAQ-Intro ist nicht mehr sticky —
  die Sektion scrollt wie die übrigen. Im Brotkrumen-Pfad ist auch die
  Tab-Ebene (Zusammenfassung/Übungen) klickbar. Videos haben einen
  Geschwindigkeits-Umschalter (1× / 1,25× / 1,5× / 2×, wirkt auf Stimme
  und stumme Segmente) neben den vorhandenen Spul-Tasten. Verifiziert mit
  tsc, ESLint (src), Produktions-Build und Browser-Smoke (390 px:
  Stichpunkte einzeilig).
- ✅ **Feinschliff-Runde 4 (20.07.2026, live):** Hero-Headline „Deine gesamte
  Mathe-Abiturvorbereitung an einem Ort." Der Eyebrow-Satz und die
  Landing-Icons (Lernsystem, Lernmethoden) sowie die Hero-Aufzählungspunkte
  tragen jetzt das dunklere Logo-Orange der Weiterlernen-Buttons
  (`--brand-rind-deep`), in Hell und Dunkel. Social-Media-Links (Instagram,
  TikTok, Facebook) nach dem Abschluss-CTA „Fang an." Mobiles Menü für
  Angemeldete: nur noch „Abmelden", rechtsbündig. **Sidebar im Lernbereich
  (heller Modus) auf dunkles Logo-Orange** mit heller Schrift
  (`--side: #4E2708`, `--side-tx: #FFF2E6`) — klar abgehoben von der weißen
  Lernfläche. **Reel-Modus jetzt echtes TikTok-Verhalten:** kein Play-Button
  mehr (nur ein Play-Indikator bei Pause), die Formel-Kachel hinter dem
  früheren Button ist entfernt, keine Untertitel; der Videotitel steht unten
  wie ein Creator-Name. Gesten: Tippen = Play/Pause, Doppeltippen links/rechts
  = ein Segment zurück/vor, Gedrückthalten = schnelles Spulen; vertikales
  Wischen bleibt fürs Reel-Wechseln. Verifiziert mit tsc, ESLint (src),
  Produktions-Build und Browser (Landing hell/dunkel, dunkle Sidebar im
  Lernbereich, Reel-Tap-Pause auf 390 px).
- ✅ **Feinschliff-Runde 5 (20.07.2026, live):** Mobiles Menü für Angemeldete
  zeigt „Weiterlernen" (orange) wieder neben „Abmelden". „Kostenlos testen"
  ist jetzt orange wie „Weiterlernen" (Hero, Abschluss, mobil). Landing-Eyebrow
  („Online-Intensivkurs …") deutlich dunkler (`color-mix` aus
  `--brand-rind-deep` + `--ink`; im Dunkelmodus hell). Social-Links: nur
  Instagram verlinkt (`instagram.com/gradefruit.de`), TikTok/Facebook sind
  ruhige, nicht klickbare Platzhalter. Hero-Link „Gradefruit entdecken"
  entfernt. Login/Registrieren-Maske: „Mathematik-Abitur Hessen 2027" statt
  „Mathe-Abi Hessen", Tag-Zeile und Umschalt-Link neutral (grau/ink statt
  Orange). **Sidebar im Lernbereich (heller Modus) wieder echtes Schwarz**
  (`--side: #050505`, DESIGN.md-Regel) statt Espresso-Orange. **Favicon neu
  erzeugt** aus dem aktuellen Markenzeichen (16–256 px, frische Bytes → iOS
  lädt das Tab-Icon neu). **Reel überarbeitet:** der Videotitel liegt jetzt im
  Fluss unter dem Inhalt und überdeckt Formel/Schritte nicht mehr; „Ton an"-
  Chip entfernt (Ton folgt dem Gerät); Play→Pause→Play setzt exakt an der
  Pausenstelle fort (kein Neustart); Doppeltippen links/rechts spult
  stufenlos vor/zurück, Gedrückthalten spult flüssig; iOS-Langdruck-Kopieren
  per `user-select`/`touch-callout: none` unterbunden. Verifiziert mit tsc,
  ESLint (src), Produktions-Build und Browser (Landing hell/dunkel + 390 px,
  schwarze Sidebar hell, Reel eingeloggt: kein Overlap, Pause/Resume,
  Doppeltipp-Spulen).

- ✅ **Feinschliff-Runde 6 (20.07.2026, live) — Lernbereich neu strukturiert:**
  **Sidebar:** die frühere Kurs-Fortschrittskarte ist ein klickbarer
  **„Zum Dashboard"**-Knopf; der Navigationspunkt „Übersicht" heißt jetzt
  **„Dashboard"** (auch Brotkrume/Feed). Aktives Thema klappt beim erneuten
  Klick **sofort** ein (Hover-Zustand wird zurückgesetzt); Zusammenfassung und
  Übungen lassen sich in der Sidebar ein-/ausklappen. **Themenansicht:** Index
  listet **nur die Überschriften** (kein Vorschautext, kein „Video"-Label);
  der Lernstatus erscheint als **farbiger Punkt (grün/gelb/rot)** statt Text.
  **Zusammenfassungs-Detail:** Inhalt wird **direkt** in einem Kasten gezeigt
  (kein „anzeigen/verbergen" mehr), Formeln direkt darunter, jeder Kasten kann
  eine KI-Frage auslösen. **Abgegrenzte Aktionszone** (KI fragen · Tutor
  fragen — **ohne Video**) plus **Ampel-Status** (Verstanden = grün,
  Wiederholen = gelb, Nicht verstanden = rot); der Text „Wie sicher fühlst du
  dich?" ist weg. Unten kein „Vorherige/Zurück"-Knopf mehr — nur noch
  **„Nächste …"** als hervorgehobener CTA und „Frage stellen".
  **Wiederholen-Seite:** Filter tragen dieselben Ampelfarben. Neue Farbtokens
  `--yellow` und `--warn-soft` (hell + dunkel). Verifiziert mit tsc, ESLint,
  Produktions-Build und Browser (Analysis eingeloggt, hell + dunkel, Sidebar-
  Einklappen, Ampel-Punkte in Detail und Wiederholen).

- ↩️ **Landing „Bold / Street" (21.07.2026) — verworfen & zurückgerollt:**
  Ein Versuch, die Landing radikal weg vom KI-Look zu bringen (schwarzes
  Poster-Hero, riesige Versal-Grotesk). **Leon gefiel das nicht — zu radikal.**
  Auf Stand `fbf520e` zurückgesetzt. Lehre: **keine radikalen Rundumschläge**.
- ✅ **Landing behutsam „weniger KI" (21.07.2026, live):** Auf Leons konkrete
  Angabe (Farben / Rundung+Schatten / Ton+Aufbau) in kleinen Schritten, nur in
  der Landing (App-Innenbereich unangetastet): **kühlere/ruhigere Farben**
  (aktiver Menüpunkt neutral statt warmes Orange-Feld, Nav solider mit weniger
  Glas & Schwebe-Schatten), **flachere, weniger runde Karten** (8px statt 14/18,
  feine Linien statt weicher Schatten), **nüchterner linksbündiger Aufbau**
  statt zentrierter Marketing-Mitte (Hero, Sektions-Intros, FAQ). Inhalte,
  Struktur und die Produkt-Grafiken (Coach/Bibliothek) bleiben. Umgesetzt als
  kleiner Override-Block am Ende von `LandingPage.module.css`. Verifiziert mit
  Build + Browser (hell, Hero linksbündig, Karten flach).
- ✅ **Hero mit Vertrauens-Bild + Feinschliff (22.07.2026, live):** Der Hero ist
  jetzt **zweispaltig** — Text links, rechts ein einladendes, vertrauensbildendes
  **echtes Foto** einer Mathe-Lernsituation (Hand schreibt Geometrie-Formeln am
  Schreibtisch), mit kleinem Badge „Hessen · Abitur 2027". Datei
  `public/hero-lernen.jpg` (Quelle: Pexels-Foto 5212341, **Pexels-Lizenz** —
  frei nutzbar inkl. kommerziell, ohne Namensnennung; **keine erkennbaren
  Gesichter**). Der Satz „Analysis ist kostenlos …" ist **entfernt**. Der
  Abschnitt „Mehr als ein Kurs. Ein vollständiges Lernsystem." (und die übrigen
  `.sectionIntro`-Überschriften) sind wieder **zentriert**. Mobil stapelt das
  Bild unter den Text. Verifiziert mit tsc, ESLint, Build, Browser (hell +
  dunkel, Desktop-2-Spalten). Foto lässt sich jederzeit durch Leons eigenes
  ersetzen (Datei tauschen). Hinweis: die zuvor gebauten `--hv-*`-Tokens/SVG-
  Illustration wurden ersetzt (Tokens noch in globals.css, ungenutzt/harmlos).

## Bekannte Probleme / offen
- 🔴 **Verkaufsstart-Blocker (Leon):** Impressum, AGB und Widerruf enthalten
  rote Platzhalter (Name, Adresse, E-Mail, USt-Status §19, Zugangs-Enddatum,
  AGB-Stand) → ausfüllen + juristisch prüfen lassen. Danach Stripe TEST→LIVE
  — **Schritt-für-Schritt-Checkliste in [HANDOUT.md](HANDOUT.md)**.
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
