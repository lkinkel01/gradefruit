// 22 originale Übungsaufgaben "Stochastik" auf LEISTUNGSKURS-Niveau (Mathe-Abi Hessen).
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
  {
    id: "sl13",
    tag: "Geometrische Verteilung (Wartezeit)",
    src: "Original-Übung · LK-Stil S13",
    q: "Bei einem Spiel gewinnt man in jeder Runde unabhängig mit p = 0,2. X ist die Nummer der Runde des ersten Gewinns. Berechnen Sie (a) P(X = 4), (b) P(X > 4) und (c) den Erwartungswert E(X).",
    steps: [
      { label: "Modell (geometrische Verteilung)", math: "P(X = k) = (1 − p)^(k−1) · p = 0,8^(k−1) · 0,2" },
      { label: "(a) genau in Runde 4", math: "P(X = 4) = 0,8³ · 0,2 = 0,512 · 0,2 = 0,1024" },
      { label: "(b) erst nach Runde 4", math: "P(X > 4) = 0,8⁴ = 0,4096   (4-mal in Folge kein Gewinn)" },
      { label: "(c) Erwartungswert", math: "E(X) = 1/p = 1/0,2 = 5" },
    ],
    result: "P(X=4) ≈ 0,102,  P(X>4) ≈ 0,410,  E(X) = 5",
    mistakes: [
      "Bei P(X = k) den Exponenten k statt k−1 verwenden – die ersten k−1 Runden sind Misserfolge.",
      "P(X > 4) mit dem Binomialkoeffizienten berechnen; hier zählt nur „4-mal hintereinander verloren\" = 0,8⁴.",
    ],
    locked: false,
  },
  {
    id: "sl14",
    tag: "Hypergeometrische Verteilung",
    src: "Original-Übung · LK-Stil S14",
    q: "In einer Lostrommel liegen 10 Lose, davon 4 Gewinne. Es werden 3 Lose ohne Zurücklegen gezogen. Berechnen Sie die Wahrscheinlichkeit, genau 2 Gewinne zu ziehen.",
    steps: [
      { label: "Modell (ohne Zurücklegen)", math: "P(X = 2) = [ C(4,2) · C(6,1) ] / C(10,3)" },
      { label: "Binomialkoeffizienten", math: "C(4,2) = 6,  C(6,1) = 6,  C(10,3) = 120" },
      { label: "Einsetzen", math: "P(X = 2) = (6 · 6) / 120 = 36/120" },
    ],
    result: "P(genau 2 Gewinne) = 0,3",
    mistakes: [
      "Mit der Binomialverteilung (mit Zurücklegen) rechnen – beim Ziehen ohne Zurücklegen ändert sich p pro Zug.",
      "Im Zähler die Nieten vergessen: Es müssen 2 aus 4 Gewinnen UND 1 aus 6 Nieten kombiniert werden.",
    ],
    locked: false,
  },
  {
    id: "sl15",
    tag: "Kritischer Wert (einseitiger Test)",
    src: "Original-Übung · LK-Stil S15",
    q: "Ein Hersteller behauptet, der Ausschussanteil betrage p = 0,1 (H₀). Bei n = 100 (μ = 10, σ = 3) wird rechtsseitig auf dem 5 %-Niveau getestet. Bestimmen Sie den Ablehnungsbereich.",
    steps: [
      { label: "Rechtsseitiger Test", math: "H₀ wird verworfen, wenn X zu groß ist: Ablehnung {X ≥ k}" },
      { label: "z-Wert für 5 % (einseitig)", math: "z = 1,64  (obere 5 %)" },
      { label: "Kritische Grenze", math: "g = μ + z·σ = 10 + 1,64·3 = 10 + 4,92 = 14,92" },
      { label: "Ganzzahlig festlegen", math: "damit P(X ≥ k) ≤ 5 % bleibt: k = 15" },
    ],
    result: "Ablehnungsbereich {X ≥ 15}  (Annahme für X ≤ 14)",
    mistakes: [
      "Den zweiseitigen z-Wert 1,96 statt des einseitigen 1,64 verwenden.",
      "Die Grenze 14,92 auf 14 abrunden – für ein Niveau ≤ 5 % muss beim rechtsseitigen Test aufgerundet werden.",
    ],
    locked: false,
  },
  {
    id: "sl16",
    tag: "Normalapproximation (Intervall)",
    src: "Original-Übung · LK-Stil S16",
    q: "X ~ B(100; 0,5) mit μ = 50 und σ = 5. Schätzen Sie mit der Normalverteilung P(45 ≤ X ≤ 55) (mit Stetigkeitskorrektur).",
    steps: [
      { label: "Stetigkeitskorrektur", math: "P(45 ≤ X ≤ 55) ≈ P(44,5 ≤ X ≤ 55,5)" },
      { label: "Grenzen standardisieren", math: "z₁ = (44,5 − 50)/5 = −1,1;  z₂ = (55,5 − 50)/5 = 1,1" },
      { label: "Über Φ ausdrücken", math: "P = Φ(1,1) − Φ(−1,1) = 2·Φ(1,1) − 1" },
      { label: "Tabellenwert einsetzen", math: "= 2·0,8643 − 1 = 0,7286" },
    ],
    result: "P(45 ≤ X ≤ 55) ≈ 0,729",
    mistakes: [
      "Die Stetigkeitskorrektur nur an einer Grenze anwenden – bei einem Intervall werden beide Grenzen um 0,5 nach außen verschoben.",
      "Φ(−1,1) = −Φ(1,1) setzen; richtig ist Φ(−z) = 1 − Φ(z).",
    ],
    locked: false,
  },
  {
    id: "sl17",
    tag: "Vierfeldertafel & bedingte W.",
    src: "Original-Übung · LK-Stil S17",
    q: "In einer Firma sind 60 % der Beschäftigten Frauen (F), 30 % arbeiten in Teilzeit (T), 20 % sind Frauen in Teilzeit. Stellen Sie die Vierfeldertafel auf und berechnen Sie P(T | F).",
    steps: [
      { label: "Gegebene Felder", math: "P(F) = 0,6,  P(T) = 0,3,  P(F∩T) = 0,2" },
      { label: "Frauen-Zeile ergänzen", math: "F∩T = 0,2,  F∩T̄ = 0,6 − 0,2 = 0,4" },
      { label: "Männer-Zeile ergänzen", math: "F̄∩T = 0,3 − 0,2 = 0,1,  F̄∩T̄ = 0,4 − 0,1 = 0,3" },
      { label: "Bedingte Wahrscheinlichkeit", math: "P(T | F) = P(F∩T) / P(F) = 0,2 / 0,6 = 1/3" },
    ],
    result: "P(T | F) = 1/3 ≈ 0,333",
    mistakes: [
      "P(T | F) mit P(F∩T) = 0,2 verwechseln – bei der bedingten W. wird durch P(F) = 0,6 geteilt.",
      "Die Randsummen falsch verteilen; jede Zeile und Spalte der Vierfeldertafel muss zur Randwahrscheinlichkeit passen.",
    ],
    locked: false,
  },
  {
    id: "sl18",
    tag: "Erwartungswert eines Spiels",
    src: "Original-Übung · LK-Stil S18",
    q: "Ein Spiel kostet 2 € Einsatz. Man erhält mit Wahrscheinlichkeit 0,1 eine Auszahlung von 10 €, mit 0,3 von 2 €, sonst nichts. Ist das Spiel fair? Berechnen Sie den erwarteten Reingewinn pro Spiel.",
    steps: [
      { label: "Erwartete Auszahlung", math: "E(A) = 10·0,1 + 2·0,3 + 0·0,6 = 1 + 0,6 = 1,6 €" },
      { label: "Einsatz abziehen", math: "Reingewinn = Auszahlung − 2 €" },
      { label: "Erwarteter Reingewinn", math: "E(G) = 1,6 − 2 = −0,4 €" },
      { label: "Bewertung", math: "E(G) < 0  →  das Spiel ist nicht fair (Nachteil für den Spieler)" },
    ],
    result: "E(G) = −0,40 € pro Spiel → nicht fair",
    mistakes: [
      "Den Einsatz von 2 € vergessen und nur die Auszahlung 1,6 € als Ergebnis nehmen.",
      "Die Wahrscheinlichkeit für „nichts\" (0,6) übersehen; alle Wahrscheinlichkeiten müssen sich zu 1 addieren.",
    ],
    locked: false,
  },
  {
    id: "sl19",
    tag: "Ziehen ohne Zurücklegen (Baum)",
    src: "Original-Übung · LK-Stil S19",
    q: "In einer Urne liegen 3 rote und 2 blaue Kugeln. Es werden nacheinander 2 Kugeln ohne Zurücklegen gezogen. Berechnen Sie die Wahrscheinlichkeit, dass beide Kugeln dieselbe Farbe haben.",
    steps: [
      { label: "Beide rot (Pfad r–r)", math: "3/5 · 2/4 = 6/20 = 3/10" },
      { label: "Beide blau (Pfad b–b)", math: "2/5 · 1/4 = 2/20 = 1/10" },
      { label: "Pfade addieren (gleiche Farbe)", math: "P = 3/10 + 1/10 = 4/10" },
    ],
    result: "P(gleiche Farbe) = 0,4",
    mistakes: [
      "Im zweiten Zug mit der ursprünglichen Anzahl rechnen – ohne Zurücklegen sinkt der Nenner von 5 auf 4.",
      "Nur einen Pfad (z. B. rot–rot) berücksichtigen und blau–blau vergessen.",
    ],
    locked: false,
  },
  {
    id: "sl20",
    tag: "Kombinatorik (Laplace)",
    src: "Original-Übung · LK-Stil S20",
    q: "Aus 10 Personen wird ein 3-köpfiges Team gelost. (a) Wie viele verschiedene Teams sind möglich? (b) Anna und Ben gehören zu den 10 – wie wahrscheinlich sind beide im Team?",
    steps: [
      { label: "(a) Anzahl der Teams", math: "C(10,3) = (10·9·8)/(3·2·1) = 120" },
      { label: "(b) günstige Teams", math: "Anna und Ben fix, 1 weitere aus 8: C(8,1) = 8" },
      { label: "Laplace-Wahrscheinlichkeit", math: "P = 8 / 120 = 1/15" },
    ],
    result: "(a) 120 Teams,  (b) P = 1/15 ≈ 0,067",
    mistakes: [
      "Mit der Reihenfolge rechnen (Variation statt Kombination) – im Team spielt die Reihenfolge keine Rolle.",
      "Bei (b) die dritte Person vergessen: Anna und Ben sind gesetzt, aber ein weiteres Mitglied kommt hinzu.",
    ],
    locked: false,
  },
  {
    id: "sl21",
    tag: "Lineare Transformation (E & σ)",
    src: "Original-Übung · LK-Stil S21",
    q: "Für eine Zufallsgröße X gilt E(X) = 4 und σ(X) = 2. Betrachtet wird Y = 3X − 5. Bestimmen Sie E(Y) und σ(Y).",
    steps: [
      { label: "Erwartungswert (linear)", math: "E(Y) = 3·E(X) − 5 = 3·4 − 5 = 7" },
      { label: "Varianz (Konstante fällt weg)", math: "Var(Y) = 3² · Var(X) = 9 · 2² = 9 · 4 = 36" },
      { label: "Standardabweichung", math: "σ(Y) = √36 = 6   (= |3| · σ(X) = 3·2)" },
    ],
    result: "E(Y) = 7,  σ(Y) = 6",
    mistakes: [
      "Bei der Varianz den Faktor quadrieren vergessen: Var(aX+b) = a²·Var(X), nicht a·Var(X).",
      "Die additive Konstante −5 auf die Standardabweichung anwenden – eine Verschiebung ändert σ nicht.",
    ],
    locked: false,
  },
  {
    id: "sl22",
    tag: "Additionssatz (Siebformel)",
    src: "Original-Übung · LK-Stil S22",
    q: "In einer Klasse spielen 60 % Fußball (F), 30 % Tennis (T) und 20 % beides. Berechnen Sie P(F ∪ T) und die Wahrscheinlichkeit, dass jemand keine der beiden Sportarten spielt.",
    steps: [
      { label: "Additionssatz", math: "P(F ∪ T) = P(F) + P(T) − P(F ∩ T)" },
      { label: "Werte einsetzen", math: "= 0,6 + 0,3 − 0,2 = 0,7" },
      { label: "Gegenereignis", math: "P(keine) = 1 − P(F ∪ T) = 1 − 0,7" },
    ],
    result: "P(F ∪ T) = 0,7,  P(keine) = 0,3",
    mistakes: [
      "Den Überschneidungsterm P(F ∩ T) vergessen und einfach 0,6 + 0,3 = 0,9 rechnen (Doppelzählung).",
      "„Keine der beiden\" mit P(F ∩ T) verwechseln; gemeint ist das Gegenereignis zu F ∪ T.",
    ],
    locked: false,
  },
];
