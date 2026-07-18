---
name: Gradefruit
description: Premium-Lernplattform für das Mathe-Abitur Hessen 2027 — klares Weiß, echtes Schwarz, eine Grapefruit.
colors:
  canvas: "#F7F7F8"
  surface: "#FFFFFF"
  surface-muted: "#F0F0F2"
  ink: "#050505"
  muted: "#5F6067"
  faint: "#6E7078"
  line: "#E6E6E9"
  line-strong: "#D3D3D8"
  control: "#ECECEF"
  grapefruit: "#F26B4A"
  grapefruit-deep: "#B93820"
  grapefruit-soft: "#FFF0EC"
  success-green: "#198754"
  danger-red: "#C62828"
  side-black: "#050505"
  side-black-2: "#111113"
  side-black-3: "#27272A"
  side-text: "#EEEEF0"
  dark-canvas: "#050505"
  dark-surface: "#0D0D0F"
  dark-ink: "#F8F8F9"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(40px, 6.4vw, 68px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "clamp(29px, 4vw, 34px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.022em"
  title:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "10.5px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.55
    letterSpacing: "0"
rounded:
  pill: "999px"
  panel: "18px"
  card: "14px"
  control: "8px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "26px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "13px 24px"
  button-primary-hover:
    backgroundColor: "#1A1A1C"
  button-light:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 24px"
  chip-action:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 13px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 15px"
---

# Design System: Gradefruit

## 1. Overview

**Creative North Star: „Schwarz. Weiß. Grapefruit."**

Gradefruit arbeitet mit einem ruhigen neutralen Weiß, echtem tiefem Schwarz
und genau einer Markenfarbe. Die Grapefruit ist die einzige laute Stimme im
Raum: als Logo, Fortschritt, Fokus und gezielter Akzent. Wärme und Energie
kommen aus der Frucht, nicht aus beige eingefärbten Flächen oder braunem Text.
Alles andere hält sich zurück, damit diese eine Stimme trägt. Das System
verweigert sich ausdrücklich der „klassischen Lernplattform", dem
„Dashboard-SaaS" und dem „typischen KI-Produkt" (siehe PRODUCT.md,
Anti-references) — es orientiert sich an Apple (Zurückhaltung, Hierarchie),
Nike (Selbstbewusstsein) und Peso/LFDY (reduzierte Street-Ästhetik der
Zielgruppe).

Bewegung ist Feedback, nie Dekoration. Sie läuft in **zwei Registern**, und
wer sie verwechselt, baut sie falsch:

*Register 1 — Zustandsübergänge* (99 % des Produkts: Hover, Öffnen,
Einblenden, Tab-Wechsel). CSS-Transitions, 140–260 ms, ausschließlich
`transform`/`opacity`/Farbe. Seltene Einstiege heben 6–7 px an und faden ein —
nie aus `scale(0)`, nichts erscheint aus dem Nichts. Ausgang schneller als
Eingang (der Nutzer entscheidet langsam, das System antwortet schnell).
Listen erscheinen ohne orchestrierte Kaskaden, damit die App direkt reagiert.
Interaktionen quittieren sofort (Hover −1 px, Active `scale(.98)`). Eigene
Kurven statt der schwachen
eingebauten — die Haus-Kurve ist `cubic-bezier(.2,.7,.3,1)`; **eingebautes
`ease-in` ist auf UI verboten** (startet träge genau im Moment des
Hinsehens), `transition: all` ebenso (Eigenschaften immer benennen).

*Register 2 — Gesten* (der **Reel-Modus**, `/feed`). Wischen und Snappen sind
direkte Manipulation und folgen Apples Fluid-Prinzipien: der Inhalt bleibt
1:1 am Finger, jede Bewegung ist **jederzeit unterbrechbar und umkehrbar**,
die Geschwindigkeit beim Loslassen wird an die Folgebewegung übergeben
(Feder/Impuls, keine feste Dauer), Ein- und Ausgang teilen sich denselben
Pfad. Feste CSS-Keyframes sind hier falsch — sie lassen sich nicht mitten im
Wisch greifen und starten bei Unterbrechung von null. Für Gesten: Federn
(oder WAAPI), nie starre Keyframes.

Über beiden Registern: Layout wird nie animiert (kein `width`/`height`/
`margin`), Hover-Effekte stehen hinter `@media (hover: hover)` — auf Touch
löst Tippen sonst falsche Hover-Zustände aus —, und
`prefers-reduced-motion` schaltet global alles ab (Fades zur Orientierung
dürfen bleiben, Bewegung fällt weg).

**Die Soll-das-überhaupt-animieren-Regel.** Was der Nutzer hundertfach am
Tag sieht (Häkchen setzen, Tab wechseln), animiert kaum oder gar nicht —
Animation macht Häufiges langsam. Je seltener und bedeutungsvoller ein
Moment (Video öffnet, Kauf gelingt), desto mehr Bewegung ist erlaubt.
Im Zweifel: weniger.

**Die Dark-Mode-Regel.** Dark Mode entsteht ausschließlich durch
CSS-Variablen unter `body.dark` (echtes Schwarz mit neutral abgestuften
Flächen, nicht als simple Invertierung).
Komponenten verwenden Variablen, niemals harte Theme-Farben — und globale
Selektoren auf CSS-Modul-Klassen sind verboten (sie greifen wegen der
Namens-Hashes nie; das war der Topbar-Bug aus Sprint 10).

**Die Editorial-Regel (Marken-Sprint).** Gradefruit soll ohne Logo erkennbar
sein und NICHT wie ein SaaS-/KI-Template wirken. Deshalb: **Inhalt lebt auf
ruhigen Flächen, geordnet durch Haarlinien (`.gf-rule`) und Weißraum — nicht in
weißen Karten-Boxen.** Verboten sind: zentrierte Symmetrie als Default,
farbig eingefärbte Headline-Wörter, Pillen-Buttons, das Icon-im-runden-Quadrat-
Karten-Raster. Stattdessen: linksbündige, asymmetrische Kompositionen mit
Spannung, übergroße Bricolage-Zahlen als Motiv (`.gf-index`: Countdown,
Fortschritt, Aufgaben-/Sektions-Nummern), ruhige Meta-Labels (`.gf-meta`),
nummerierte Listen statt Karten-Raster und die Grapefruit als
selbstbewusstes, angeschnittenes Grafik-Element (nicht nur als Watermark).
Karten bleiben erlaubt, wo sie einen echten Zweck haben (Kurs-Panels, Modals) —
aber nie als Default-Container für jede Information.

**Die Breakpoint-Regel.** Es gibt genau drei Schwellen: ≤900 px (Sidebar
wird zur Schublade über `body.navopen`), ≤760/820 px (mehrspaltige Raster
stapeln), ≤560 px (kompakte Abstände, Seiten-Padding 18 px). Keine weiteren
Magic-Breakpoints erfinden.

**Key Characteristics:**
- Neutrales Weiß + echtes Schwarz; eine Grapefruitfarbe, sparsam gesetzt
- Grapefruit = Marke = Fortschrittsanzeige (ein Symbol, eine Bedeutung)
- Primäraktionen in Schwarz; Grapefruit gehört Marke, Fortschritt und Fokus
- Karten mit feinen Linien statt Schatten; Tiefe nur als Antwort auf Interaktion
- Ruhige, schnelle Motion (140–260 ms, ease-out, transform/opacity)
- Keine Emojis im UI, nirgends

## 2. Colors

Die Palette ist bewusst streng: neutrales Weiß, echtes Schwarz und eine aus
echtem Grapefruit-Fruchtfleisch abgeleitete Akzentfarbe. Alle Werte leben als
CSS-Variablen in `src/app/globals.css`.

### Primary
- **Grapefruit** (#F26B4A): die einzige Markenfarbe. Logo, Fortschritt,
  Fokuszustände und wenige aktive Akzente. Nie als beliebige Dekoration.
- **Grapefruit Tief** (#B93820): kontrastreiche Textvariante auf hellem Grund;
  im Dark Mode #FF8A70 via `--accent-d`.
- **Grapefruit Zart** (#FFF0EC): Fokus- und Auswahlfläche. Im Dark Mode
  #2B1510. Beide sind Tonwerte derselben Marke, keine weiteren Farben.

**Die Eine-Stimme-Regel.** Grapefruit erscheint auf maximal ~10 % eines
Screens. Primäraktionen sind Schwarz, nicht Orange. Wenn ein Screen mehr
Akzent verlangt, ist seine Hierarchie zu schwach.

### Functional
- **Erfolg** (#198754), **Fehler** (#C62828) und **Warnung** (#9A6500) sind
  ausschließlich funktionale Zustände. Sie werden immer zusätzlich durch Text
  oder Form erklärt und sind keine Marken- oder Themenfarben.
- Analysis, lineare Algebra und Stochastik verwenden dieselbe Grapefruitfarbe.
  Unterscheidung entsteht durch klare Bezeichnung und Inhalt, nicht durch eine
  dekorative zweite Palette.

### Neutral
- **Canvas** (#F7F7F8): angenehmes, chromafreies Off-White. Nicht beige und
  nicht klinisch grell. Dark: #050505.
- **Fläche** (#FFFFFF): Karten und Controls. Dark: #0D0D0F.
- **Sekundärfläche** (#F0F0F2): Controls und Gruppierungen. Dark: #171719.
- **Schwarz** (#050505): Text, Navigation und Primäraktionen. Dark-Text:
  #F8F8F9.
- **Gedämpft** (#5F6067) / **Blass** (#6E7078): Sekundär-/Tertiärtext.
- **Linie** (#E6E6E9) / **Linie stark** (#D3D3D8): Ränder und Trenner.
- **Schwarz-Familie** (#050505 / #111113 / #27272A + Text #EEEEF0): die
  immer-dunkle Sidebar.
- **Funktionsglas** (`--glass`): ausschließlich Navigation, Topbar und
  Overlays. Inhaltskarten bleiben solide, damit Hierarchie und Lesbarkeit
  nicht vom Hintergrund abhängen.

## 3. Typography

**Display Font:** Bricolage Grotesque (sans-serif)
**Body Font:** Inter (mit -apple-system-Fallback)
**Mono Font:** JetBrains Mono — ausschließlich für Mathe (Formeln, Schritte, Ergebnisse)

**Charakter:** Bricolage Grotesque ist eine editoriale Grotesk mit eigenem
Charakter (warme, leicht unregelmäßige Terminals, Ink-Traps) — sie gibt der
Marke eine Stimme, die klar NICHT nach Default-Template klingt, und trägt von
14 px bis 68 px. Sie ist optisch skaliert (`font-optical-sizing: auto`):
tightes Tracking im Großen, offener im Kleinen. Inter bleibt der neutrale,
gut lesbare Text-Font für alles Leise (Mathe-Dichte!); Mono ist die „Tafel"
für Mathematik. Headlines dürfen groß und knapp sein (Nike-Ton), Fließtext
bleibt zurückhaltend.

### Hierarchy
- **Display** (800, clamp(40–68px), 1.04, −0.035em): nur Landing-Hero.
- **Headline** (800, clamp(29–34px), −0.022em): Seiten-H1 in der App.
- **Title** (700, 14.5–20px, −0.01em): Karten- und Abschnittstitel.
- **Body** (400/450, 13.5–15.5px, 1.55–1.65): Fließtext, Aufgabenstellungen.
- **Label** (600/650, 11.5–13px, +0.01em): Navigations-Rubriken und
  Lösungs-Überschriften in natürlicher Schreibweise. Keine wiederholten
  Versal-Eyebrows als Seitenraster.
- **Mono** (500–600, 13–14px): Formeln, Rechenschritte, Ergebnisse —
  mit `overflow-x: auto` auf schmalen Screens, nie umbrechend zerstört.

**Die Drei-Schriften-Regel.** Genau diese drei Familien mit genau diesen
Rollen: Bricolage Grotesque (Display/alles Laute), Inter (Body/UI), JetBrains
Mono (nur Mathe). Keine vierte Schrift. Alle Überschriften und großen Zahlen
(Countdown, Fortschritt, Aufgaben-Nummern) tragen Bricolage. Zahlen in Zählern
immer `font-variant-numeric: tabular-nums`.

## 4. Elevation

Flach im Ruhezustand: Struktur entsteht durch 1-px-Linien (`--line`) und
Flächenabstufung (Canvas → Fläche), nicht durch Schatten. Schatten sind
neutral schwarz, extrem weich und erscheinen als *Antwort* —
auf Hover, auf Öffnen, auf Überlagerung.

### Shadow Vocabulary
- **Control** (`--shadow-control`): ausschließlich ausgewählte Tabs und
  Segment-Controls.
- **Kartenantwort** (`--shadow-card-hover`): klickbare Karten auf Hover oder
  geöffnete Akkordeons.
- **Overlay** (`--shadow-panel`): Modals, Player und Schubladen über einem
  neutral schwarzen Scrim.

**Die Antwort-Regel.** Kein Schatten ohne Anlass: Flächen sind flach, bis
der Nutzer mit ihnen spricht (Hover, Fokus, Öffnen). Wenn ein ruhender Screen
nach 2014-App aussieht, ist ein Schatten zu dunkel oder zu klein.

## 5. Components

### Buttons
- **Form:** kantig, Control-Radius (8px), 13px 24px Padding, 600er Gewicht,
  −0.012em. **Keine Pillen** — die vollrunde Pille ist das klassische
  SaaS-/KI-Template-Signal und deshalb verboten (Marken-Sprint).
- **Primär:** echtes Schwarz (#050505) mit weißem Text; im Dark Mode
  invertiert (#F8F8F9 mit schwarzem Text). Genau EIN Primär-Button pro Screen.
  Orange ist als Button-Farbe verboten.
- **Hover:** Aufhellen auf #1A1A1C + `translateY(-1px)` + weicher Schatten.
  **Active:** `translateY(0) scale(.98)` — jeder Button quittiert den Druck.
  **Focus:** `outline: 2px solid var(--accent); outline-offset: 2px`.
  **Disabled:** Opacity .5, keine Transforms.
- **Light (sekundär):** transparent mit 1px `--ink`-Rand; kehrt beim Hover um
  (Schwarz füllt, Text wird weiß) — editoriales Detail statt SaaS-Glow.
- **Zweite Aktion oft als Text-Link mit Pfeil** (`.gf-arrow`) statt zweitem
  Button — der Pfeil wandert beim Hover 4px nach rechts.
- **Light (sekundär):** weiße Fläche, 1px `--line-strong`-Rand; Hover hebt
  und färbt den Rand auf `--faint`.
- **Klein (`sm`):** 9px 16px, 13.5px.
- Übergänge: 160ms `cubic-bezier(.2,.7,.3,1)`, nur transform/box-shadow/
  border-color/background/color — niemals `transition: all`.

### Chips (Aktionsleisten)
- **Aktiv** („Video ansehen", „KI fragen"): 8px-Control, weiße Fläche, 1px Rand,
  13px/500, Icon 14px; Hover: Rand `--faint` + `translateY(-1px)`.
- **Bald** („Tutor · bald", „Video folgt"): gleiche Geometrie, aber
  `border-style: dashed`, Text `--faint`, `cursor: default`, kein Hover-Lift.
  Ehrlichkeit hat eine eigene Optik — Attrappen sind verboten.
- **Status-Segment** (Verstanden / Wiederholen / Noch unklar): 8px-Gruppe
  auf neutraler Fläche; aktiver Zustand farbcodiert (Grün-Zart / Grapefruit-Zart /
  Control) mit passendem Textton.

### Cards / Containers
- **Ecken:** genau drei Stufen: 8px Controls, 14px Karten, 18px schwebende
  Panels und Navigation. Pillen ausschließlich für Status und kreisnahe
  Geometrien. Keine Zwischenwerte erfinden.
- **Grund:** `--surface` auf `--canvas`; Ränder 1px `--line`.
- **Hover (klickbare Karten):** Rand → `--line-strong`, `translateY(-1px)`,
  `--shadow-card-hover`; 180ms Haus-Easing.
- **Akkordeon (Aufgaben):** offener Zustand bekommt Randverstärkung + weichen
  Schatten; Inhalt erscheint mit `reveal` (220–240ms, 7px Anheben), ohne
  gestaffelte Kaskade.
- **Innen-Padding:** 20px (17px Kopfzeilen, 15px mobil).

### Inputs / Fields
- **Form:** 8px Radius, 1px `--line-strong`-Rand, weiße Fläche,
  12px 15px Padding, 15px Text. Label darüber (13px/600, `--muted`) —
  **niemals Placeholder als Beschriftung**; Hinweise als Zeile unter dem Feld.
- **Hover:** Rand `--faint`. **Focus:** Rand `--ink` + 3px `--control`-Ring
  (`box-shadow: 0 0 0 3px`). **Fehler/Info:** eigene weiche Flächen
  (`--danger-soft` / `--green-soft`) mit 8px Radius.

### Icons
- Alle funktionalen Icons liegen auf einem 24×24-Raster, nutzen standardmäßig
  2px Strichstärke, runde Enden und runde Ecken.
- Die Perspektive ist frontal und ruhig. Füllungen zeigen nur einen echten
  Zustand, zum Beispiel „gespeichert" oder „abgeschlossen".
- Navigation und globale Aktionen verwenden die gemeinsamen Glyphen aus
  `UiIcons.tsx`; keine lokal neu gezeichneten Varianten derselben Funktion.
- Das Grapefruit-Markenzeichen ist die einzige geometrische Ausnahme. Google
  darf als Drittanbieter seine eigene Markenform behalten.
- Icons erklären oder verstärken eine Aktion. Sie werden nie als zufällige
  Dekoration oder als buntes Feature-Raster eingesetzt.

### Navigation
- **Sidebar:** immer echtes Schwarz, 258px, Themen mit einheitlichem
  Grapefruit-Punkt, aktiver Eintrag als leise Grapefruit-Tönung; Untermenü
  (Zusammenfassung/Übungen) im aktiven
  Thema dauerhaft offen, sonst per Hover. ≤900px: fixierte Schublade,
  `translateX(-100%) → 0` in 280ms `cubic-bezier(.2,.8,.2,1)` über
  `body.navopen`, mit Scrim.
- **Topbar:** schwebendes 18px-Panel, `--glass-strong` +
  `backdrop-filter: blur(20px)`, feine Kontur; Brotkrumen 13px; Avatar als
  Grapefruit-Kreis.

### GrapefruitProgress (Signature)
Die Fortschrittsanzeige der Plattform (`Logo.tsx`) verwendet exakt dieselbe
monochrome Segmentgeometrie wie `BrandMark`, Favicon und App-Icon. Der
  Grapefruit-Akzent (#F26B4A) zeichnet Kontur, Segmentlinien, Mittelpunkt und
  Blatt. Ein Tonwert derselben Farbe füllt sich als Kreissektor ab 12 Uhr
  proportional. Dadurch bleibt die Markenform in jedem Fortschrittsstand klar.
Einsatzorte: Dashboard-Gesamtfortschritt (116px), Themenzeilen (40px),
Sidebar-Kurskarte (38px), Themenseiten (26px),
Leerzustände (56px). **Fortschritt wird ausschließlich so erzählt** — keine
Ringe, keine Prozent-Balken-Batterien, keine Konfetti-Momente. Auf dunklem
Grund werden `rind` und `flesh` als Props auf die neutralen Sidebar-Töne gestellt.

### Reel-Bühne (Signature)
Der Reel-Modus (`/feed`) ist IMMER tiefschwarz (#050505), unabhängig vom Theme:
volle Video-Bühne, klare Grapefruit-Akzente und weiße Overlays,
Aktions-Leiste rechts (44px runde Buttons, rgba-Weiß mit Blur), Segment-
Fortschritt oben. Scroll-Snap pro Karte (`scroll-snap-type: y mandatory`).
**Dies ist die einzige Gesten-Fläche der Plattform (Register 2, siehe
Overview).** Wer sie ausbaut, folgt den Fluid-Prinzipien: Wisch bleibt am
Finger, Übergänge sind mitten in der Bewegung unterbrechbar und umkehrbar,
ein schneller Flick reicht statt einer starren Wisch-Schwelle (Impuls
projizieren, nicht ab fester Distanz umschalten), Rand-Widerstand statt
harter Stopp. Nie mit festen CSS-Keyframes lösen — Federn/WAAPI, damit die
Bewegung greifbar bleibt.

## 6. Do's and Don'ts

### Do:
- **Do** genau EINE Primäraktion pro Screen setzen — als schwarzer Button; alles
  Sekundäre als Light-Button oder Chip.
- **Do** Fortschritt immer mit `GrapefruitProgress` zeigen (proportional
  gefüllte Frucht), mit Zähler in `tabular-nums` daneben.
- **Do** nur `transform`, `opacity` und Farben animieren; seltene UI-Einstiege
  180–260ms mit 6–7px Anheben (nie aus `scale(0)`), Interaktionen ~160ms
  mit der Haus-Kurve `cubic-bezier(.2,.7,.3,1)`; Ausgang schneller als Eingang.
- **Do** jede Interaktion quittieren: Hover-Lift (−1px), Active-Press
  (`scale(.98)`), sichtbarer `:focus-visible`-Ring (2px Accent, 2px Offset).
- **Do** funktionale Icons aus dem gemeinsamen 24px/2px-System verwenden.
- **Do** Hover-Effekte hinter `@media (hover: hover)` setzen (Touch löst
  sonst falsche Hover-Zustände beim Tippen aus).
- **Do** seltene, bedeutungsvolle Momente mehr Bewegung geben als häufige;
  was hundertfach am Tag passiert, animiert kaum.
- **Do** die Gesten-Fläche Reel-Modus mit Federn/WAAPI bauen — unterbrechbar,
  velocity-bewusst, 1:1 am Finger (Register 2).
- **Do** kommende Funktionen als gestrichelte „· bald"-Chips zeigen — ehrlich,
  ruhig, nicht klickbar.
- **Do** Theme-Farben ausschließlich über CSS-Variablen beziehen; neue
  Farben zuerst in `globals.css` (hell + `body.dark`) definieren.
- **Do** Overlays (Modals, Player) per React-Portal an `document.body`
  rendern — animierte Eltern fangen `position: fixed` sonst ein
  (Sprint-10-Lektion).
- **Do** WCAG AA halten (4.5:1 Text) und `prefers-reduced-motion`
  respektieren (ist global verdrahtet — nicht aushebeln).

### Don't:
- **Don't** Orange als Button- oder Flächenfarbe verwenden — die Grapefruit
  ist Akzent, nicht Anstrich („Eine-Stimme-Regel").
- **Don't** wie eine „klassische Lernplattform" aussehen: keine Konfetti,
  Abzeichen, Maskottchen, Fortschrittsringe oder Gamification-Feuerwerke.
- **Don't** wie ein „Dashboard-SaaS" aussehen: keine Statistik-Kacheln ohne
  Handlung, keine Tabellen-Ästhetik und keine austauschbare Grauflächen-Wand.
- **Don't** wie ein „typisches KI-Produkt" aussehen: keine Lila-Gradients,
  keine Sparkles, keine Emojis im UI — nirgends, auch nicht in Buttons
  oder Toasts.
- **Don't** `width`/`height`/`padding`/`margin` animieren und niemals
  `transition: all` schreiben — Eigenschaften immer benennen.
- **Don't** das eingebaute `ease-in` auf UI verwenden (fühlt sich träge an)
  und nichts aus `scale(0)` einblenden — nichts erscheint aus dem Nichts.
- **Don't** die Gesten-Fläche (Reel-Modus) mit festen CSS-Keyframes bauen —
  die lassen sich nicht mitten im Wisch greifen und starten bei Unterbrechung
  von null.
- **Don't** Placeholder als Feldbeschriftung missbrauchen; Labels stehen
  über dem Feld.
- **Don't** globale CSS-Selektoren auf Modul-Klassen richten
  (`body.dark .topbar` erreicht `styles.topbar` nie) und keine harten
  Hex-Werte in Komponenten (Ausnahmen: die theme-feste Grapefruitfarbe in
  Inhaltsmetadaten sowie die schwarze Reel-Bühne).
- **Don't** neue Radius-, Abstands- oder Breakpoint-Werte erfinden — die
  Skalen oben sind vollständig.
- **Don't** mehr als ~10 % eines Screens mit Akzentfarbe füllen; wenn es
  danach verlangt, die Hierarchie reparieren.
