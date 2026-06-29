// 12 originale Übungsaufgaben "Stochastik" auf LEISTUNGSKURS-Niveau (Mathe-Abi Hessen).
// Selbst formuliert – NICHT aus echten Klausuren kopiert.
// Schwerpunkte: Binomialverteilung, σ-Regeln, Normalapproximation, Hypothesentests, Konfidenzintervalle, Bayes.

export interface StochastikLkTask {
  id: string;
  tag: string;
  src: string;
  q: string;
  steps: { label: string; math: string }[];
  result: string;
  mistakes: string[];
  locked: boolean;
}

export const STOCHASTIK_LK_TASKS: StochastikLkTask[] = [
  {
    id: "sl1",
    tag: "σ-Regeln (Binomial)",
    src: "Original-Übung · LK-Stil S1",
    q: "Eine Münze wird 100-mal geworfen, X zählt die Anzahl „Kopf\" (p = 0,5). Bestimmen Sie das 2σ-Intervall und die Wahrscheinlichkeit, dass X darin liegt.",
    steps: [
      { label: "Erwartungswert", math: "μ = n·p = 100·0,5 = 50" },
      { label: "Standardabweichung", math: "σ = √(n·p·(1−p)) = √(100·0,5·0,5) = √25 = 5" },
      { label: "2σ-Intervall", math: "[μ − 2σ;  μ + 2σ] = [50 − 10;  50 + 10] = [40;  60]" },
      { label: "Wahrscheinlichkeit (2σ-Regel)", math: "P(40 ≤ X ≤ 60) ≈ 95,4 %" },
    ],
    result: "2σ-Intervall [40; 60],  P ≈ 95,4 %",
    mistakes: [
      "σ als n·p·(1−p) angeben und die Wurzel vergessen – die Standardabweichung ist die Wurzel der Varianz.",
      "Die 95,4 % (2σ) mit den 68,3 % (1σ) oder 99,7 % (3σ) verwechseln.",
    ],
    locked: false,
  },
  {
    id: "sl2",
    tag: "Erwartungswert & σ",
    src: "Original-Übung · LK-Stil S2",
    q: "Ein Bauteil ist mit Wahrscheinlichkeit p = 0,25 defekt. Aus einer Produktion werden n = 400 Stück geprüft. Bestimmen Sie Erwartungswert und Standardabweichung der Anzahl defekter Bauteile.",
    steps: [
      { label: "Modell", math: "X ~ B(400; 0,25)" },
      { label: "Erwartungswert", math: "μ = n·p = 400·0,25 = 100" },
      { label: "Varianz", math: "Var(X) = n·p·(1−p) = 400·0,25·0,75 = 75" },
      { label: "Standardabweichung", math: "σ = √75 = 5√3 ≈ 8,66" },
    ],
    result: "μ = 100,  σ = 5√3 ≈ 8,66",
    mistakes: [
      "Bei der Varianz (1−p) vergessen und nur n·p rechnen.",
      "σ und Var verwechseln – die Standardabweichung ist die Wurzel aus der Varianz.",
    ],
    locked: false,
  },
  {
    id: "sl3",
    tag: "Normalapproximation",
    src: "Original-Übung · LK-Stil S3",
    q: "Eine Münze wird 100-mal geworfen (p = 0,5, μ = 50, σ = 5). Schätzen Sie P(X ≤ 55) mit der Normalverteilung (mit Stetigkeitskorrektur).",
    steps: [
      { label: "Stetigkeitskorrektur", math: "P(X ≤ 55) ≈ P(X ≤ 55,5)  →  obere Grenze 55,5" },
      { label: "Standardisieren", math: "z = (55,5 − μ) / σ = (55,5 − 50) / 5 = 1,1" },
      { label: "Tabellenwert", math: "Φ(1,1) ≈ 0,8643" },
      { label: "Ergebnis", math: "P(X ≤ 55) ≈ 0,864" },
    ],
    result: "P(X ≤ 55) ≈ 0,864",
    mistakes: [
      "Die Stetigkeitskorrektur (+0,5) weglassen und z = 1,0 statt 1,1 erhalten.",
      "Φ(−z) = 1 − Φ(z) verwechseln; hier wird der Tabellenwert direkt genutzt, da z > 0.",
    ],
    locked: false,
  },
  {
    id: "sl4",
    tag: "Mindestens-eins (Binomial)",
    src: "Original-Übung · LK-Stil S4",
    q: "Ein Gerät ist mit Wahrscheinlichkeit p = 0,1 fehlerhaft. Wie groß ist die Wahrscheinlichkeit, dass unter 50 Geräten mindestens eines fehlerhaft ist?",
    steps: [
      { label: "Gegenereignis", math: "„mindestens eins\" = 1 − „keines\"" },
      { label: "Kein fehlerhaftes Gerät", math: "P(X = 0) = (1 − 0,1)⁵⁰ = 0,9⁵⁰" },
      { label: "Wert berechnen", math: "0,9⁵⁰ ≈ 0,00515" },
      { label: "Gegenwahrscheinlichkeit", math: "P(X ≥ 1) = 1 − 0,00515" },
    ],
    result: "P(X ≥ 1) ≈ 0,995",
    mistakes: [
      "P(X ≥ 1) als 50·0,1 = „5\" abschätzen – Wahrscheinlichkeiten können nie größer als 1 werden.",
      "Statt des Gegenereignisses alle Einzelwahrscheinlichkeiten P(X=1)+P(X=2)+… aufsummieren (unnötig aufwändig).",
    ],
    locked: false,
  },
  {
    id: "sl5",
    tag: "Kleinstes n bestimmen",
    src: "Original-Übung · LK-Stil S5",
    q: "Wie oft muss man einen Würfel mindestens werfen, damit mit einer Wahrscheinlichkeit von mindestens 99 % mindestens eine Sechs fällt?",
    steps: [
      { label: "Gegenereignis ansetzen", math: "P(mind. eine 6) = 1 − (5/6)ⁿ ≥ 0,99" },
      { label: "Umstellen", math: "(5/6)ⁿ ≤ 0,01" },
      { label: "Logarithmieren", math: "n ≥ ln(0,01) / ln(5/6) = (−4,605) / (−0,1823) ≈ 25,3" },
      { label: "Aufrunden", math: "n muss ganzzahlig und ≥ 25,3 sein  →  n = 26" },
    ],
    result: "n = 26 Würfe",
    mistakes: [
      "Beim Teilen durch ln(5/6) (negativ) das Ungleichheitszeichen nicht umdrehen.",
      "25,3 abrunden auf 25 – bei „mindestens\" muss immer aufgerundet werden.",
    ],
    locked: false,
  },
  {
    id: "sl6",
    tag: "Konfidenzintervall",
    src: "Original-Übung · LK-Stil S6",
    q: "Bei einer Umfrage unter n = 100 Personen stimmen 40 % zu. Bestimmen Sie das 95 %-Konfidenzintervall für den unbekannten Anteil p.",
    steps: [
      { label: "Stichprobenanteil", math: "h = 0,4,  n = 100" },
      { label: "Standardfehler", math: "√(h·(1−h)/n) = √(0,4·0,6/100) = √0,0024 ≈ 0,049" },
      { label: "Radius (Faktor 1,96)", math: "1,96 · 0,049 ≈ 0,096" },
      { label: "Intervall", math: "[0,4 − 0,096;  0,4 + 0,096] ≈ [0,30;  0,50]" },
    ],
    result: "95 %-Konfidenzintervall ≈ [0,30; 0,50]",
    mistakes: [
      "Im Standardfehler durch n statt durch n unter der Wurzel teilen oder das Wurzelziehen vergessen.",
      "Den Faktor 1,96 (95 %) mit 2,58 (99 %) verwechseln.",
    ],
    locked: false,
  },
  {
    id: "sl7",
    tag: "Hypothesentest · Fehler 1. Art",
    src: "Original-Übung · LK-Stil S7",
    q: "Getestet wird H₀: p = 0,5 bei n = 100 (μ = 50, σ = 5). Die Nullhypothese wird verworfen, falls X ≥ 59. Bestimmen Sie die Wahrscheinlichkeit für den Fehler 1. Art.",
    steps: [
      { label: "Fehler 1. Art definieren", math: "α = P(H₀ verwerfen | H₀ wahr) = P(X ≥ 59 | p = 0,5)" },
      { label: "Stetigkeitskorrektur", math: "P(X ≥ 59) ≈ P(X ≥ 58,5)" },
      { label: "Standardisieren", math: "z = (58,5 − 50) / 5 = 1,7" },
      { label: "Gegenwahrscheinlichkeit", math: "α ≈ 1 − Φ(1,7) = 1 − 0,9554 = 0,0446" },
    ],
    result: "Fehler 1. Art:  α ≈ 4,5 %",
    mistakes: [
      "Bei P(X ≥ 59) die untere Grenze nicht korrigieren – hier wird auf 58,5 verschoben (Stetigkeitskorrektur).",
      "Φ(1,7) direkt als Ergebnis nehmen, statt 1 − Φ(1,7) für „≥\" zu rechnen.",
    ],
    locked: false,
  },
  {
    id: "sl8",
    tag: "Hypothesentest · Fehler 2. Art",
    src: "Original-Übung · LK-Stil S8",
    q: "Gleicher Test wie zuvor (n = 100, Ablehnung bei X ≥ 59). Berechnen Sie den Fehler 2. Art, falls in Wahrheit p = 0,65 gilt.",
    steps: [
      { label: "Fehler 2. Art definieren", math: "β = P(H₀ behalten | p = 0,65) = P(X ≤ 58 | p = 0,65)" },
      { label: "Kennzahlen unter H₁", math: "μ = 100·0,65 = 65,  σ = √(100·0,65·0,35) ≈ 4,77" },
      { label: "Standardisieren (mit Korrektur)", math: "z = (58,5 − 65) / 4,77 ≈ −1,36" },
      { label: "Tabellenwert", math: "β = Φ(−1,36) = 1 − Φ(1,36) ≈ 1 − 0,9131" },
    ],
    result: "Fehler 2. Art:  β ≈ 8,7 %",
    mistakes: [
      "Beim Fehler 2. Art mit p = 0,5 (H₀) statt mit p = 0,65 (H₁) rechnen – μ und σ ändern sich.",
      "Den Annahmebereich falsch abgrenzen: verworfen wird ab 59, also „behalten\" für X ≤ 58.",
    ],
    locked: false,
  },
  {
    id: "sl9",
    tag: "Totale W. & Bayes",
    src: "Original-Übung · LK-Stil S9",
    q: "An einer Schule sind 55 % der Lernenden Mädchen. 20 % der Mädchen und 10 % der Jungen besuchen die Mathe-AG. (a) Wie wahrscheinlich ist ein zufällig gewähltes AG-Mitglied? (b) Wie wahrscheinlich ist es ein Mädchen?",
    steps: [
      { label: "Gegeben", math: "P(M) = 0,55,  P(J) = 0,45,  P(AG|M) = 0,2,  P(AG|J) = 0,1" },
      { label: "Totale Wahrscheinlichkeit (a)", math: "P(AG) = 0,55·0,2 + 0,45·0,1 = 0,11 + 0,045 = 0,155" },
      { label: "Satz von Bayes (b)", math: "P(M|AG) = P(M)·P(AG|M) / P(AG) = 0,11 / 0,155" },
      { label: "Auswerten", math: "P(M|AG) ≈ 0,710" },
    ],
    result: "P(AG) = 15,5 %,  P(M|AG) ≈ 71 %",
    mistakes: [
      "P(AG|M) und P(M|AG) verwechseln – Bayes dreht die Bedingung gerade um.",
      "Im Nenner von Bayes nicht die totale Wahrscheinlichkeit P(AG), sondern nur einen Teilpfad einsetzen.",
    ],
    locked: false,
  },
  {
    id: "sl10",
    tag: "Kumulierte Binomialverteilung",
    src: "Original-Übung · LK-Stil S10",
    q: "Ein Glücksrad zeigt mit Wahrscheinlichkeit p = 0,3 die Farbe Rot. Es wird 10-mal gedreht. Berechnen Sie P(X ≤ 2) für die Anzahl X der roten Ergebnisse.",
    steps: [
      { label: "Modell", math: "X ~ B(10; 0,3)" },
      { label: "P(X = 0)", math: "0,7¹⁰ ≈ 0,0282" },
      { label: "P(X = 1)", math: "C(10,1)·0,3·0,7⁹ = 10·0,3·0,0404 ≈ 0,1211" },
      { label: "P(X = 2)", math: "C(10,2)·0,3²·0,7⁸ = 45·0,09·0,0576 ≈ 0,2335" },
      { label: "Summieren", math: "P(X ≤ 2) ≈ 0,0282 + 0,1211 + 0,2335" },
    ],
    result: "P(X ≤ 2) ≈ 0,383",
    mistakes: [
      "Den Binomialkoeffizienten C(10,k) vergessen und nur p^k·(1−p)^(n−k) rechnen.",
      "„höchstens 2\" als nur P(X = 2) deuten; es müssen X = 0, 1 und 2 addiert werden.",
    ],
    locked: false,
  },
  {
    id: "sl11",
    tag: "Zweiseitiger Test",
    src: "Original-Übung · LK-Stil S11",
    q: "H₀: p = 0,5 bei n = 100 soll zweiseitig auf dem 5 %-Niveau getestet werden (μ = 50, σ = 5). Bestimmen Sie den Annahmebereich.",
    steps: [
      { label: "Zweiseitig: je 2,5 % an den Rändern", math: "Faktor z = 1,96  (95 % in der Mitte)" },
      { label: "Grenzen über μ ± z·σ", math: "50 ± 1,96·5 = 50 ± 9,8  →  [40,2;  59,8]" },
      { label: "Ganzzahlig eingrenzen", math: "Annahme für 41 ≤ X ≤ 59" },
      { label: "Ablehnbereich", math: "X ≤ 40 oder X ≥ 60" },
    ],
    result: "Annahmebereich {41, 42, …, 59}",
    mistakes: [
      "Beim zweiseitigen Test mit z = 1,64 (einseitig, 5 %) statt z = 1,96 rechnen.",
      "Die Grenzen 40,2 und 59,8 falsch runden – der Annahmebereich enthält nur ganze Zahlen echt innerhalb des Intervalls.",
    ],
    locked: false,
  },
  {
    id: "sl12",
    tag: "Erwartungswert & σ (allg. ZG)",
    src: "Original-Übung · LK-Stil S12",
    q: "Eine Zufallsgröße X nimmt die Werte −2, 0 und 3 mit den Wahrscheinlichkeiten 0,3; 0,5 und 0,2 an. Berechnen Sie Erwartungswert und Standardabweichung.",
    steps: [
      { label: "Erwartungswert", math: "E(X) = (−2)·0,3 + 0·0,5 + 3·0,2 = −0,6 + 0,6 = 0" },
      { label: "E(X²) berechnen", math: "E(X²) = 4·0,3 + 0·0,5 + 9·0,2 = 1,2 + 1,8 = 3" },
      { label: "Varianz", math: "Var(X) = E(X²) − E(X)² = 3 − 0² = 3" },
      { label: "Standardabweichung", math: "σ = √3 ≈ 1,73" },
    ],
    result: "E(X) = 0,  σ = √3 ≈ 1,73",
    mistakes: [
      "Die Varianz als E((X − μ)²) ohne Quadrieren von μ berechnen oder E(X²) mit E(X)² verwechseln.",
      "Beim Quadrieren das Vorzeichen falsch behandeln: (−2)² = 4, nicht −4.",
    ],
    locked: false,
  },
];
