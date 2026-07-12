---
name: Gradefruit
description: Premium-Lernplattform für das Mathe-Abitur Hessen 2027 — warmes Papier, Tinte, eine Grapefruit.
colors:
  paper: "#FAF6F1"
  surface: "#FFFFFF"
  surface-warm: "#FBF7F2"
  ink: "#211C17"
  muted: "#6F675E"
  faint: "#A69B90"
  line: "#EDE4DB"
  line-strong: "#DDD1C5"
  control: "#F0E8E0"
  grapefruit: "#E96A4C"
  grapefruit-deep: "#C24E31"
  grapefruit-soft: "#FBEBE3"
  fruit-flesh: "#EE7457"
  leaf-green: "#5E9E77"
  success-green: "#2F9E68"
  topic-analysis: "#DE5D43"
  topic-linalg: "#5D6BC9"
  topic-stochastik: "#2F9E68"
  side-espresso: "#1C1613"
  side-espresso-2: "#29211B"
  side-espresso-3: "#382D25"
  side-text: "#D6CBC1"
  dark-canvas: "#171310"
  dark-surface: "#201B16"
  dark-ink: "#F5F0EA"
typography:
  display:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "clamp(40px, 6.4vw, 68px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.022em"
  title:
    fontFamily: "Schibsted Grotesk, sans-serif"
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
  pill: "980px"
  lg: "18px"
  md: "16px"
  sm: "12px"
  xs: "10px"
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
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "#33291F"
  button-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  chip-action:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 13px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 15px"
---

# Design System: Gradefruit

## 1. Overview

**Creative North Star: „Frucht auf Papier"**

Gradefruit sieht aus wie Tinte auf warmem Papier — und mittendrin lebt eine
Frucht. Die Fläche ist ruhiges Papier-Beige (nie klinisches Weiß, nie
SaaS-Grau), die Schrift ist warmes Tinten-Schwarz, und die einzige laute
Stimme im Raum ist die Grapefruit: als Logo, als Fortschritt, als Akzent.
Alles andere hält sich zurück, damit diese eine Stimme trägt. Das System
verweigert sich ausdrücklich der „klassischen Lernplattform", dem
„Dashboard-SaaS" und dem „typischen KI-Produkt" (siehe PRODUCT.md,
Anti-references) — es orientiert sich an Apple (Zurückhaltung, Hierarchie),
Nike (Selbstbewusstsein) und Peso/LFDY (reduzierte Street-Ästhetik der
Zielgruppe).

Bewegung ist Feedback, nie Dekoration. Sie läuft in **zwei Registern**, und
wer sie verwechselt, baut sie falsch:

*Register 1 — Zustandsübergänge* (99 % des Produkts: Hover, Öffnen,
Einblenden, Tab-Wechsel). CSS-Transitions, 150–350 ms, ausschließlich
`transform`/`opacity`/Farbe. Einstiege heben 6–7 px an und faden ein —
nie aus `scale(0)`, nichts erscheint aus dem Nichts. Ausgang schneller als
Eingang (der Nutzer entscheidet langsam, das System antwortet schnell).
Gestaffelte Listen 45–50 ms Versatz. Interaktionen quittieren sofort
(Hover −1 px, Active `scale(.97–.98)`). Eigene Kurven statt der schwachen
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
CSS-Variablen unter `body.dark` (warmes Dunkelbraun, nie Blau-Schwarz).
Komponenten verwenden Variablen, niemals harte Theme-Farben — und globale
Selektoren auf CSS-Modul-Klassen sind verboten (sie greifen wegen der
Namens-Hashes nie; das war der Topbar-Bug aus Sprint 10).

**Die Breakpoint-Regel.** Es gibt genau drei Schwellen: ≤900 px (Sidebar
wird zur Schublade über `body.navopen`), ≤760/820 px (mehrspaltige Raster
stapeln), ≤560 px (kompakte Abstände, Seiten-Padding 18 px). Keine weiteren
Magic-Breakpoints erfinden.

**Key Characteristics:**
- Warmes Papier + Tinte statt Weiß + Grau; eine Akzentfarbe, sparsam gesetzt
- Grapefruit = Marke = Fortschrittsanzeige (ein Symbol, eine Bedeutung)
- Pillen-Buttons in Tinten-Schwarz; Orange gehört der Frucht, nicht den Buttons
- Karten mit feinen Linien statt Schatten; Tiefe nur als Antwort auf Interaktion
- Ruhige, schnelle Motion (150–350 ms, ease-out, transform/opacity)
- Keine Emojis im UI, nirgends

## 2. Colors

Eine warme, natürliche Palette: Papier statt Klinik, Grapefruit statt
Signalrot — alle Werte leben als CSS-Variablen in `src/app/globals.css`.

### Primary
- **Grapefruit** (#E96A4C): DIE Markenfarbe. Fortschritts-Akzente, Avatar,
  aktive Zustände des Wiederholen-Status, kleine Highlights. Nie großflächig.
- **Grapefruit Tief** (#C24E31): Text-Variante des Akzents auf hellem Grund
  (Links, Hover-Text), im Dark Mode heller (#FF8D6B) via `--accent-d`.
- **Fruchtfleisch** (#EE7457): exklusiv für das Innere der Grapefruit-Grafiken
  (`Logo.tsx`, `GrapefruitProgress`). Bewusst hartkodiert — die Frucht sieht
  in beiden Themes gleich aus.
- **Grapefruit Zart** (#FBEBE3): Selektion, weiche Hintergründe für aktive
  Akzent-Zustände.

**Die Eine-Stimme-Regel.** Orange erscheint auf maximal ~10 % eines Screens.
Primäraktionen sind Tinte, nicht Orange — die Seltenheit macht die Frucht
wertvoll. Wenn ein Screen nach mehr Orange verlangt, ist die Hierarchie
kaputt, nicht die Palette zu klein.

### Secondary
- **Analysis-Terrakotta** (#DE5D43), **LinAlg-Indigo** (#5D6BC9),
  **Stochastik-Grün** (#2F9E68): die drei Themenfarben — gedeckt, nie
  neonhaft. Einsatz nur als Kennung (Punkte, Aufgaben-Nummern, dünne
  Akzentlinien, Feed-Bühnen-Glow), nie als Flächen- oder Button-Farbe.

### Neutral
- **Papier** (#FAF6F1): der Seitengrund (`--canvas`). Dark: #171310.
- **Fläche** (#FFFFFF): Karten und Controls (`--surface`). Dark: #201B16.
- **Warme Fläche** (#FBF7F2): Sekundärflächen, Segment-Hintergründe. Dark: #29221C.
- **Tinte** (#211C17): Text und Primär-Buttons (`--ink`). Dark: #F5F0EA
  (Buttons invertieren im Dark Mode zu hell — Apple-artig).
- **Gedämpft** (#6F675E) / **Blass** (#A69B90): Sekundär-/Tertiärtext.
- **Linie** (#EDE4DB) / **Linie stark** (#DDD1C5): Ränder, Trenner.
- **Espresso-Familie** (#1C1613 / #29211B / #382D25 + Text #D6CBC1): die
  immer-dunkle Sidebar — sie wechselt NICHT mit dem Theme.
- **Milchglas** (`--glass`, rgba(250,246,241,.86) bzw. dunkel .86): obere
  Leisten mit `backdrop-filter: blur(14–16px)`.

## 3. Typography

**Display Font:** Schibsted Grotesk (sans-serif)
**Body Font:** Inter (mit -apple-system-Fallback)
**Mono Font:** JetBrains Mono — ausschließlich für Mathe (Formeln, Schritte, Ergebnisse)

**Charakter:** Selbstbewusste, eng gespannte Grotesk für alles Laute; ein
neutraler, gut lesbarer Text-Font für alles Leise; Mono als „Tafel" für
Mathematik. Headlines dürfen groß und knapp sein (Nike-Ton), Fließtext bleibt
zurückhaltend.

### Hierarchy
- **Display** (800, clamp(40–68px), 1.04, −0.035em): nur Landing-Hero.
- **Headline** (800, 30px, −0.022em): Seiten-H1 in der App (25px ≤560px).
- **Title** (700, 14.5–20px, −0.01em): Karten- und Abschnittstitel.
- **Body** (400/450, 13.5–15.5px, 1.55–1.65): Fließtext, Aufgabenstellungen.
- **Label** (600, 10.5–13px, +0.05–0.08em, UPPERCASE): Navigations-Rubriken,
  Lösungs-Überschriften („SCHRITT-FÜR-SCHRITT-LÖSUNG").
- **Mono** (500–600, 13–14px): Formeln, Rechenschritte, Ergebnisse —
  mit `overflow-x: auto` auf schmalen Screens, nie umbrechend zerstört.

**Die Zwei-Schriften-Regel.** Es gibt genau diese drei Familien mit genau
diesen Rollen. Keine neue Schrift ohne bewusste Marken-Entscheidung (Kandidat
für später: Inter durch eine eigenständigere Textschrift ersetzen — Schibsted
bleibt gesetzt). Zahlen in Zählern immer `font-variant-numeric: tabular-nums`.

## 4. Elevation

Flach im Ruhezustand: Struktur entsteht durch 1-px-Linien (`--line`) und
Flächenabstufung (Papier → Fläche), nicht durch Schatten. Schatten sind warm
getönt (Braun, nie Schwarz-Blau), extrem weich und erscheinen als *Antwort* —
auf Hover, auf Öffnen, auf Überlagerung.

### Shadow Vocabulary
- **Ruhe/Karte** (`--shadow`: 0 1px 2px rgba(60,40,25,.03), 0 6px 20px rgba(60,40,25,.05)): Grundschatten größerer Karten.
- **Angehoben** (`--shadow-lg`: 0 2px 4px rgba(60,40,25,.04), 0 18px 44px rgba(60,40,25,.09)): Hover großer Karten.
- **Button-Primär** (0 1px 2px rgba(30,22,15,.14), 0 8px 22px rgba(30,22,15,.12)): Tinten-Button; verstärkt sich beim Hover.
- **Overlay** (0 24px 70px rgba(20,15,30,.34)): Modals/Player über abgedunkeltem, geblurrtem Scrim.

**Die Antwort-Regel.** Kein Schatten ohne Anlass: Flächen sind flach, bis
der Nutzer mit ihnen spricht (Hover, Fokus, Öffnen). Wenn ein ruhender Screen
nach 2014-App aussieht, ist ein Schatten zu dunkel oder zu klein.

## 5. Components

### Buttons
- **Form:** Pille (980px Radius), 12px 22px Padding, 600er Gewicht, −0.01em.
- **Primär:** Tinte auf Papier — #211C17 mit weißem Text; im Dark Mode
  invertiert (#F5F0EA mit dunklem Text). Genau EIN Primär-Button pro Screen.
  Orange ist als Button-Farbe verboten.
- **Hover:** Aufhellen auf #33291F + `translateY(-1px)` + stärkerer Schatten.
  **Active:** `translateY(0) scale(.98)` — jeder Button quittiert den Druck.
  **Focus:** `outline: 2px solid var(--accent); outline-offset: 2px`.
  **Disabled:** Opacity .5, keine Transforms.
- **Light (sekundär):** weiße Fläche, 1px `--line-strong`-Rand; Hover hebt
  und färbt den Rand auf `--faint`.
- **Klein (`sm`):** 9px 16px, 13.5px.
- Übergänge: 160ms `cubic-bezier(.2,.7,.3,1)`, nur transform/box-shadow/
  border-color/background/color — niemals `transition: all`.

### Chips (Aktionsleisten)
- **Aktiv** („Video ansehen", „KI fragen"): Pille, weiße Fläche, 1px Rand,
  13px/500, Icon 14px; Hover: Rand `--faint` + `translateY(-1px)`.
- **Bald** („Tutor · bald", „Video folgt"): gleiche Geometrie, aber
  `border-style: dashed`, Text `--faint`, `cursor: default`, kein Hover-Lift.
  Ehrlichkeit hat eine eigene Optik — Attrappen sind verboten.
- **Status-Segment** (Verstanden / Wiederholen / Noch unklar): Pillen-Gruppe
  auf warmer Fläche; aktiver Zustand farbcodiert (Grün-Zart / Grapefruit-Zart /
  Control) mit passendem Textton.

### Cards / Containers
- **Ecken:** 18px (Lernkarten, Feature-Karten), 16px (`--radius`, Standard),
  13px (Sidebar-Karten).
- **Grund:** `--surface` auf `--canvas`; Ränder 1px `--line`.
- **Hover (klickbare Karten):** Rand → `--line-strong`, `translateY(-1px
  bis -2px)`, `--shadow`; 180ms ease.
- **Akkordeon (Aufgaben):** offener Zustand bekommt Randverstärkung + weichen
  Schatten; Inhalt erscheint mit `reveal` (280ms, 7px Anheben, Lösungs-
  Schritte gestaffelt mit 50ms Delay).
- **Innen-Padding:** 20px (17px Kopfzeilen, 15px mobil).

### Inputs / Fields
- **Form:** 12px Radius, 1.5px `--line-strong`-Rand, weiße Fläche,
  12px 15px Padding, 15px Text. Label darüber (13px/600, `--muted`) —
  **niemals Placeholder als Beschriftung**; Hinweise als Zeile unter dem Feld.
- **Hover:** Rand `--faint`. **Focus:** Rand `--ink` + 3px `--control`-Ring
  (`box-shadow: 0 0 0 3px`). **Fehler/Info:** eigene weiche Flächen
  (`--danger-soft` / `--green-soft`) mit 10px Radius.

### Navigation
- **Sidebar:** immer dunkel (Espresso-Familie), 258px, Themen mit Farbpunkt,
  aktiver Eintrag auf #382D25; Untermenü (Zusammenfassung/Übungen) im aktiven
  Thema dauerhaft offen, sonst per Hover. ≤900px: fixierte Schublade,
  `translateX(-100%) → 0` in 280ms `cubic-bezier(.2,.8,.2,1)` über
  `body.navopen`, mit Scrim.
- **Topbar:** 58px, `--glass` + `backdrop-filter: blur(14px)`, 1px Linie
  unten; Brotkrumen 13.5px; Avatar als Grapefruit-Kreis.

### GrapefruitProgress (Signature)
Die Fortschrittsanzeige der Plattform (`Logo.tsx`): flache Frucht-Scheibe,
deren Fruchtfleisch (#EE7457) sich als Kreissektor ab 12 Uhr exakt
proportional füllt, darüber ruhige Segmentlinien, optional das Blatt
(#5E9E77). Einsatzorte: Dashboard-Gesamtfortschritt (84px), Themenzeilen
(34px), Sidebar-Kurskarte (38px, Espresso-Töne), Themenseiten (26px),
Leerzustände (56px). **Fortschritt wird ausschließlich so erzählt** — keine
Ringe, keine Prozent-Balken-Batterien, keine Konfetti-Momente. Auf dunklem
Grund werden `rind`/`flesh`/`gap` als Props auf die Espresso-Töne gestellt.

### Reel-Bühne (Signature)
Der Reel-Modus (`/feed`) ist IMMER dunkel (#141110), unabhängig vom Theme:
volle Video-Bühne mit thematisch gefärbtem Radial-Glow, weiße Overlays,
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
- **Do** genau EINE Primäraktion pro Screen setzen — als Tinten-Pille; alles
  Sekundäre als Light-Button oder Chip.
- **Do** Fortschritt immer mit `GrapefruitProgress` zeigen (proportional
  gefüllte Frucht), mit Zähler in `tabular-nums` daneben.
- **Do** nur `transform`, `opacity` und Farben animieren; Einstiege 260–350ms
  mit 6–7px Anheben (ab `scale(.95)` + Opacity, nie aus `scale(0)`),
  Interaktionen ~160ms mit der Haus-Kurve `cubic-bezier(.2,.7,.3,1)`;
  gestaffelte Listen mit 45–50ms Delay; Ausgang schneller als Eingang.
- **Do** jede Interaktion quittieren: Hover-Lift (−1px), Active-Press
  (scale .97–.98), sichtbarer `:focus-visible`-Ring (2px Accent, 2px Offset).
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
  Handlung, keine Tabellen-Ästhetik, kein kühles Grau (#F3F3F7 ist verboten —
  Papier ist #FAF6F1).
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
  Hex-Werte in Komponenten (Ausnahmen: Fruchtfleisch #EE7457, Themenfarben,
  Reel-Bühne #141110 — die sind bewusst theme-fest).
- **Don't** neue Radius-, Abstands- oder Breakpoint-Werte erfinden — die
  Skalen oben sind vollständig.
- **Don't** mehr als ~10 % eines Screens mit Akzentfarbe füllen; wenn es
  danach verlangt, die Hierarchie reparieren.
