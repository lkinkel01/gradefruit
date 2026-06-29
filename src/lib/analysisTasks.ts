// 15 originale Übungsaufgaben "Analysis" im Abitur-Stil (Mathe-Abi Hessen, Grundkurs).
// Selbst formuliert – NICHT aus echten Klausuren kopiert.
// Struktur kompatibel mit dem Task-Typ der Plattform (TopicView), erweitert um "mistakes".

export interface AnalysisTask {
  id: string;
  tag: string;                                 // Themen-Kategorie
  src: string;                                 // Quelle (Original-Übung im Abi-Stil)
  q: string;                                   // Aufgabentext
  steps: { label: string; math: string }[];   // Lösungsweg in nachvollziehbaren Schritten
  result: string;                              // Endergebnis
  mistakes: string[];                          // 2 typische Fehler
  locked: boolean;
}

export const ANALYSIS_TASKS: AnalysisTask[] = [
  {
    id: "an1",
    tag: "Extrempunkte",
    src: "Original-Übung · Abi-Stil A1",
    q: "Bestimmen Sie alle lokalen Extrempunkte der Funktion f mit f(x) = 2x³ − 3x² − 12x + 5.",
    steps: [
      { label: "Erste Ableitung", math: "f'(x) = 6x² − 6x − 12" },
      { label: "Notwendige Bedingung f'(x) = 0", math: "6x² − 6x − 12 = 0  | : 6  →  x² − x − 2 = 0" },
      { label: "Nullstellen (Faktorisieren)", math: "(x − 2)(x + 1) = 0  →  x₁ = 2, x₂ = −1" },
      { label: "Zweite Ableitung", math: "f''(x) = 12x − 6" },
      { label: "Art bei x₁ = 2", math: "f''(2) = 18 > 0  →  Tiefpunkt" },
      { label: "Art bei x₂ = −1", math: "f''(−1) = −18 < 0  →  Hochpunkt" },
      { label: "y-Werte einsetzen", math: "f(2) = −15,  f(−1) = 12" },
    ],
    result: "HP(−1 | 12),  TP(2 | −15)",
    mistakes: [
      "Nur die x-Werte angeben und vergessen, sie in f(x) einzusetzen – ein Extrempunkt braucht IMMER x- und y-Wert.",
      "Vorzeichen bei f'' verwechseln: f'' > 0 ist ein Tiefpunkt (Linkskurve), f'' < 0 ein Hochpunkt (Rechtskurve).",
    ],
    locked: false,
  },
  {
    id: "an2",
    tag: "Wendepunkte",
    src: "Original-Übung · Abi-Stil A2",
    q: "Bestimmen Sie den Wendepunkt der Funktion f mit f(x) = x³ − 3x² + 2x.",
    steps: [
      { label: "Erste Ableitung", math: "f'(x) = 3x² − 6x + 2" },
      { label: "Zweite Ableitung", math: "f''(x) = 6x − 6" },
      { label: "Notwendige Bedingung f''(x) = 0", math: "6x − 6 = 0  →  x = 1" },
      { label: "Hinreichend: dritte Ableitung", math: "f'''(x) = 6 ≠ 0  →  Wendestelle bestätigt" },
      { label: "y-Wert einsetzen", math: "f(1) = 1 − 3 + 2 = 0" },
    ],
    result: "WP(1 | 0)",
    mistakes: [
      "f''(x) = 0 mit der Extrempunkt-Bedingung f'(x) = 0 verwechseln – für Wendepunkte braucht man die ZWEITE Ableitung.",
      "Vergessen zu prüfen, dass f''' ≠ 0 (bzw. ein Vorzeichenwechsel von f'' vorliegt); sonst ist die Wendestelle nicht gesichert.",
    ],
    locked: false,
  },
  {
    id: "an3",
    tag: "Kurvendiskussion",
    src: "Original-Übung · Abi-Stil A3",
    q: "Gegeben ist f mit f(x) = x³ − 6x² + 9x. Bestimmen Sie die Extrem- und Wendepunkte.",
    steps: [
      { label: "Erste Ableitung", math: "f'(x) = 3x² − 12x + 9" },
      { label: "Extremstellen f'(x) = 0", math: "3(x² − 4x + 3) = 0  →  (x − 1)(x − 3) = 0  →  x = 1, x = 3" },
      { label: "Zweite Ableitung", math: "f''(x) = 6x − 12" },
      { label: "Art der Extrema", math: "f''(1) = −6 < 0 → HP;  f''(3) = 6 > 0 → TP" },
      { label: "Wendestelle f''(x) = 0", math: "6x − 12 = 0  →  x = 2  (f''' = 6 ≠ 0)" },
      { label: "y-Werte", math: "f(1) = 4,  f(3) = 0,  f(2) = 2" },
    ],
    result: "HP(1 | 4),  TP(3 | 0),  WP(2 | 2)",
    mistakes: [
      "Die Wendestelle x = 2 als weitere Extremstelle deuten – bei x = 2 ist f'(2) = −3 ≠ 0, also KEIN Extrempunkt.",
      "Beim Faktorisieren von 3x² − 12x + 9 den Faktor 3 vergessen oder falsch ausklammern und so falsche Nullstellen erhalten.",
    ],
    locked: false,
  },
  {
    id: "an4",
    tag: "Tangente",
    src: "Original-Übung · Abi-Stil A4",
    q: "Bestimmen Sie die Gleichung der Tangente an den Graphen von f mit f(x) = x³ − 3x + 2 an der Stelle x₀ = 2.",
    steps: [
      { label: "Funktionswert (Berührpunkt)", math: "f(2) = 8 − 6 + 2 = 4  →  P(2 | 4)" },
      { label: "Erste Ableitung", math: "f'(x) = 3x² − 3" },
      { label: "Steigung an der Stelle", math: "m = f'(2) = 12 − 3 = 9" },
      { label: "Tangenten-Ansatz", math: "y = m·(x − x₀) + f(x₀) = 9·(x − 2) + 4" },
      { label: "Ausmultiplizieren", math: "y = 9x − 18 + 4" },
    ],
    result: "y = 9x − 14",
    mistakes: [
      "Die Steigung mit f(x) statt mit f'(x) berechnen – die Tangentensteigung ist immer der Ableitungswert f'(x₀).",
      "Beim Einsetzen in y = m·(x − x₀) + y₀ das + 4 vergessen, also fälschlich y = 9x − 18 angeben.",
    ],
    locked: false,
  },
  {
    id: "an5",
    tag: "Bestimmtes Integral",
    src: "Original-Übung · Abi-Stil A5",
    q: "Berechnen Sie das bestimmte Integral ∫₁³ (3x² − 4x + 1) dx.",
    steps: [
      { label: "Stammfunktion", math: "F(x) = x³ − 2x² + x" },
      { label: "Obere Grenze", math: "F(3) = 27 − 18 + 3 = 12" },
      { label: "Untere Grenze", math: "F(1) = 1 − 2 + 1 = 0" },
      { label: "Hauptsatz: F(3) − F(1)", math: "12 − 0 = 12" },
    ],
    result: "∫₁³ (3x² − 4x + 1) dx = 12",
    mistakes: [
      "Bei der Stammfunktion den Exponenten nicht erhöhen/teilen (aus 3x² wird x³, nicht 3x³).",
      "Grenzen vertauschen und F(1) − F(3) rechnen – es gilt immer „obere minus untere Grenze\".",
    ],
    locked: false,
  },
  {
    id: "an6",
    tag: "Fläche zur x-Achse",
    src: "Original-Übung · Abi-Stil A6",
    q: "Der Graph von f mit f(x) = 4 − x² schließt mit der x-Achse eine Fläche ein. Berechnen Sie ihren Inhalt.",
    steps: [
      { label: "Nullstellen (Integrationsgrenzen)", math: "4 − x² = 0  →  x = −2 und x = 2" },
      { label: "Integral ansetzen", math: "A = ∫₋₂² (4 − x²) dx" },
      { label: "Stammfunktion", math: "F(x) = 4x − x³/3" },
      { label: "Grenzen einsetzen", math: "F(2) = 8 − 8/3 = 16/3;  F(−2) = −16/3" },
      { label: "Differenz", math: "A = 16/3 − (−16/3) = 32/3" },
    ],
    result: "A = 32/3 ≈ 10,67 FE",
    mistakes: [
      "Ohne die Nullstellen zu bestimmen „irgendwelche\" Grenzen einsetzen – die Integrationsgrenzen sind hier die Nullstellen der Funktion.",
      "Bei Flächen unter der x-Achse das Vorzeichen ignorieren; eine Fläche ist nie negativ (hier liegt sie komplett über der x-Achse).",
    ],
    locked: false,
  },
  {
    id: "an7",
    tag: "Fläche zwischen zwei Kurven",
    src: "Original-Übung · Abi-Stil A7",
    q: "Berechnen Sie den Inhalt der Fläche, die von den Graphen von f(x) = x² und g(x) = x + 2 eingeschlossen wird.",
    steps: [
      { label: "Schnittstellen f(x) = g(x)", math: "x² = x + 2  →  x² − x − 2 = 0  →  x = −1, x = 2" },
      { label: "Obere Funktion bestimmen", math: "Auf [−1; 2] gilt g(x) ≥ f(x)" },
      { label: "Integral der Differenz", math: "A = ∫₋₁² (x + 2 − x²) dx" },
      { label: "Stammfunktion", math: "F(x) = x²/2 + 2x − x³/3" },
      { label: "Grenzen einsetzen", math: "F(2) = 10/3;  F(−1) = −7/6" },
      { label: "Differenz", math: "A = 10/3 − (−7/6) = 27/6 = 4,5" },
    ],
    result: "A = 4,5 FE",
    mistakes: [
      "Die Differenz falsch herum bilden (f − g statt „oben − unten\") und eine negative Fläche erhalten.",
      "Die Schnittstellen nicht berechnen und dadurch falsche Integrationsgrenzen verwenden.",
    ],
    locked: false,
  },
  {
    id: "an8",
    tag: "Mittelwert (Integral)",
    src: "Original-Übung · Abi-Stil A8",
    q: "Berechnen Sie den Mittelwert (Durchschnittswert) der Funktion f mit f(x) = x² im Intervall [0; 3].",
    steps: [
      { label: "Formel für den Mittelwert", math: "m = 1/(b − a) · ∫ₐᵇ f(x) dx" },
      { label: "Integral berechnen", math: "∫₀³ x² dx = [x³/3]₀³ = 27/3 = 9" },
      { label: "Vorfaktor anwenden", math: "m = 1/3 · 9" },
    ],
    result: "Mittelwert m = 3",
    mistakes: [
      "Den Faktor 1/(b − a) vergessen und nur das Integral (hier 9) als Mittelwert angeben.",
      "Die Intervalllänge falsch berechnen: b − a = 3 − 0 = 3 (nicht etwa 2).",
    ],
    locked: false,
  },
  {
    id: "an9",
    tag: "Stammfunktion durch Punkt",
    src: "Original-Übung · Abi-Stil A9",
    q: "Bestimmen Sie die Stammfunktion F von f(x) = 3x² − 2, deren Graph durch den Punkt P(1 | 4) verläuft.",
    steps: [
      { label: "Allgemeine Stammfunktion", math: "F(x) = x³ − 2x + C" },
      { label: "Punktbedingung einsetzen", math: "F(1) = 1 − 2 + C = 4" },
      { label: "C bestimmen", math: "−1 + C = 4  →  C = 5" },
    ],
    result: "F(x) = x³ − 2x + 5",
    mistakes: [
      "Die Integrationskonstante C vergessen – dann lässt sich die Punktbedingung gar nicht erfüllen.",
      "Beim Lösen von −1 + C = 4 falsch umstellen (C = 3 statt C = 5).",
    ],
    locked: false,
  },
  {
    id: "an10",
    tag: "Extrempunkt (e-Funktion)",
    src: "Original-Übung · Abi-Stil A10",
    q: "Bestimmen Sie den Hochpunkt der Funktion f mit f(x) = x · e^(−x).",
    steps: [
      { label: "Ableitung (Produktregel)", math: "f'(x) = 1·e^(−x) + x·(−e^(−x)) = e^(−x)·(1 − x)" },
      { label: "Notwendige Bedingung", math: "e^(−x)·(1 − x) = 0  →  1 − x = 0  →  x = 1" },
      { label: "Begründung", math: "e^(−x) > 0 für alle x, also nur 1 − x = 0 möglich" },
      { label: "Zweite Ableitung", math: "f''(x) = e^(−x)·(x − 2)" },
      { label: "Art prüfen", math: "f''(1) = e^(−1)·(−1) < 0  →  Hochpunkt" },
      { label: "y-Wert", math: "f(1) = 1·e^(−1) = 1/e ≈ 0,37" },
    ],
    result: "HP(1 | 1/e) ≈ HP(1 | 0,37)",
    mistakes: [
      "Die Produktregel falsch anwenden und die innere Ableitung von e^(−x) (Faktor −1) vergessen.",
      "e^(−x) = 0 setzen – die e-Funktion wird nie null, daher kommt die Nullstelle nur aus dem Faktor (1 − x).",
    ],
    locked: false,
  },
  {
    id: "an11",
    tag: "Monotonie",
    src: "Original-Übung · Abi-Stil A11",
    q: "Untersuchen Sie die Funktion f mit f(x) = x³ − 3x auf Monotonie und geben Sie die Monotonieintervalle an.",
    steps: [
      { label: "Erste Ableitung", math: "f'(x) = 3x² − 3" },
      { label: "Nullstellen von f'", math: "3(x² − 1) = 0  →  x = −1 und x = 1" },
      { label: "Vorzeichen prüfen (x = −2)", math: "f'(−2) = 9 > 0  →  steigend" },
      { label: "Vorzeichen prüfen (x = 0)", math: "f'(0) = −3 < 0  →  fallend" },
      { label: "Vorzeichen prüfen (x = 2)", math: "f'(2) = 9 > 0  →  steigend" },
    ],
    result: "streng monoton steigend auf (−∞; −1] und [1; ∞), streng monoton fallend auf [−1; 1]",
    mistakes: [
      "Nur die Nullstellen von f' angeben, ohne das Vorzeichen von f' in den Bereichen dazwischen zu untersuchen.",
      "Steigend/fallend vertauschen: f' > 0 bedeutet steigend, f' < 0 bedeutet fallend.",
    ],
    locked: false,
  },
  {
    id: "an12",
    tag: "Steckbriefaufgabe",
    src: "Original-Übung · Abi-Stil A12",
    q: "Eine ganzrationale Funktion f dritten Grades hat im Punkt W(0 | 1) einen Sattelpunkt (Wendepunkt mit waagerechter Tangente) und verläuft durch P(1 | 3). Bestimmen Sie f.",
    steps: [
      { label: "Ansatz", math: "f(x) = ax³ + bx² + cx + d" },
      { label: "Punkt W: f(0) = 1", math: "d = 1" },
      { label: "Waagerechte Tangente: f'(0) = 0", math: "f'(x) = 3ax² + 2bx + c  →  c = 0" },
      { label: "Wendestelle: f''(0) = 0", math: "f''(x) = 6ax + 2b  →  2b = 0  →  b = 0" },
      { label: "Punkt P: f(1) = 3", math: "a + 1 = 3  →  a = 2" },
    ],
    result: "f(x) = 2x³ + 1",
    mistakes: [
      "„Sattelpunkt\" nur als waagerechte Tangente (f' = 0) deuten und die Wendebedingung f'' = 0 vergessen – ein Sattelpunkt braucht BEIDE.",
      "Die Bedingungen den falschen Ableitungen zuordnen (z. B. f(0) mit f'(0) verwechseln) und so ein falsches Gleichungssystem aufstellen.",
    ],
    locked: false,
  },
  {
    id: "an13",
    tag: "Änderungsrate",
    src: "Original-Übung · Abi-Stil A13",
    q: "Gegeben ist f mit f(x) = x². Bestimmen Sie die mittlere Änderungsrate im Intervall [1; 3] sowie die momentane Änderungsrate an der Stelle x = 1.",
    steps: [
      { label: "Mittlere Änderungsrate (Differenzenquotient)", math: "(f(3) − f(1)) / (3 − 1) = (9 − 1) / 2" },
      { label: "Ergebnis mittlere Änderungsrate", math: "= 8 / 2 = 4" },
      { label: "Momentane Änderungsrate = Ableitung", math: "f'(x) = 2x" },
      { label: "An der Stelle x = 1", math: "f'(1) = 2" },
    ],
    result: "mittlere Änderungsrate = 4;  momentane Änderungsrate bei x = 1 ist 2",
    mistakes: [
      "Mittlere und momentane Änderungsrate verwechseln: die mittlere nutzt den Differenzenquotienten, die momentane die Ableitung f'.",
      "Beim Differenzenquotienten durch eine falsche Intervalllänge teilen (hier 3 − 1 = 2).",
    ],
    locked: false,
  },
  {
    id: "an14",
    tag: "Extremwertproblem",
    src: "Original-Übung · Abi-Stil A14",
    q: "Aus einem 40 cm langen Draht soll der Rand eines Rechtecks gebogen werden. Für welche Seitenlängen wird der Flächeninhalt maximal? Geben Sie den maximalen Flächeninhalt an.",
    steps: [
      { label: "Nebenbedingung (Umfang)", math: "2x + 2y = 40  →  y = 20 − x" },
      { label: "Zielfunktion (Fläche)", math: "A(x) = x · (20 − x) = 20x − x²" },
      { label: "Ableitung = 0", math: "A'(x) = 20 − 2x = 0  →  x = 10" },
      { label: "Maximum nachweisen", math: "A''(x) = −2 < 0  →  Maximum" },
      { label: "Zweite Seite & Fläche", math: "y = 20 − 10 = 10;  A = 10 · 10 = 100" },
    ],
    result: "Quadrat mit 10 cm × 10 cm, maximaler Flächeninhalt A = 100 cm²",
    mistakes: [
      "Ohne Nebenbedingung arbeiten und x und y als unabhängig behandeln – die Fläche muss vor dem Ableiten von EINER Variablen abhängen.",
      "Den Umfang falsch ansetzen (z. B. x + y = 40 statt 2x + 2y = 40).",
    ],
    locked: false,
  },
  {
    id: "an15",
    tag: "Sachkontext",
    src: "Original-Übung · Abi-Stil A15",
    q: "In ein Wasserbecken fließt Wasser. Die Zuflussrate (in Litern pro Minute) wird für 0 ≤ t ≤ 6 (t in Minuten) durch f(t) = −t² + 6t beschrieben. a) Zu welchem Zeitpunkt ist die Zuflussrate am größten? b) Welche Wassermenge fließt in den ersten 6 Minuten insgesamt zu?",
    steps: [
      { label: "a) Ableitung der Rate", math: "f'(t) = −2t + 6" },
      { label: "a) Maximum der Rate", math: "−2t + 6 = 0  →  t = 3  (f''(t) = −2 < 0 → Max)" },
      { label: "a) Größte Rate", math: "f(3) = −9 + 18 = 9 L/min" },
      { label: "b) Menge = Integral der Rate", math: "∫₀⁶ (−t² + 6t) dt" },
      { label: "b) Stammfunktion", math: "F(t) = −t³/3 + 3t²" },
      { label: "b) Grenzen einsetzen", math: "F(6) = −72 + 108 = 36;  F(0) = 0" },
    ],
    result: "a) nach t = 3 min (maximal 9 L/min);  b) insgesamt 36 Liter",
    mistakes: [
      "Bei b) die Rate f(t) direkt als Wassermenge deuten – die zugeflossene Menge ist das INTEGRAL der Zuflussrate.",
      "Bei a) integrieren statt ableiten: das Maximum der Rate findet man über f'(t) = 0, nicht über das Integral.",
    ],
    locked: false,
  },
];
