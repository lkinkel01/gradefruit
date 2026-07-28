// 22 originale Übungsaufgaben "Analysis" auf LEISTUNGSKURS-Niveau (Mathe-Abi Hessen).
// Selbst formuliert – NICHT aus echten Klausuren kopiert.
// Schwerpunkte: e-/ln-Funktionen, Produkt-/Ketten-/Quotientenregel, Integrale, Rotationsvolumen, Funktionenscharen.

export interface AnalysisLkTask {
  id: string;
  tag: string;
  src: string;
  q: string;
  steps: { label: string; math: string }[];
  result: string;
  mistakes: string[];
  locked: boolean;
}

export const ANALYSIS_LK_TASKS: AnalysisLkTask[] = [
  {
    id: "la1",
    tag: "Produktregel (e-Funktion)",
    src: "Original-Übung · LK-Stil A1",
    q: "Bilden Sie die erste Ableitung von f mit f(x) = x² · e^x.",
    steps: [
      { label: "Produktregel ansetzen", math: "u = x²,  v = e^x  →  u' = 2x,  v' = e^x" },
      { label: "Formel u'v + uv'", math: "f'(x) = 2x · e^x + x² · e^x" },
      { label: "e^x ausklammern", math: "f'(x) = e^x · (x² + 2x)" },
    ],
    result: "f'(x) = e^x · (x² + 2x)",
    mistakes: [
      "e^x falsch ableiten – die Ableitung von e^x ist wieder e^x, nicht x · e^(x−1).",
      "Die Produktregel vergessen und nur einen der beiden Summanden hinschreiben.",
    ],
    locked: false,
  },
  {
    id: "la2",
    tag: "Kettenregel",
    src: "Original-Übung · LK-Stil A2",
    q: "Bilden Sie die Ableitung von f mit f(x) = e^(−x²).",
    steps: [
      { label: "Äußere und innere Funktion", math: "äußere: e^u,  innere: u = −x²" },
      { label: "Ableitungen", math: "(e^u)' = e^u,  u' = −2x" },
      { label: "Kettenregel: äußere · innere", math: "f'(x) = e^(−x²) · (−2x)" },
    ],
    result: "f'(x) = −2x · e^(−x²)",
    mistakes: [
      "Die innere Ableitung (−2x) vergessen und nur e^(−x²) hinschreiben.",
      "Das Vorzeichen der inneren Ableitung falsch setzen: aus −x² wird −2x, nicht +2x.",
    ],
    locked: false,
  },
  {
    id: "la3",
    tag: "Quotientenregel",
    src: "Original-Übung · LK-Stil A3",
    q: "Bilden Sie die Ableitung von f mit f(x) = x / (x² + 1).",
    steps: [
      { label: "Quotientenregel ansetzen", math: "u = x,  v = x² + 1  →  u' = 1,  v' = 2x" },
      { label: "Formel (u'v − uv') / v²", math: "f'(x) = [1·(x²+1) − x·2x] / (x²+1)²" },
      { label: "Zähler zusammenfassen", math: "= (x² + 1 − 2x²) / (x²+1)² = (1 − x²) / (x²+1)²" },
    ],
    result: "f'(x) = (1 − x²) / (x² + 1)²",
    mistakes: [
      "Den Zähler der Quotientenregel vertauschen: richtig ist u'v − uv', nicht uv' − u'v.",
      "Den Nenner nicht quadrieren – unter dem Bruchstrich steht v², also (x²+1)².",
    ],
    locked: false,
  },
  {
    id: "la4",
    tag: "Ableitung mit ln",
    src: "Original-Übung · LK-Stil A4",
    q: "Bilden Sie die Ableitung von f mit f(x) = x · ln(x).",
    steps: [
      { label: "Produktregel", math: "u = x,  v = ln(x)  →  u' = 1,  v' = 1/x" },
      { label: "Formel u'v + uv'", math: "f'(x) = 1 · ln(x) + x · (1/x)" },
      { label: "Vereinfachen", math: "f'(x) = ln(x) + 1" },
    ],
    result: "f'(x) = ln(x) + 1",
    mistakes: [
      "Die Ableitung von ln(x) = 1/x vergessen oder als ln-Term stehen lassen.",
      "Die Produktregel vergessen und nur ln(x) oder nur 1 angeben.",
    ],
    locked: false,
  },
  {
    id: "la5",
    tag: "Extrempunkte (e-Funktion)",
    src: "Original-Übung · LK-Stil A5",
    q: "Bestimmen Sie die Extrempunkte von f mit f(x) = x² · e^(−x).",
    steps: [
      { label: "Ableitung (Produktregel)", math: "f'(x) = 2x·e^(−x) − x²·e^(−x) = e^(−x)·(2x − x²)" },
      { label: "Notwendige Bedingung", math: "e^(−x)·x·(2 − x) = 0  →  x = 0 oder x = 2  (e^(−x) ≠ 0)" },
      { label: "Zweite Ableitung", math: "f''(x) = e^(−x)·(x² − 4x + 2)" },
      { label: "Art bei x = 0", math: "f''(0) = 2 > 0  →  Tiefpunkt;  f(0) = 0" },
      { label: "Art bei x = 2", math: "f''(2) = e^(−2)·(−2) < 0  →  Hochpunkt;  f(2) = 4/e² ≈ 0,54" },
    ],
    result: "TP(0 | 0),  HP(2 | 4/e² ≈ 0,54)",
    mistakes: [
      "e^(−x) = 0 setzen – die e-Funktion wird nie null, die Nullstellen kommen nur aus x·(2 − x).",
      "Bei der Produktregel das Minuszeichen aus der inneren Ableitung von e^(−x) vergessen.",
    ],
    locked: false,
  },
  {
    id: "la6",
    tag: "Wendestellen (e-Funktion)",
    src: "Original-Übung · LK-Stil A6",
    q: "Bestimmen Sie die Wendestellen von f mit f(x) = e^(−x²).",
    steps: [
      { label: "Erste Ableitung", math: "f'(x) = −2x · e^(−x²)" },
      { label: "Zweite Ableitung (Produkt-/Kettenregel)", math: "f''(x) = e^(−x²) · (4x² − 2)" },
      { label: "Notwendige Bedingung f''(x) = 0", math: "4x² − 2 = 0  →  x² = 1/2" },
      { label: "Wendestellen", math: "x = ±√(1/2) = ±1/√2 ≈ ±0,71" },
    ],
    result: "Wendestellen bei x = ±1/√2 ≈ ±0,71",
    mistakes: [
      "Den Faktor e^(−x²) null setzen, statt nur den Klammerterm (4x² − 2) = 0 zu lösen.",
      "Beim Wurzelziehen nur die positive Lösung angeben und x = −1/√2 vergessen.",
    ],
    locked: false,
  },
  {
    id: "la7",
    tag: "Kurvendiskussion (e-Funktion)",
    src: "Original-Übung · LK-Stil A7",
    q: "Untersuchen Sie f mit f(x) = (x − 1)·e^x auf Extrem- und Wendepunkte.",
    steps: [
      { label: "Erste Ableitung (Produktregel)", math: "f'(x) = 1·e^x + (x−1)·e^x = e^x · x" },
      { label: "Extremstelle", math: "e^x · x = 0  →  x = 0;  f''(x) = e^x·(x+1), f''(0) = 1 > 0 → Tiefpunkt" },
      { label: "Tiefpunkt", math: "f(0) = (0−1)·1 = −1  →  TP(0 | −1)" },
      { label: "Wendestelle", math: "f''(x) = e^x·(x+1) = 0  →  x = −1" },
      { label: "Wendepunkt", math: "f(−1) = (−2)·e^(−1) = −2/e ≈ −0,74  →  WP(−1 | −2/e)" },
    ],
    result: "TP(0 | −1),  WP(−1 | −2/e ≈ −0,74)",
    mistakes: [
      "Die Produktregel falsch anwenden – beide Summanden enthalten den Faktor e^x.",
      "e^x = 0 als Lösung zulassen; die Nullstellen kommen ausschließlich aus den Klammertermen.",
    ],
    locked: false,
  },
  {
    id: "la8",
    tag: "Tangente (e-Funktion)",
    src: "Original-Übung · LK-Stil A8",
    q: "Bestimmen Sie die Tangente an den Graphen von f mit f(x) = e^x an der Stelle x₀ = 1.",
    steps: [
      { label: "Berührpunkt", math: "f(1) = e  →  P(1 | e)" },
      { label: "Steigung", math: "f'(x) = e^x  →  m = f'(1) = e" },
      { label: "Tangentengleichung", math: "y = e·(x − 1) + e = e·x − e + e" },
    ],
    result: "y = e·x  (≈ 2,72·x)",
    mistakes: [
      "Die Steigung mit f(1) statt mit f'(1) berechnen.",
      "e wie eine Variable behandeln; e ≈ 2,718 ist eine feste Zahl.",
    ],
    locked: false,
  },
  {
    id: "la9",
    tag: "Integral (e-Funktion)",
    src: "Original-Übung · LK-Stil A9",
    q: "Berechnen Sie das bestimmte Integral ∫₀¹ e^(2x) dx.",
    steps: [
      { label: "Stammfunktion (Kettenregel rückwärts)", math: "F(x) = ½ · e^(2x)   (Faktor ½ wegen innerer Ableitung 2)" },
      { label: "Grenzen einsetzen", math: "F(1) − F(0) = ½·e² − ½·e⁰" },
      { label: "Zusammenfassen", math: "= ½·(e² − 1)" },
    ],
    result: "∫₀¹ e^(2x) dx = ½·(e² − 1) ≈ 3,19",
    mistakes: [
      "Den Faktor ½ vergessen – bei e^(2x) muss wegen der inneren Ableitung 2 mit ½ multipliziert werden.",
      "e⁰ = 1 falsch behandeln (z. B. als 0), sodass die untere Grenze verschwindet.",
    ],
    locked: false,
  },
  {
    id: "la10",
    tag: "Fläche zwischen Kurven",
    src: "Original-Übung · LK-Stil A10",
    q: "Berechnen Sie den Inhalt der Fläche zwischen den Graphen von f(x) = 4 − x² und g(x) = x² − 2x.",
    steps: [
      { label: "Schnittstellen f = g", math: "4 − x² = x² − 2x  →  2x² − 2x − 4 = 0  →  x² − x − 2 = 0  →  x = −1, x = 2" },
      { label: "Obere Funktion", math: "Auf [−1; 2] gilt f(x) ≥ g(x)" },
      { label: "Integral der Differenz", math: "A = ∫₋₁² (4 − x² − (x² − 2x)) dx = ∫₋₁² (4 + 2x − 2x²) dx" },
      { label: "Stammfunktion", math: "F(x) = 4x + x² − (2/3)x³" },
      { label: "Grenzen einsetzen", math: "F(2) = 20/3;  F(−1) = −7/3;  A = 20/3 − (−7/3) = 27/3" },
    ],
    result: "A = 9 FE",
    mistakes: [
      "Die Differenz falsch herum bilden (g − f statt „oben − unten\") und eine negative Fläche erhalten.",
      "Die Schnittstellen nicht bestimmen und mit falschen Integrationsgrenzen rechnen.",
    ],
    locked: false,
  },
  {
    id: "la11",
    tag: "Rotationsvolumen",
    src: "Original-Übung · LK-Stil A11",
    q: "Der Graph von f mit f(x) = √x rotiert für 0 ≤ x ≤ 4 um die x-Achse. Berechnen Sie das Volumen des Rotationskörpers.",
    steps: [
      { label: "Volumenformel", math: "V = π · ∫ₐᵇ f(x)² dx" },
      { label: "f(x)² einsetzen", math: "f(x)² = (√x)² = x  →  V = π · ∫₀⁴ x dx" },
      { label: "Integral berechnen", math: "∫₀⁴ x dx = [x²/2]₀⁴ = 16/2 = 8" },
      { label: "Mit π multiplizieren", math: "V = π · 8" },
    ],
    result: "V = 8π ≈ 25,13 VE",
    mistakes: [
      "f(x) statt f(x)² integrieren – beim Rotationsvolumen wird die Funktion quadriert.",
      "Den Faktor π vergessen.",
    ],
    locked: false,
  },
  {
    id: "la12",
    tag: "Funktionenschar",
    src: "Original-Übung · LK-Stil A12",
    q: "Gegeben ist die Schar fₐ mit fₐ(x) = x³ − a·x (a > 0). Bestimmen Sie die Extremstellen in Abhängigkeit von a.",
    steps: [
      { label: "Erste Ableitung", math: "fₐ'(x) = 3x² − a" },
      { label: "Notwendige Bedingung", math: "3x² − a = 0  →  x² = a/3" },
      { label: "Extremstellen", math: "x = ±√(a/3)" },
      { label: "Art (zweite Ableitung)", math: "fₐ''(x) = 6x:  bei +√(a/3) > 0 → TP, bei −√(a/3) → HP" },
    ],
    result: "HP bei x = −√(a/3),  TP bei x = +√(a/3)",
    mistakes: [
      "Den Parameter a wie eine konkrete Zahl behandeln – das Ergebnis bleibt von a abhängig.",
      "Beim Wurzelziehen nur eine Lösung angeben; x² = a/3 hat zwei Lösungen (±).",
    ],
    locked: false,
  },
  {
    id: "la13",
    tag: "Partielle Integration",
    src: "Original-Übung · LK-Stil A13",
    q: "Berechnen Sie das Integral ∫₀¹ x · e^x dx mit partieller Integration.",
    steps: [
      { label: "Teile wählen", math: "u = x,  v' = e^x  →  u' = 1,  v = e^x" },
      { label: "Formel ∫u·v' = u·v − ∫u'·v", math: "∫ x·e^x dx = x·e^x − ∫ 1·e^x dx = x·e^x − e^x" },
      { label: "Stammfunktion zusammenfassen", math: "F(x) = e^x · (x − 1)" },
      { label: "Grenzen einsetzen", math: "F(1) − F(0) = e·0 − 1·(−1) = 0 − (−1)" },
    ],
    result: "∫₀¹ x·e^x dx = 1",
    mistakes: [
      "u und v' vertauschen – dann wird das neue Integral komplizierter statt einfacher.",
      "Den Minus-Term ∫u'·v vergessen; nach u·v muss noch ∫e^x dx = e^x abgezogen werden.",
    ],
    locked: false,
  },
  {
    id: "la14",
    tag: "Lineare Substitution",
    src: "Original-Übung · LK-Stil A14",
    q: "Berechnen Sie das bestimmte Integral ∫₁² (2x − 1)³ dx.",
    steps: [
      { label: "Stammfunktion (lineare Kettenregel)", math: "F(x) = (2x−1)⁴ / (4·2) = (2x−1)⁴ / 8   (÷2 wegen innerer Ableitung)" },
      { label: "Obere Grenze", math: "F(2) = 3⁴ / 8 = 81/8" },
      { label: "Untere Grenze", math: "F(1) = 1⁴ / 8 = 1/8" },
      { label: "Differenz", math: "81/8 − 1/8 = 80/8" },
    ],
    result: "∫₁² (2x−1)³ dx = 10",
    mistakes: [
      "Nur durch 4 (den Exponenten) teilen und den Faktor ½ aus der inneren Ableitung vergessen.",
      "(2x−1)³ mühsam ausmultiplizieren und sich verrechnen – die lineare Substitution ist der schnelle Weg.",
    ],
    locked: false,
  },
  {
    id: "la15",
    tag: "Uneigentliches Integral",
    src: "Original-Übung · LK-Stil A15",
    q: "Untersuchen Sie, ob das uneigentliche Integral ∫₁^∞ 1/x² dx existiert, und berechnen Sie gegebenenfalls seinen Wert.",
    steps: [
      { label: "Mit endlicher oberer Grenze b rechnen", math: "∫₁ᵇ x^(−2) dx = [ −1/x ]₁ᵇ = −1/b + 1" },
      { label: "Grenzübergang b → ∞", math: "lim (b→∞) (1 − 1/b) = 1 − 0" },
    ],
    result: "∫₁^∞ 1/x² dx = 1  (das Integral konvergiert)",
    mistakes: [
      "1/x² wie 1/x behandeln – ∫1/x dx = ln|x| divergiert, ∫1/x² dx konvergiert dagegen.",
      "Direkt „∞\" einsetzen, statt sauber mit dem Grenzwert b → ∞ zu arbeiten.",
    ],
    locked: false,
  },
  {
    id: "la16",
    tag: "Kurvendiskussion (ln)",
    src: "Original-Übung · LK-Stil A16",
    q: "Bestimmen Sie den Hochpunkt von f mit f(x) = ln(x) / x  (x > 0).",
    steps: [
      { label: "Ableitung (Quotientenregel)", math: "f'(x) = [ (1/x)·x − ln(x)·1 ] / x² = (1 − ln x) / x²" },
      { label: "Notwendige Bedingung", math: "1 − ln x = 0  →  ln x = 1  →  x = e" },
      { label: "Vorzeichenwechsel prüfen", math: "x < e: f' > 0 (steigend);  x > e: f' < 0 (fallend)  →  Hochpunkt" },
      { label: "y-Wert", math: "f(e) = ln(e)/e = 1/e ≈ 0,37" },
    ],
    result: "HP(e | 1/e ≈ 0,37)",
    mistakes: [
      "Den Nenner x² beim Nullsetzen mitrechnen – der Bruch wird nur null, wenn der Zähler (1 − ln x) null ist.",
      "ln(e) = 1 vergessen und dadurch den y-Wert falsch bestimmen.",
    ],
    locked: false,
  },
  {
    id: "la17",
    tag: "Extremwertproblem",
    src: "Original-Übung · LK-Stil A17",
    q: "Dem Parabelbogen y = 4 − x² wird ein achsensymmetrisches Rechteck einbeschrieben (Grundseite auf der x-Achse). Bestimmen Sie die Maße mit dem größten Flächeninhalt.",
    steps: [
      { label: "Maße durch x ausdrücken", math: "Breite = 2x,  Höhe = 4 − x²   (0 < x < 2)" },
      { label: "Zielfunktion", math: "A(x) = 2x · (4 − x²) = 8x − 2x³" },
      { label: "Ableiten und null setzen", math: "A'(x) = 8 − 6x² = 0  →  x² = 4/3  →  x = 2/√3" },
      { label: "Maße einsetzen", math: "Breite = 4/√3 ≈ 2,31,  Höhe = 4 − 4/3 = 8/3 ≈ 2,67" },
    ],
    result: "A_max = 32√3/9 ≈ 6,16 FE  (Breite 4/√3, Höhe 8/3)",
    mistakes: [
      "Die Breite als x statt als 2x ansetzen – das Rechteck reicht symmetrisch von −x bis +x.",
      "Nur den x-Wert angeben, statt daraus Breite, Höhe und Flächeninhalt zu berechnen.",
    ],
    locked: false,
  },
  {
    id: "la18",
    tag: "Wendetangente",
    src: "Original-Übung · LK-Stil A18",
    q: "Bestimmen Sie die Gleichung der Wendetangente von f mit f(x) = x³ − 6x² + 9x + 1.",
    steps: [
      { label: "Erste und zweite Ableitung", math: "f'(x) = 3x² − 12x + 9,  f''(x) = 6x − 12" },
      { label: "Wendestelle", math: "6x − 12 = 0  →  x = 2;  f(2) = 8 − 24 + 18 + 1 = 3" },
      { label: "Steigung im Wendepunkt", math: "f'(2) = 3·4 − 12·2 + 9 = −3" },
      { label: "Tangente durch W(2 | 3)", math: "y = −3·(x − 2) + 3 = −3x + 9" },
    ],
    result: "Wendetangente: y = −3x + 9",
    mistakes: [
      "Die Steigung mit f(2) oder f''(2) statt mit f'(2) berechnen.",
      "Den Wendepunkt bestimmen, aber die Tangente nicht durch ihn legen (Punktprobe vergessen).",
    ],
    locked: false,
  },
  {
    id: "la19",
    tag: "Trigonometrie (Extremstellen)",
    src: "Original-Übung · LK-Stil A19",
    q: "Bestimmen Sie die Extrempunkte von f mit f(x) = 2·sin(x) + x im Intervall [0; 2π].",
    steps: [
      { label: "Erste Ableitung", math: "f'(x) = 2·cos(x) + 1" },
      { label: "Notwendige Bedingung", math: "2cos(x) + 1 = 0  →  cos(x) = −½  →  x = 2π/3 oder x = 4π/3" },
      { label: "Art über f''(x) = −2·sin(x)", math: "f''(2π/3) = −√3 < 0 → HP;  f''(4π/3) = +√3 > 0 → TP" },
      { label: "y-Werte", math: "f(2π/3) = √3 + 2π/3 ≈ 3,83;  f(4π/3) = −√3 + 4π/3 ≈ 2,46" },
    ],
    result: "HP(2π/3 | ≈ 3,83),  TP(4π/3 | ≈ 2,46)",
    mistakes: [
      "Nur eine Lösung von cos(x) = −½ angeben; im Intervall [0; 2π] gibt es zwei.",
      "Beim linearen Term +x die Ableitung +1 vergessen und f'(x) = 2cos(x) setzen.",
    ],
    locked: false,
  },
  {
    id: "la20",
    tag: "Ortskurve der Hochpunkte",
    src: "Original-Übung · LK-Stil A20",
    q: "Gegeben ist die Schar fₜ mit fₜ(x) = x³ − 3t²·x  (t > 0). Bestimmen Sie die Ortskurve der Hochpunkte.",
    steps: [
      { label: "Ableitung und Extremstellen", math: "fₜ'(x) = 3x² − 3t² = 0  →  x = ±t" },
      { label: "Hochpunkt bestimmen", math: "fₜ''(x) = 6x:  bei x = −t < 0  →  Hochpunkt" },
      { label: "y-Koordinate des HP", math: "fₜ(−t) = −t³ + 3t³ = 2t³  →  HP(−t | 2t³)" },
      { label: "Parameter t eliminieren", math: "x = −t → t = −x;  y = 2t³ = 2·(−x)³ = −2x³" },
    ],
    result: "Ortskurve: y = −2x³",
    mistakes: [
      "Bei der Elimination t = x statt t = −x setzen und ein Vorzeichen verlieren.",
      "Hoch- und Tiefpunkt verwechseln – bei x = −t ist f'' negativ, also liegt dort der Hochpunkt.",
    ],
    locked: false,
  },
  {
    id: "la21",
    tag: "Fläche mit Vorzeichenwechsel",
    src: "Original-Übung · LK-Stil A21",
    q: "Berechnen Sie den Inhalt der Fläche, die der Graph von f(x) = x³ − x mit der x-Achse über [−1; 1] einschließt.",
    steps: [
      { label: "Nullstellen", math: "x³ − x = x·(x−1)·(x+1) = 0  →  x = −1, 0, 1" },
      { label: "Vorzeichen beachten (getrennt integrieren)", math: "auf [−1; 0]: f ≥ 0,  auf [0; 1]: f ≤ 0" },
      { label: "Stammfunktion", math: "F(x) = x⁴/4 − x²/2" },
      { label: "Teilflächen mit Betrag", math: "∫₋₁⁰ f = ¼;  ∫₀¹ f = −¼  →  A = |¼| + |−¼|" },
    ],
    result: "A = ½ FE",
    mistakes: [
      "Von −1 bis 1 in einem Zug integrieren – wegen der Symmetrie kommt 0 heraus, das ist aber nicht die Fläche.",
      "Die Beträge der Teilflächen vergessen; unterhalb der x-Achse liefert das Integral negative Werte.",
    ],
    locked: false,
  },
  {
    id: "la22",
    tag: "Grenzverhalten",
    src: "Original-Übung · LK-Stil A22",
    q: "Untersuchen Sie das Verhalten von f mit f(x) = x · e^(−x) für x → +∞ und x → −∞.",
    steps: [
      { label: "Umschreiben als Bruch", math: "f(x) = x · e^(−x) = x / e^x" },
      { label: "x → +∞", math: "e^x wächst schneller als x  →  x / e^x → 0" },
      { label: "x → −∞", math: "x → −∞ und e^(−x) → +∞  →  Produkt → −∞" },
    ],
    result: "x → +∞: f(x) → 0;   x → −∞: f(x) → −∞",
    mistakes: [
      "Für x → +∞ den Ausdruck „∞·0\" als ∞ deuten – die e-Funktion dominiert, der Grenzwert ist 0.",
      "Bei x → −∞ das Vorzeichen übersehen: x ist negativ, e^(−x) positiv, also strebt das Produkt gegen −∞.",
    ],
    locked: false,
  },
];
