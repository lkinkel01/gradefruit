---
name: Gradefruit
description: Lernplattform für das Mathe-Abitur Hessen 2027. Weiß, ein Grapefruit-Rot, sonst nichts.
colors:
  canvas: "#F7F7F8"
  surface: "#FFFFFF"
  surface-2: "#F0F0F2"
  ink: "#050505"
  muted: "#5F6067"
  faint: "#6E7078"
  line: "#E6E6E9"
  line-strong: "#D3D3D8"
  control: "#ECECEF"
  accent: "#F0505E"
  accent-d: "#B3263A"
  danger: "#C62828"
  success: "#147A49"
  warn: "#9A6500"
typography:
  display:
    fontFamily: "Cabinet Grotesk, sans-serif"
    fontSize: "clamp(34px, 6.2vw, 62px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Cabinet Grotesk, sans-serif"
    fontSize: "clamp(28px, 4vw, 40px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.028em"
  title:
    fontFamily: "Cabinet Grotesk, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Switzer, -apple-system, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Switzer, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.02em"
rounded:
  control: "8px"
  card: "14px"
  panel: "18px"
  pill: "999px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
  4xl: "96px"
---

# Brandbook Gradefruit

Diese Datei ist verbindlich. Wer hier etwas ändert, ändert es anschließend
auch im Code — und umgekehrt. Steht etwas im Code anders als hier, ist der
Code falsch, nicht dieses Dokument.

---

## 1. Grundhaltung

**Weiß. Ein Grapefruit-Rot. Sonst nichts.**

Gradefruit verkauft Vorbereitung auf eine Prüfung, die über einen
Schulabschluss entscheidet. Die Seite muss deshalb zwei Dinge gleichzeitig
sein: **ruhig genug zum Lernen** und **vertrauenswürdig genug zum Kaufen**.
Alles, was wie ein schnell zusammengeklickter Baukasten aussieht, arbeitet
gegen beides.

Drei Sätze, an denen sich jede Entscheidung messen lässt:

1. **Weiß trägt, Farbe zeigt.** Flächen sind weiß oder fast weiß. Farbe
   erscheint dort, wo etwas passiert.
2. **Eine Sache pro Bildschirm.** Wenn zwei Dinge gleich laut rufen, ruft
   keines.
3. **Nichts behaupten, was nicht stimmt.** Keine erfundenen Zahlen, keine
   Funktionen in der Zukunftsform als Gegenwart, keine Leistungsversprechen
   ohne hinterlegte Regelung.

### Was wir bewusst nicht sind

Frühere Fassung dieser Datei hieß „Schwarz. Weiß. Grapefruit." mit schwarzen
Knöpfen. Das ist überholt: Schwarz als Signalfarbe neben einem roten Akzent
ergab zwei konkurrierende Signale, und schwarze Flächen wirkten hart.
Schwarz ist jetzt ausschließlich Schriftfarbe.

---

## 2. Farben

### Die zwei Rottöne

Es gibt **genau zwei**, inklusive Logo. Jeder weitere Rotton ist ein Fehler.

| Token | Wert | Wofür |
|---|---|---|
| `--accent` | `#F0505E` | Große Schrift, Symbole, Ränder, Fortschritt, Logo-Fruchtfleisch |
| `--accent-d` | `#B3263A` | **Flächen mit weißer Schrift**, Fließtext in Farbe, Logo-Schale (dunkel) |

Alle weiteren Rot-Tönungen werden **abgeleitet**, nie neu gewählt:

```css
--accent-soft:     color-mix(in srgb, var(--accent)  8%, #FFFFFF);
--accent-progress: color-mix(in srgb, var(--accent) 45%, #FFFFFF);
--brand-rind:      color-mix(in srgb, var(--accent) 52%, #FFFFFF);
```

### Die Kontrastregel

Gemessen, nicht geschätzt:

| Kombination | Verhältnis | Erlaubt für |
|---|---|---|
| Weiß auf `#F0505E` | **3,49 : 1** | nur Schrift ab 24px, oder ab 18,66px fett |
| Weiß auf `#B3263A` | **6,45 : 1** | alles |
| `#F0505E` auf Weiß | **3,49 : 1** | nur große Überschriften |
| `#B3263A` auf Weiß | **6,45 : 1** | alles, auch Fließtext |
| `#050505` auf `#F7F7F8` | 19,04 : 1 | Fließtext |
| `#5F6067` auf `#F7F7F8` | 5,85 : 1 | gedämpfter Text |

**Daraus folgt die wichtigste Farbregel des Hauses:**

> Eine gefüllte Fläche mit weißer Schrift benutzt `--accent-d`, niemals
> `--accent`. Das helle Grapefruit ist für Schrift, die groß genug ist, für
> Symbole, Ränder und Dekoration.

Das ist keine Geschmacksfrage. Ab Juni 2025 gilt das
Barrierefreiheitsstärkungsgesetz auch für Online-Handel; ein Kurs, den man
online kauft, fällt darunter. 3,49 : 1 auf einem Kaufknopf wäre angreifbar.

### Neutrale

| Token | Wert | Wofür |
|---|---|---|
| `--canvas` | `#F7F7F8` | Seitengrund |
| `--surface` | `#FFFFFF` | Karten, Leisten, erhöhte Flächen |
| `--surface-2` | `#F0F0F2` | zurückgesetzte Flächen |
| `--ink` | `#050505` | Schrift |
| `--muted` | `#5F6067` | zweitrangige Schrift |
| `--faint` | `#6E7078` | Beschriftungen, Zeitangaben |
| `--line` | `#E6E6E9` | Trennlinien |
| `--line-strong` | `#D3D3D8` | Ränder von Bedienelementen |

### Statusfarben

`--danger` `#C62828`, `--success` `#147A49`, `--warn` `#9A6500`.

Diese drei **dürfen** sich von der Markenfarbe unterscheiden — ein Fehler
muss als Fehler lesbar sein und nicht als Markenauftritt. Sie erscheinen
ausschließlich in der Lernoberfläche, nie auf den Marketing-Seiten.

### Der Schimmer

Statt flächiger Farbe gibt es einen sehr schwachen Verlauf, abgelegt als
`--gf-schimmer`. Flächen wechseln sich ab: eine mit Schimmer, die nächste
schlicht weiß. **Der Rhythmus entsteht aus dem Wechsel, nicht aus
Farbstärke.** Im dunklen Modus etwa halb so stark, weil derselbe Wert auf
Schwarz sofort wie ein Fleck wirkt.

---

## 3. Schrift

| Rolle | Schrift | Schnitte |
|---|---|---|
| Überschriften | **Cabinet Grotesk** | 700, 800, 900 |
| Fließtext, Bedienelemente | **Switzer** | 400, 500, 600, 700 |
| Zahlen in Tabellen | JetBrains Mono | 500, 600 |

Beide von Fontshare, kommerziell frei nutzbar, keine Kosten.

### Zwei Regeln, die schon einmal Zeit gekostet haben

1. **Nur geladene Schnitte benutzen.** Cabinet Grotesk hat kein 650 und kein
   750. Fordert das CSS so etwas an, verfettet der Browser die Schrift
   künstlich, und das sieht billig aus. Erlaubt sind 700, 800, 900 — mehr
   nicht.
2. **Schriften gehören in den Dokumentkopf, nicht in `@import`.** Die
   Fontshare-Adresse enthält eckige Klammern und ein `@`; der CSS-Parser
   verwirft solche Zeilen **stillschweigend**. Es erscheint kein Fehler, die
   Schriften fehlen einfach. Außerdem: **eine Adresse je Familie** — bei
   einer kombinierten liefert Fontshare nur die erste aus.

### Größenskala

| Rolle | Größe | Schnitt | Zeilenhöhe |
|---|---|---|---|
| Display | `clamp(34px, 6.2vw, 62px)` | 800 | 1,04 |
| Überschrift | `clamp(28px, 4vw, 40px)` | 800 | 1,1 |
| Titel | 17px | 700 | 1,35 |
| Fließtext | 15,5px | 400 | 1,6 |
| Klein | 13,5px | 500 | 1,5 |
| Beschriftung | 12px | 600 | 1,4 |

Laufweite: Überschriften −0,028em bis −0,035em, Fließtext 0.

**Gesperrte Versalien** (`letter-spacing: .15em`, `text-transform: uppercase`)
nur noch für einzelne Beschriftungen, nie für Überschriften oder Knöpfe. Sie
waren eines der Dinge, die nach Baukasten aussahen.

---

## 4. Abstände

Eine Skala, keine frei gewählten Zahlen:

```
2xs  4px    xs  8px    sm  12px   md  16px
lg  24px    xl 32px    2xl 48px   3xl 64px   4xl 96px
```

Im Code als `--raum-xs` bis `--raum-4xl`. **Neue Abstände kommen
ausschließlich aus dieser Liste.** Wer einen Zwischenwert braucht, hat
meistens ein anderes Problem.

- Zwischen Beschriftung und Wert: `xs`
- Innerhalb einer Karte: `lg`
- Zwischen Karten: `lg`
- Zwischen Abschnitten eines Bandes: `xl`
- **Bänder:** oben `clamp(72px, 10vh, 112px)`, unten
  `clamp(56px, 8vh, 88px)`

> Unten weniger als oben. Der Knopf am Ende eines Bandes bringt seinen
> eigenen Abstand mit; mit gleichem Wert oben und unten klafft eine Lücke
> zum nächsten Band.

---

## 5. Radien, Schatten, Bewegung

**Radien:** `control 8px`, `card 14px`, `panel 18px`, `pill 999px`.
Pillen nur für Knöpfe, Schalter und die schwebende Kopfleiste.

**Schatten** sind weich und sparsam. Verboten ist der **farbige Schein**
unter Knöpfen (`box-shadow` in der Akzentfarbe) — das ist das deutlichste
Erkennungszeichen schnell zusammengeklickter Seiten.

**Bewegung:** nur `transform`, `opacity` und Farben. Nie `transition: all`.
`ease-in` ist verboten.

```
--dur-press  140ms    --dur-hover  180ms    --dur-enter  240ms
--ease-out   cubic-bezier(0.22, 1, 0.36, 1)
```

Versatz beim Einblenden: höchstens 8px. Mehr wirkt wie eine Präsentation.
Alles respektiert `prefers-reduced-motion`.

---

## 6. Komponenten

### Knöpfe

| Art | Fläche | Schrift | Wofür |
|---|---|---|---|
| Haupt | `--accent-d` | weiß | genau einer je Bildschirm |
| Umriss | transparent, 1,5px `--accent` | `--accent-d` | zweite Wahl |
| Still | transparent | `--muted` | Nebensachen |

**Kein Knopf färbt sich beim Überfahren schwarz.** Der Umrissknopf füllt sich
mit `--accent`, der Hauptknopf wird dunkler.

### Karten

Weiß, Radius 14px, 1px `--line`, Schatten nur beim Überfahren. Innenabstand
`lg`.

### Kopfleiste

Schwebende Pille mit Abstand zu allen Rändern. **Am Seitenanfang ohne jede
Fläche** — kein Rahmen, kein Schatten. Nach acht Pixeln Scrollweg wird sie
zu Mattglas. Auf dem Handy verschwindet sie beim Scrollen ganz, übrig
bleiben die drei Striche.

### Bänder

Jeder Abschnitt ist ein Band: Überschrift, eine Zeile, dann der Beleg.
**Keine gesperrte Bezeichnung darüber** — sie wiederholte nur die
Überschrift.

---

## 7. Do's and Don'ts

### Das macht eine Seite sofort unecht

- Farbiger Schein unter Knöpfen
- Gesperrte Versalien als Überschrift
- Inter als Fließtext, Bricolage als Überschrift
- Erfundene Zahlen („20.000+ Nutzer")
- Schwarze Flächen als Signalfarbe neben einem farbigen Akzent
- Mehr als zwei Töne derselben Farbfamilie
- Kreisende Symbol-Räder um ein Logo
- Gezeichnete Attrappen statt echter Produktbilder

### Das macht sie glaubwürdig

- Echte Aufnahmen aus dem Produkt (`scripts/produktbilder.mjs`)
- Zahlen, die nachgezählt sind, oder gar keine
- Ein Gesicht auf „Über uns"
- Funktionen, die es gibt — alles andere gar nicht erwähnen
- Viel Weißraum und ein einziger farbiger Punkt je Bildschirm

### Bilder

Echte Fotos, scharf, hell, aufgeräumt. Keine Geräte-Attrappen mit leerem
Bildschirm. Herkunft und Lizenz **jedes** Bildes gehören in
`public/BILDNACHWEIS.md` — lizenzfrei heißt nicht herkunftslos.

---

## 8. Dunkler Modus

Umgeschaltet über `body.dark`, das die Variablen überschreibt. Zwei Regeln:

1. **Nie globale Selektoren auf CSS-Modul-Klassen richten** — deren Namen
   sind im Erzeugnis Hashes. Themenwerte als Variable durchreichen.
2. **Farbwerte nicht einfach übernehmen.** Derselbe Schimmer, der auf Weiß
   zart wirkt, ist auf Schwarz ein Fleck. Im dunklen Modus etwa halbe
   Stärke.

Die Seitenleiste der Lernoberfläche folgt dem Thema. Die frühere Regel
„immer echtes Schwarz" ist aufgehoben: Sie stellte im hellen Modus einen
harten schwarzen Block neben eine weiße Lernfläche.
