# Gradefruit — Projekt-Status

> Gemeinsame Wissensbasis für **Claude Code** (Umsetzung) & **ChatGPT** (Beratung).
> **Nach jeder größeren Änderung aktualisieren.** Stand: 2026-08-03 (App-Feinschliff: Reels, gleiche Überschriften, iOS-Zoom-Fehler behoben)
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

## Aktueller Stand (Kurzfassung, Stand Sprint 11)

**Das Produkt ist funktional komplett für den Verkaufsstart** — es fehlt nur
der Live-Gang (Stripe TEST→LIVE, Rechtstexte juristisch prüfen). Seit Sprint 11
kommt die **native App** dazu, die noch nicht veröffentlicht ist.

- **Landing** (`/`): Premium-Einstieg, geführter Lernweg, kontextueller Coach,
  Lernmethoden, Kurse (GK 79 €/14,90 · LK 99 €/17,90), FAQ, Closing.
- **Lernbereich:** 3 Themen × Zusammenfassung | Übungen; Lernhilfen und Status
  erst nach dem Öffnen; klickbare Formeln/Schritte öffnen den Coach.
- **Wiederholungssystem:** drei Lernstufen pro Aufgabe, Wiederholen-Seite mit
  Filtern, Dashboard-Kacheln springen mit Vorauswahl dorthin.
- **Reel-Modus** (`/feed`): vertikaler Video-Feed mit Autoplay,
  Fortschrittsstreifen wie bei Stories und einer Aktionsspalte rechts
  (Lernstatus, Sprung zur Aufgabe).
- **Konto & Kauf:** Auth (E-Mail + Google), Checkout, Webhook schaltet frei,
  Kundenportal, Kontoseite mit Löschfunktion.

### Neu in Sprint 11 — Sicherheit und Zugriff

- **Inhalte liegen server-seitig** (`src/server/content/`, `server-only`) und
  kommen einzeln über `GET /api/content` — erst nach Zugangsprüfung. Der
  Browser bekommt nur `src/lib/contentIndex.ts` (IDs und Überschriften).
  **Die Bezahlschranke ist damit eine echte Grenze**, keine Oberfläche mehr.
- **Ein-Geräte-Sperre repariert:** Der Anspruch hing am SIGNED_IN-Ereignis,
  das Supabase auch beim bloßen Wiederherstellen einer Sitzung sendet — jedes
  Neuladen riss ihn zurück und warf das andere Gerät hinaus. Übernahme jetzt
  nur bei bewusster Anmeldung.
- **Automatisches Abmelden repariert:** `touch()` lief vor `check()`, der
  Seitenaufruf überschrieb also die Frist, die er prüfen wollte.
- **Erzwungenes Abmelden erklärt sich:** Hinweis auf der Startseite statt
  wortlosem Rauswurf.
- **Offline:** Service Worker (Gerüst + Ausweichseite, **niemals `/api/`**),
  verschlüsselte Ablage gekaufter Inhalte auf dem Gerät, „Für offline
  speichern" je Thema. Ablage gehört einem Konto und wird beim Abmelden
  gelöscht.
- **KI-Coach abgesichert:** Themengrenzen, keine anstößigen Ausgaben, keine
  medizinischen/rechtlichen Ratschläge, Verweis auf die Telefonseelsorge bei
  Notlagen, „Antwort melden" unter jeder Antwort.
- **Lektionen vollständig:** 54 der 133 Aufgaben hatten keine Zeile in
  `lessons`; ihr Lernstatus konnte nie gespeichert werden (stiller Abbruch in
  `ProgressContext`). Behoben, Skript `scripts/seed-lessons.mjs` hält es
  künftig konsistent.

### Neu in Sprint 11 — App

- **Web-App installierbar** (Manifest + Apple-Angaben): Home-Bildschirm-Icon,
  Vollbildstart, auch auf dem iPhone. Kostenlos, ohne Store.
- **Native Hülle** in `native/` (Capacitor): iOS und Android bauen und starten.
  Android setzt `FLAG_SECURE` (ungetestet), iOS-Screenshot-Schutz **belegt
  wirkungslos** und deshalb abgeschaltet.
- **App-Oberfläche:** untere Navigationsleiste (Lernen · Themen · Wiederholen ·
  Reels · Konto), schlanke Kopfzeile mit Zurück, Zurück-Wischen von der
  linken Kante, Übergänge, Platzhalter statt weißer Flächen, Vibration beim
  Einordnen, kein Kaufweg in der App (Apple-Regel), Countdown-Widget.
- **Lokale Lernerinnerung** über die App-Brücke, mit Uhrzeit.

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
- ✅ **Hero mit Vertrauens-Bild + Feinschliff (22.07.2026, live; Foto am
  23.07. modernisiert):** Der Hero ist **zweispaltig** — Text links, rechts ein
  einladendes **echtes Foto**. Aktuell (Leons Wunsch: moderner/digitaler, kein
  Text im Bild) ein **iPad + Apple Pencil** beim digitalen Mitschreiben,
  **Hochformat-Rahmen** (5/6, `object-position: 50% 66%` fokussiert auf iPad +
  Hand), **ohne Text-Badge**. Datei `public/hero-lernen.jpg` (Quelle: Pexels-
  Foto 6712479, **Pexels-Lizenz** — frei inkl. kommerziell, ohne Namensnennung,
  kein Gesicht; auf 1100×1648, ~234 KB optimiert). Sauber eingebunden auf
  Desktop (2 Spalten) und Mobil (Bild unter dem Text). Der Satz „Analysis ist
  kostenlos …" ist **entfernt**. Der
  Abschnitt „Mehr als ein Kurs. Ein vollständiges Lernsystem." (und die übrigen
  `.sectionIntro`-Überschriften) sind wieder **zentriert**. Mobil stapelt das
  Bild unter den Text. Verifiziert mit tsc, ESLint, Build, Browser (hell +
  dunkel, Desktop-2-Spalten). Foto lässt sich jederzeit durch Leons eigenes
  ersetzen (Datei tauschen). Hinweis: die zuvor gebauten `--hv-*`-Tokens/SVG-
  Illustration wurden ersetzt (Tokens noch in globals.css, ungenutzt/harmlos).
- ✅ **Hero als integriertes Vollbild-Foto (25.07.2026, live):** Auf Leons Wunsch
  ist das Hero-Foto jetzt ein **randlos eingebundenes Hintergrundbild** (kein
  gerahmtes Zweispalten-Bild mehr). Motiv: **cleaner Lernplatz mit MacBook +
  aufgeschlagenem Heft** (Datei `public/hero-lernen.jpg`, Quelle Pexels-Foto
  8092413, Pexels-Lizenz — frei inkl. kommerziell, ohne Namensnennung, kein
  Gesicht). Das Bild sitzt rechts und wird an **allen Kanten** über eine
  `radial-gradient`-**Maske weich ausgeblendet** — keine harten Rechteck-Ecken
  mehr; da das Foto überwiegend hell ist, verschmelzen die hellen Kanten im
  Hellmodus unsichtbar mit der Seite. Links bleibt viel **ruhiger Freiraum**,
  die Headline „…Abiturvorbereitung…" liegt **nicht mehr auf dem Laptop**.
  **Dark Mode:** dasselbe Bild, per `filter: brightness(.5)` abgedunkelt, Text
  hell/lesbar. **Nicht interaktiv** (kein Klick/Ziehen/Kopieren via
  `pointer-events`/`user-select`/`touch-callout: none`). **Mobil:** Headline +
  „Kostenlos testen" liegen oben auf freier Fläche, das Foto blendet **darunter**
  weich herein — der Button überdeckt den Laptop **nicht** mehr. Umgesetzt im
  Override-Block am Ende von `LandingPage.module.css`. Verifiziert mit tsc,
  ESLint, Build und Browser (hell + dunkel Desktop, 375 px mobil).

- ✅ **Hero-Motiv neu: KI-Foto + echtes Dashboard auf dem Bildschirm
  (26.07.2026, live):** Das Stockfoto ist ersetzt durch ein **von Leon per
  ChatGPT erzeugtes Bild** (blaues Laptop, karierter Collegeblock, schwarzer
  Kuli, ruhiger heller Hintergrund, viel Freiraum links). Quelle liegt als
  `design/hero-quelle-laptop.png` (bewusst **außerhalb** von `public/`, sonst
  würden 1,7 MB an jeden Besucher ausgeliefert). **Der Bildschirminhalt ist
  nicht gemalt:** ein echter Dashboard-Screenshot wird per Homographie auf die
  vier erkannten Panel-Ecken perspektivisch eingepasst (plus dezenter
  Lichtschleier), Ergebnis = `public/hero-lernplatz.jpg`. Screenshot entstand
  headless über Chrome-DevTools-Protokoll mit einem Wegwerf-Testkonto
  (Anzeigename „Lena", 39 % Fortschritt gesetzt, Konto danach gelöscht).
  Layout aufs neue Motiv abgestimmt: Hero-Höhe näher am 3:2 des Fotos (Block
  und Stift bleiben im Bild), linker Schleier auf 26 % verkürzt (endet genau
  dort, wo der Laptop beginnt — kein Schleier über dem Produkt), im
  **Dunkelmodus deutlich längere Schleier** (34/30/26 %), weil das abgedunkelte
  Foto sonst als graues Rechteck auf dem Schwarz stand. Vorheriges
  `hero-lernen.jpg` entfernt. Verifiziert mit tsc, Build und Browser
  (hell + dunkel Desktop, 390 px mobil).
  **Nachbau möglich:** Bildschirm-Ecken in der Quelle sind
  TL(761,209) TR(1208,248) BR(1150,634) BL(709,551).
- ✅ **Nebenbefund behoben (29.07.2026):** Die App hing bei „Einen Moment …",
  wenn der Tab nicht sichtbar gezeichnet wurde — `setRouteReady(true)` lief in
  `requestAnimationFrame`, und das feuert in Hintergrund-Tabs nicht. Jetzt
  `setTimeout`: gleiche Wirkung, aber auch ohne Bildaufbau.

### Sprint 11 — Inhalte hinter eine echte Grenze, Offline, native App (27.–29.07.2026)

- ✅ **Inhalte liegen jetzt server-seitig** (`src/server/content/`, mit
  `server-only` abgeriegelt). Ausgeliefert werden sie einzeln über
  `GET /api/content?topic=…&level=…` — **erst nach Zugangsprüfung**. Der Browser
  bekommt nur `src/lib/contentIndex.ts`: IDs und Überschriften für die
  Navigation. Damit ist die Bezahlschranke eine **echte Grenze** und nicht mehr
  Oberfläche: Vorher lagen alle Lösungswege im JavaScript-Paket und ließen sich
  ohne Kauf auslesen. Wer eine Inhaltsdatei aus einer Client-Komponente
  importiert, **bricht den Build** — Absicht.
  Geprüft: kein Aufgabentext mehr im ausgelieferten Paket.
- ✅ **Analysis bleibt für Gäste frei** — die kostenlose Probe wird **vor** der
  Anmeldeprüfung ausgeliefert. (Fiel erst auf, als Leon als Gast „Die Inhalte
  konnten nicht geladen werden" sah.)
- ✅ **Offline lernen:** Themen lassen sich aufs Gerät laden, liegen dort
  **AES-GCM-verschlüsselt** in IndexedDB (`src/lib/offlineContent.ts`), sind an
  das Konto gebunden und werden beim Abmelden gelöscht. Dazu ein Service Worker
  (`public/sw.js`) für die App-Hülle — der `/api/`-Pfad wird **nie**
  zwischengespeichert. Eine eigene `public/offline.html` trägt ihren eigenen
  Notschalter, weil der Notschalter der App unerreichbar ist, wenn die App nicht
  startet.
- ✅ **Anmeldung entschärft:** Die Geräte-Bindung greift nur noch bei einer
  **bewussten** Anmeldung — Supabase meldet auch wiederhergestellte Sitzungen
  als „angemeldet", was zuvor fremde Geräte abmeldete. Die Leerlauf-Sperre
  prüft jetzt **vor** dem Weiterzählen.
- ✅ **Native App-Hülle (Capacitor 8, iOS über SPM).** Läuft auf Leons iPhone 14
  als richtige App. Wichtige Punkte: iOS 26 verlangt den **UIScene**-Ablauf
  (Capacitors Vorlage nutzt noch den alten Weg — daher eigener `SceneDelegate`);
  `contentInset: "never"`, damit die Seite unter die Statusleiste reicht;
  Sicherheitsabstände über `env(safe-area-inset-*)`.
- ✅ **App-Bedienung wie eine App, nicht wie eine Webseite:** untere Leiste im
  WhatsApp-Stil (Lernen · Themen · Wiederholen · Reels · Konto), Zurück-Wischen
  von links, Übergänge zwischen Bereichen, Ladeplatzhalter statt Spinner,
  Konto-Seite mit Kürzel-Bild und Einstellungen oben, App-Symbol = Logo.
- ✅ **Tägliche Lernerinnerung** funktioniert (ein **und** aus, Uhrzeit
  änderbar). Ursache des langen Ärgers: Ein- und Ausschalten liefen über
  **verschiedene Wege** zur Mitteilungs-Funktion; jetzt beide über die
  App-Brücke.
- ✅ **Prüfungs-Countdown als iOS-Widget** gebaut (Zieldatum 05.05.2027).
- ✅ **54 fehlende Lektionen ergänzt** (79 → 133). Zu jeder Aufgabe gibt es
  jetzt eine Lektion; vorher ging der Lernstatus von 54 Aufgaben **wortlos**
  verloren. Neu: `scripts/seed-lessons.mjs` (nur additiv, mehrfach ausführbar)
  und `scripts/check-content.mjs` (Inhalts-Prüfung, aktuell 0 Funde).
- ✅ **Seitliches Verrutschen behoben** — Ursache war das unsichtbare
  Wasserzeichen: Die Drehung saß am festen Rahmen, dessen Kasten dadurch über
  den Bildschirm hinausragte („Lernen" wurde zu „ernen").
- ❌ **iOS-Screenshot-Sperre verworfen.** Vier Umsetzungen, alle belegt
  wirkungslos (oder mit kaputter Darstellung erkauft). Apples eigene Sperre in
  WhatsApp steckt in Apples Systemschicht, an die eine App nicht herankommt.
  Abgeschaltet; das Wasserzeichen beim Drucken bleibt.
- ✅ **Entscheidung Apple-Provision: Weg B** — kein Kaufweg in der App. Der
  Checkout lässt sich in der App jetzt auch technisch nicht mehr öffnen (letzte
  Absicherung in `page.tsx`), und Zeilen, die dorthin führen würden, tauchen
  gar nicht erst auf.
- ✅ **Erklärvideos und 1:1 Nachhilfe unter „Konto → Mehr"** — in der App gibt
  es keine Seitenleiste, dadurch waren beide Seiten schlicht unerreichbar.
  Zurück führt von dort nach „Konto", nicht auf die Startseite; die doppelten
  Überschriften (Kopfzeile + Seitentitel) sind weg.
- ✅ **Die App öffnet nicht mehr auf der Werbeseite (30.07.2026, live):** Die
  App-Fassung der Startseite griff nur für Gäste — angemeldet bekam man die
  echte Landingpage samt Hero, Preisen und Webseiten-Menü. In der App ist
  `landing` für Angemeldete jetzt kein Ziel mehr; der Einstieg ist „Lernen".
- ✅ **Passwort ändern und zurücksetzen (31.07.2026, live):** Beides gab es
  vorher nicht — wer sein Passwort vergaß, kam nicht mehr an sein Konto.
  „Passwort vergessen?" in der Anmeldemaske schickt einen Link (Antwort ist
  immer dieselbe, egal ob es die Adresse gibt — sonst wäre das Formular eine
  Auskunft darüber, wer hier ein Konto hat). Der Link landet auf der echten
  Route `/passwort-neu`, die alle drei Nachweis-Formen von Supabase behandelt
  (`code`, `token_hash`, Sitzung im Anker). Unter „Mein Konto" lässt sich das
  Passwort auch direkt ändern.
  ⚠️ **Versand läuft über Brevo (eingerichtet 31.07.2026):** Domain
  `gradefruit.de` ist dort authentifiziert, Absender `noreply@gradefruit.de`,
  SMTP-Zugang in Supabase hinterlegt. **Falle:** Der SMTP-Schlüssel läuft am
  **31.07.2027** ab — und zusätzlich nach **90 Tagen ohne Nutzung**. In beiden
  Fällen hören die Mails **stillschweigend** auf; kein Fehler, nichts kommt an.
  Erster Verdacht, wenn nach ruhiger Phase keine Passwort-Mail mehr ankommt:
  neuen Schlüssel in Brevo erzeugen und in Supabase eintragen.
  ⚠️ **Weiter offen in Supabase:**
  `https://www.gradefruit.de/passwort-neu` unter Authentication → URL
  Configuration → Redirect URLs (sonst führt der Link nur auf die Startseite),
  und ein eigener Mailversand — ohne den kommen die Mails von Supabase und sind
  auf wenige pro Stunde begrenzt. Anleitung + fertige Texte:
  [supabase/email-vorlagen.md](supabase/email-vorlagen.md).
- ✅ **Service Worker: nur die Startseite darf das Gerüst sein (31.07.2026,
  live):** Vorher wurde JEDE erfolgreiche Seitenantwort unter dem Schlüssel „/"
  abgelegt. Wer zuletzt `/passwort-neu` offen hatte, bekam beim nächsten Aufruf
  von gradefruit.de dessen Seite — Adresse richtig, Inhalt falsch. Geprüft im
  Produktions-Build: Nach `/passwort-neu` liegt nur `offline.html` im Speicher,
  nach `/` das richtige Gerüst.
- ✅ **Registrierung in zwei Schritten, Ansprache freiwillig (31.07.2026, live):**
  Schritt 1 verlangt nur E-Mail und Passwort; die Bedingungen fürs Passwort
  (8 Zeichen, ein Buchstabe, eine Ziffer) stehen dabei und haken sich beim
  Tippen ab. Schritt 2 fragt **freiwillig** nach Name und Benutzername, mit
  „Überspringen". Angesprochen wird mit dem Namen, sonst mit dem Benutzernamen,
  sonst **gar nicht** („Guten Tag." statt eines geratenen Vornamens aus der
  E-Mail). Die Reihenfolge steckt an einer Stelle: `anzeigeName` im
  AuthContext.
- ✅ **Anmeldung mit E-Mail ODER Benutzername (31.07.2026, live):** Ein Feld für
  beides — das @ entscheidet. Supabase kennt nur E-Mail-Adressen, die
  Übersetzung passiert deshalb server-seitig in `POST /api/anmelden`: Dort wird
  nachgeschlagen UND angemeldet, und zurück geht nur die fertige Sitzung. Eine
  Route, die zu einem Namen die Adresse liefert, wäre eine Maschine zum
  Absammeln von E-Mail-Adressen. Falscher Name und falsches Passwort sehen
  identisch aus. Neu: `public.users.username` (eindeutig ohne Rücksicht auf
  Groß-/Kleinschreibung, kein @ erlaubt — daran hängt die Unterscheidung);
  freiwillig, nachtragbar unter „Mein Konto".
  SQL in `supabase/username.sql`, bereits ausgeführt.
- ✅ **Passwort-Vorschlag des iPhones in der App (31.07.2026, live):** Im Browser
  füllt iOS gespeicherte Zugangsdaten aus, in der App nicht — dort rückt das
  System sie nur heraus, wenn App und Domain nachweislich zusammengehören. Die
  Domain-Hälfte des Nachweises liegt jetzt unter
  `/.well-known/apple-app-site-association`. Die App-Hälfte (Berechtigung
  „Associated Domains") braucht das Entwicklerprogramm und fehlt noch.
- ✅ **Startseite der App editorial statt Kachel (30.07.2026, live):** Die
  Übersichts-Kachel war im App-Vollbild das, was am meisten nach Webseite
  aussah. In der App jetzt nach der Regel aus DESIGN.md: Tage bis zur Prüfung
  als übergroße Bricolage-Zahl, Haarlinien statt Rändern, linksbündig. Der
  Browser behält die Kachel — dort teilt sich die Seite den Platz mit
  Seitenleiste und Kopfzeile.

- ✅ **Startbild statt „Einen Moment …" (01.08.2026, live):** Beim Öffnen zeigt
  die App nur ihr Logo. Dauert es länger als sonst, kommt nach acht Sekunden ein
  Satz dazu, nach zwanzig der Hinweis auf Wartungsarbeiten mit „Neu laden". Ein
  leerer weißer Bildschirm ist damit kein möglicher Zustand mehr.
  (`src/components/Startbild.tsx`)
- ✅ **Lernerinnerung kennt die Woche (01.08.2026, live):** Statt einer Uhrzeit
  für alle Tage gibt es unter „Bearbeiten" je Wochentag einen Schalter und eine
  eigene Zeit. Voreinstellung: Mo, Di, Do, Fr um 13:30 (nach der Schule), Sa um
  12:00; Mi und So bleiben frei, damit nie mehr als zwei Tage ohne Anstoß
  vergehen. Näher an der Prüfung rückt der Plan von selbst zusammen — aber nur,
  solange niemand etwas Eigenes eingestellt hat. iOS kann keine Mehrtages-Regel,
  deshalb je Wochentag eine eigene Mitteilung mit fester Nummer (`10 + Tag`).
  (`src/lib/erinnerungsplan.ts`)
- ✅ **Reels sehen aus wie Reels (01.08.2026, live):** Der Reel-Player war die
  Modalansicht mit anderen Farben — ein Kasten mit Rand, in einem großen
  schwarzen Feld. Jetzt ein eigener Aufbau: Fortschrittsstreifen pro Abschnitt
  oben (wie bei Stories), das Bild randlos in der Mitte, Beschriftung und
  Untertitel unten links, Aktionsspalte rechts (Verstanden · Wiederholen ·
  Unklar · Aufgabe · Start). Die Pillenleiste oben und das doppelte
  Knopfpaar unten sind weg.
  **Nebenbefund:** Vier der sechs Erklärvideos hatten gar keinen Graphen — im
  Reel blieb die Bühne deshalb leer. `v1` hat jetzt einen (3x⁴ − 5x² + 7);
  wo ein Graph fachlich keinen Sinn ergibt (Vektoren, Stochastik), trägt die
  Schrift das Bild: Funktion und Formelzeile werden groß.
- ✅ **Untere Leiste rückt beim Scrollen zusammen (01.08.2026, live):** Wie bei
  Instagram — beim Herunterscrollen schrumpfen die Beschriftungen weg, beim
  Hochscrollen sind sie sofort wieder da. Gleichzeitig ist der Weichzeichner
  hinter der Leiste entfallen: Er musste auf dem iPhone bei jedem Bild neu über
  den durchlaufenden Inhalt gerechnet werden und ließ das Scrollen abgehackt
  wirken. Eine zu 94 % deckende Fläche sieht kaum anders aus und kostet nichts.
- ✅ **Themen-Filter unter „Wiederholen" im Raster (01.08.2026, live):** Als
  Pillenreihe wurde „Stochastik" abgeschnitten. Jetzt dasselbe Raster wie das
  Segment darüber, damit kein Name mehr abreißt.
- ✅ **Countdown kleiner, mit Kalendersymbol (01.08.2026, live);** unter „Konto"
  steht „Mehr" jetzt ganz unten.

- ✅ **iOS-Zoom nach dem Anmelden behoben (03.08.2026, live):** Nach jeder
  Anmeldung war der Bildschirm zu breit — man musste seitlich schieben, unten
  fehlte ein Stück, und erst ein Neustart der App setzte es zurück. Ursache war
  keine Layout-Angabe, sondern iOS: Beim Antippen eines Eingabefeldes mit einer
  Schrift **kleiner als 16px** zoomt iOS hinein und bleibt hineingezoomt. Die
  Anmeldemaske hat Felder mit 14 bis 15px. Regel in `globals.css` unter
  `@supports (-webkit-touch-callout: none)`: In der App sind Felder 16px, am
  Schreibtisch bleibt die Typografie unverändert.
- ✅ **App meldet nicht mehr von selbst ab (03.08.2026, live):** Die
  Zwei-Stunden-Frist gilt nur noch im Browser. Ein Browser läuft oft auf einem
  fremden Rechner; eine installierte App liegt auf einem Gerät, das dem Nutzer
  gehört und selbst gesperrt ist. Dort ist das Abmelden kein Schutz, sondern
  eine Zumutung. Die Ein-Geräte-Sperre bleibt unverändert.
- ✅ **Federndes Scrollen auch auf kurzen Seiten (03.08.2026, live):**
  WKWebView federt von sich aus nur, wenn der Inhalt länger als der Bildschirm
  ist — auf „Themen" passierte beim Wischen deshalb gar nichts. Jetzt
  `alwaysBounceVertical` (und `alwaysBounceHorizontal = false`) im
  SceneDelegate; ein hineingezoomter Zustand wird beim Aktivieren zurückgesetzt.
- ✅ **Alle Abschnitts-Überschriften unter „Konto" gleich (03.08.2026, live):**
  „Lernerinnerung" war eine andere Schrift und Größe als „Passwort" oder
  „Zugang". „Erscheinungsbild" ist weg — „Dark Mode" ist jetzt selbst die
  Überschrift, mit dem Schalter daneben. Eine Überschrift über genau einem
  Schalter sagt nichts, was der Schalter nicht schon sagt.
- ✅ **Reels: bewerten wieder oben, Text wie bei TikTok (03.08.2026, live):**
  Die drei Stufen stehen wieder als Leiste unter den Fortschrittsstreifen; die
  Spalte rechts trägt nur noch „Aufgabe" und „Start". Der gesprochene Satz steht
  zweizeilig da, „mehr" klappt ihn auf.
- ✅ **Filter unter „Wiederholen" in zwei Spalten (03.08.2026, live):** Links
  die vier Lernstufen untereinander, rechts die drei Themen untereinander. Als
  Reihe passte „Lineare Algebra & Geometrie" in keiner Fassung.

- ✅ **Offline repariert (03.08.2026, live):** Der Service Worker legte das
  Seitengerüst erst beim **zweiten** Seitenaufruf ab — beim ersten übernimmt er
  gerade erst die Kontrolle. Im Browser fällt das nicht auf (man klickt
  weiter), in der App gibt es pro Start genau **einen** Seitenaufruf: Nach jeder
  Veröffentlichung war Offline deshalb bis zum übernächsten Start wirkungslos.
  Jetzt holt `install` das Gerüst selbst (`cache.addAll` mit `cache: 'reload'`),
  und Bilder und Schriften werden mitgespeichert — vorher startete die App ohne
  Netz zwar, sah aber kaputt aus. Version auf `gf-v5`.
  **Nachgewiesen:** Produktions-Build, angemeldet, Analysis geöffnet, dann den
  Server **abgeschaltet** und neu geladen — die App startet, bleibt angemeldet,
  zeigt Zusammenfassung und alle 23 Aufgaben aus der verschlüsselten Ablage und
  meldet „Offline verfügbar".
  Ergänzend: `server.errorPath` in `capacitor.config.json` zeigt eine
  mitgelieferte Seite, wenn schon der allererste Start ohne Netz passiert (dann
  gibt es noch keinen Service Worker).

## Bekannte Probleme / offen

**Verkauf**
- 🔴 **Stripe im TEST-Modus** — echte Kunden können nicht zahlen. Umstellung auf
  LIVE (Live-Schlüssel in Vercel + Live-Webhook inkl. `charge.refunded`) ist der
  größte Schritt zu echtem Umsatz.
- 🔴 **LK-Preise fehlen lokal** (`STRIPE_PRICE_LK_ONE_TIME`,
  `STRIPE_PRICE_LK_MONTHLY`) — in Vercel für den Live-Gang nötig.
- 🟠 **Rechtstexte** tragen den Hinweis „noch nicht rechtsverbindlich, Seite im
  Aufbau". Vor dem Verkaufsstart juristisch prüfen lassen.

**App (nicht veröffentlicht)**
- 🔴 **iOS-Screenshot-Schutz funktioniert nicht.** Vier Umsetzungen geprüft,
  alle belegt wirkungslos oder schädlich; abgeschaltet. Android `FLAG_SECURE`
  ist der verlässliche Teil, aber **ungetestet** — braucht ein Android-Gerät.
- 🟠 **Apple-Provision ungeklärt.** Entscheidung gefallen: kein Kaufweg in der
  App (Weg B). Umgesetzt, aber Apples Auslegung bleibt ein Restrisiko.
- 🟠 **Store-Veröffentlichung offen** — braucht Entwicklerprogramm (99 $/Jahr).
  Alle Texte liegen fertig in [native/APPSTORE.md](native/APPSTORE.md);
  Screenshots fehlen.
- 🟡 Vieles an der App-Oberfläche ist **gebaut, aber nicht von Claude geprüft** —
  im Simulator sind Wischen und Tippen unzuverlässig. Rückmeldung per
  Screenshot ist der schnellste Weg.

**App: offen und bewusst nicht gelöst**
- 🔴 **Screenshots lassen sich auf iOS nicht verhindern** — vier Umsetzungen
  geprüft, alle belegt wirkungslos oder schädlich (siehe unten). Was funktioniert:
  **Bildschirmaufnahme** wird erkannt und abgedeckt (`ScreenshotGuard`).

**Sonstiges**
- 🟡 **Zusammenfassungs-Fortschritt liegt nur lokal** (`gf-summary-status`) —
  geht beim Gerätewechsel verloren. Braucht ein serverseitiges Datenmodell.
- 🟡 **Ein Erklärvideo (`l1`) hängt an keiner Aufgabe.**
- 🟡 **Stiller Abbruch bleibt möglich:** `ProgressContext` bricht wortlos ab,
  wenn zu einer Aufgabe die Lektion fehlt. Die Daten sind jetzt vollständig,
  aber neue Inhalte brauchen `scripts/seed-lessons.mjs`.

## Nächste sinnvolle Schritte

1. **App auf dem iPhone durchgehen** und alles, was sich falsch anfühlt, per
   Screenshot melden — die App-Oberfläche ist der am wenigsten geprüfte Teil.
2. **Stripe TEST → LIVE** schalten, davor Rechtstexte prüfen lassen.
3. **Testen lassen:** Web-App auf den Home-Bildschirm (kostenlos, sofort) oder
   TestFlight (braucht die 99 $, aber keine Store-Freigabe).
4. Zusammenfassungs-Fortschritt in die Datenbank heben.
5. Mehr Aufgaben, mehr Erklärvideos; `l1` einer Aufgabe zuordnen.
6. Android-Screenshot-Sperre auf einem echten Gerät prüfen.

### Prüfskripte

| Befehl | Prüft |
|---|---|
| `node scripts/check-content.mjs` | Inhalte in sich stimmig (Index, Videos, Vollständigkeit) |
| `node --env-file=.env.local scripts/seed-lessons.mjs` | Hat jede Aufgabe eine Lektion? |
| `node --env-file=.env.local scripts/check-content-gate.mjs <mail> <pw>` | Greift die Bezahlschranke? |
| `node --env-file=.env.local scripts/check-webhook.mjs` | Stripe-Webhook |

## Arbeitsteilung & Regeln
- **Claude Code**: kennt Codebasis, setzt um, committet/pusht **nur auf ausdrückliche
  Ansage** (Push = Live-Deploy auf Vercel).
- **ChatGPT**: Produktentscheidungen, Architektur, Priorisierung, schreibt optimierte
  Prompts für Claude Code auf Basis DIESER Datei.
- **Leon**: bedient Web-Dashboards (Stripe, Supabase, Vercel, Google Cloud, GitHub,
  Hostinger); editiert keine Dateien selbst.
