// 22 originale Übungsaufgaben "Lineare Algebra / Geometrie" im Abitur-Stil (Mathe-Abi Hessen, Grundkurs).
// Selbst formuliert – NICHT aus echten Klausuren kopiert.
// Struktur kompatibel mit dem Task-Typ der Plattform (TopicView), erweitert um "mistakes".

export interface LinalgTask {
  id: string;
  tag: string;                                 // Themen-Kategorie
  src: string;                                 // Quelle (Original-Übung im Abi-Stil)
  q: string;                                   // Aufgabentext
  steps: { label: string; math: string }[];   // Lösungsweg in nachvollziehbaren Schritten
  result: string;                              // Endergebnis
  mistakes: string[];                          // 2 typische Fehler
  locked: boolean;
  videoId?: string;                            // passendes Erklärvideo (scenes.ts)
}

export const LINALG_TASKS: LinalgTask[] = [
  {
    id: "lg1",
    tag: "Betrag & Abstand",
    src: "Original-Übung · Abi-Stil B1",
    q: "Gegeben sind die Punkte A(1|1|1) und B(3|4|7). Berechnen Sie die Länge der Strecke AB.",
    steps: [
      { label: "Verbindungsvektor", math: "AB = B − A = (3−1, 4−1, 7−1) = (2, 3, 6)" },
      { label: "Betrag (Länge) berechnen", math: "|AB| = √(2² + 3² + 6²) = √(4 + 9 + 36) = √49" },
    ],
    result: "|AB| = 7 LE",
    mistakes: [
      "Beim Verbindungsvektor A und B vertauschen – richtig ist immer „Spitze minus Fuß\", also B − A.",
      "Unter der Wurzel die Quadrate vergessen und 2 + 3 + 6 rechnen; jede Komponente muss quadriert werden.",
    ],
    locked: false,
  },
  {
    id: "lg2",
    tag: "Mittelpunkt",
    src: "Original-Übung · Abi-Stil B2",
    q: "Bestimmen Sie den Mittelpunkt M der Strecke AB mit A(2|−1|4) und B(6|3|−2).",
    steps: [
      { label: "Formel für den Mittelpunkt", math: "M = ½ · (A + B)  (komponentenweiser Durchschnitt)" },
      { label: "Einsetzen", math: "M = ( (2+6)/2,  (−1+3)/2,  (4+(−2))/2 )" },
      { label: "Berechnen", math: "M = ( 8/2,  2/2,  2/2 )" },
    ],
    result: "M(4 | 1 | 1)",
    mistakes: [
      "Die Koordinaten subtrahieren statt zu addieren – für den Mittelpunkt wird der Durchschnitt (A + B) : 2 gebildet.",
      "Bei negativen Koordinaten das Vorzeichen falsch behandeln: 4 + (−2) = 2, nicht 6.",
    ],
    locked: false,
  },
  {
    id: "lg3",
    tag: "Skalarprodukt & Winkel",
    videoId: "v4",
    src: "Original-Übung · Abi-Stil B3",
    q: "Berechnen Sie die Größe des Winkels zwischen den Vektoren a = (1, 0, 1) und b = (0, 1, 1).",
    steps: [
      { label: "Skalarprodukt", math: "a · b = 1·0 + 0·1 + 1·1 = 1" },
      { label: "Beträge der Vektoren", math: "|a| = √2,  |b| = √2" },
      { label: "Winkelformel", math: "cos φ = (a · b) / (|a| · |b|) = 1 / (√2 · √2) = 1/2" },
      { label: "Winkel bestimmen", math: "φ = cos⁻¹(0,5) = 60°" },
    ],
    result: "φ = 60°",
    mistakes: [
      "Skalarprodukt und Kreuzprodukt verwechseln – für den Winkel braucht man das Skalarprodukt (eine Zahl).",
      "Vergessen, durch das Produkt der Beträge zu teilen, und cos φ direkt aus dem Skalarprodukt ablesen.",
    ],
    locked: false,
  },
  {
    id: "lg4",
    tag: "Orthogonalität",
    videoId: "v4",
    src: "Original-Übung · Abi-Stil B4",
    q: "Prüfen Sie, ob die Vektoren u = (2, 3, −1) und v = (1, 1, 5) senkrecht zueinander stehen.",
    steps: [
      { label: "Skalarprodukt bilden", math: "u · v = 2·1 + 3·1 + (−1)·5" },
      { label: "Berechnen", math: "= 2 + 3 − 5 = 0" },
      { label: "Deuten", math: "Skalarprodukt = 0  →  die Vektoren stehen senkrecht (orthogonal)" },
    ],
    result: "u · v = 0  →  u ⊥ v (senkrecht)",
    mistakes: [
      "Beim letzten Summanden das Vorzeichen vergessen: (−1)·5 = −5, nicht +5.",
      "Glauben, parallele Vektoren hätten Skalarprodukt 0 – senkrecht heißt Skalarprodukt 0, parallel heißt Vielfaches voneinander.",
    ],
    locked: false,
  },
  {
    id: "lg5",
    tag: "Kollinearität",
    src: "Original-Übung · Abi-Stil B5",
    q: "Liegen die Punkte A(1|2|3), B(3|5|7) und C(5|8|11) auf einer gemeinsamen Geraden?",
    steps: [
      { label: "Vektor AB", math: "AB = B − A = (2, 3, 4)" },
      { label: "Vektor AC", math: "AC = C − A = (4, 6, 8)" },
      { label: "Vielfaches prüfen", math: "AC = (4, 6, 8) = 2 · (2, 3, 4) = 2 · AB" },
    ],
    result: "Ja, A, B, C sind kollinear (AC = 2 · AB)",
    mistakes: [
      "Nur eine Komponente prüfen – kollinear ist es nur, wenn ALLE Komponenten denselben Faktor ergeben (hier durchgehend 2).",
      "Statt AB und AC von A aus zu bilden, Vektoren mit unterschiedlichen Aufpunkten vergleichen und so falsch folgern.",
    ],
    locked: false,
  },
  {
    id: "lg6",
    tag: "Gerade & Punktprobe",
    videoId: "v5",
    src: "Original-Übung · Abi-Stil B6",
    q: "Stellen Sie die Gleichung der Geraden g durch A(1|2|0) und B(3|6|4) auf und prüfen Sie, ob P(4|8|6) auf g liegt.",
    steps: [
      { label: "Richtungsvektor", math: "AB = B − A = (2, 4, 4)" },
      { label: "Geradengleichung", math: "g: x = (1, 2, 0) + t · (2, 4, 4)" },
      { label: "Punktprobe (1. Koordinate)", math: "1 + 2t = 4  →  t = 1,5" },
      { label: "übrige Koordinaten prüfen", math: "2 + 4·1,5 = 8 ✓ und 0 + 4·1,5 = 6 ✓" },
    ],
    result: "g: x = (1, 2, 0) + t·(2, 4, 4);  P liegt auf g (t = 1,5)",
    mistakes: [
      "Bei der Punktprobe nur eine Gleichung lösen – derselbe Parameter t muss in ALLEN drei Koordinaten passen.",
      "Aufpunkt und Richtungsvektor vertauschen, also (2, 4, 4) als Stützpunkt statt als Richtung verwenden.",
    ],
    locked: false,
  },
  {
    id: "lg7",
    tag: "Schnittpunkt zweier Geraden",
    videoId: "v5",
    src: "Original-Übung · Abi-Stil B7",
    q: "Bestimmen Sie den Schnittpunkt der Geraden g: x = (1, 0, 1) + s·(1, 2, 1) und h: x = (2, 3, 3) + t·(1, 1, 0).",
    steps: [
      { label: "Gleichsetzen", math: "(1+s, 2s, 1+s) = (2+t, 3+t, 3)" },
      { label: "3. Gleichung (z)", math: "1 + s = 3  →  s = 2" },
      { label: "1. Gleichung (x)", math: "1 + 2 = 2 + t  →  t = 1" },
      { label: "Probe (y-Gleichung)", math: "2·2 = 3 + 1  →  4 = 4 ✓ (Schnittpunkt existiert)" },
      { label: "Schnittpunkt einsetzen", math: "x = (1+2, 2·2, 1+2) = (3, 4, 3)" },
    ],
    result: "Schnittpunkt S(3 | 4 | 3)",
    mistakes: [
      "Für beide Geraden denselben Parameter verwenden – jede Gerade braucht einen eigenen (s und t).",
      "Die dritte Gleichung nicht zur Probe nutzen; ohne Probe übersieht man windschiefe Geraden (kein Schnittpunkt).",
    ],
    locked: false,
  },
  {
    id: "lg8",
    tag: "Rechtwinkliges Dreieck",
    src: "Original-Übung · Abi-Stil B8",
    q: "Zeigen Sie, dass das Dreieck mit den Eckpunkten A(0|0|0), B(2|2|1) und C(1|−1|0) bei A einen rechten Winkel hat.",
    steps: [
      { label: "Vektor AB", math: "AB = (2, 2, 1)" },
      { label: "Vektor AC", math: "AC = (1, −1, 0)" },
      { label: "Skalarprodukt", math: "AB · AC = 2·1 + 2·(−1) + 1·0 = 2 − 2 + 0 = 0" },
      { label: "Deuten", math: "AB · AC = 0  →  AB ⊥ AC, also rechter Winkel bei A" },
    ],
    result: "AB · AC = 0  →  rechter Winkel bei A",
    mistakes: [
      "Das Skalarprodukt der falschen Vektoren bilden – für den Winkel BEI A braucht man die von A ausgehenden Vektoren AB und AC.",
      "Aus |AB| = |AC| auf einen rechten Winkel schließen; gleich lange Seiten bedeuten gleichschenklig, nicht rechtwinklig.",
    ],
    locked: false,
  },
  {
    id: "lg9",
    tag: "Parallelogramm",
    src: "Original-Übung · Abi-Stil B9",
    q: "Die Punkte A(1|2|1), B(4|3|2) und C(6|7|5) sind drei Eckpunkte eines Parallelogramms ABCD. Bestimmen Sie den vierten Punkt D.",
    steps: [
      { label: "Bedingung im Parallelogramm", math: "Bei ABCD gilt AD = BC (gegenüberliegende Seiten sind gleich)" },
      { label: "Vektor BC", math: "BC = C − B = (2, 4, 3)" },
      { label: "D berechnen", math: "D = A + BC = (1+2, 2+4, 1+3)" },
    ],
    result: "D(3 | 6 | 4)",
    mistakes: [
      "Die Eckpunkt-Reihenfolge missachten: bei ABCD gilt AD = BC, nicht AD = CB – sonst landet D falsch.",
      "Irgendeine Kombination raten, statt die Bedingung AD = BC sauber anzuwenden.",
    ],
    locked: false,
  },
  {
    id: "lg10",
    tag: "Dreiecksfläche (Kreuzprodukt)",
    src: "Original-Übung · Abi-Stil B10",
    q: "Berechnen Sie den Flächeninhalt des Dreiecks mit den Eckpunkten A(1|1|1), B(2|3|3) und C(3|−1|2).",
    steps: [
      { label: "Vektoren aufstellen", math: "AB = (1, 2, 2),  AC = (2, −2, 1)" },
      { label: "Kreuzprodukt AB × AC", math: "= (2·1 − 2·(−2),  2·2 − 1·1,  1·(−2) − 2·2) = (6, 3, −6)" },
      { label: "Betrag des Kreuzprodukts", math: "|AB × AC| = √(6² + 3² + (−6)²) = √(36+9+36) = √81 = 9" },
      { label: "Dreiecksfläche", math: "A = ½ · |AB × AC| = ½ · 9" },
    ],
    result: "A = 4,5 FE",
    mistakes: [
      "Den Faktor ½ vergessen – das Kreuzprodukt liefert die Parallelogrammfläche, das Dreieck ist halb so groß.",
      "Beim Kreuzprodukt die Formel verwechseln; besonders das Vorzeichen der mittleren Komponente beachten.",
    ],
    locked: false,
  },
  {
    id: "lg11",
    tag: "Ebene (Koordinatenform)",
    src: "Original-Übung · Abi-Stil B11",
    q: "Bestimmen Sie eine Koordinatengleichung der Ebene E mit dem Normalenvektor n = (2, −1, 2), die durch den Punkt P(1|2|3) verläuft.",
    steps: [
      { label: "Ansatz mit Normalenvektor", math: "E: 2x − y + 2z = d  (Koeffizienten = Komponenten von n)" },
      { label: "d über den Punkt P", math: "d = 2·1 − 1·2 + 2·3 = 2 − 2 + 6 = 6" },
    ],
    result: "E: 2x − y + 2z = 6",
    mistakes: [
      "Die Komponenten des Normalenvektors nicht als Koeffizienten von x, y, z übernehmen.",
      "Beim Einsetzen von P das Vorzeichen der mittleren Komponente vergessen: −1·2 = −2.",
    ],
    locked: false,
  },
  {
    id: "lg12",
    tag: "Spurpunkte einer Ebene",
    src: "Original-Übung · Abi-Stil B12",
    q: "Bestimmen Sie die Spurpunkte (Schnittpunkte mit den Koordinatenachsen) der Ebene E: 2x + 3y + 6z = 12.",
    steps: [
      { label: "x-Achse (y = z = 0)", math: "2x = 12  →  x = 6  →  Sx(6 | 0 | 0)" },
      { label: "y-Achse (x = z = 0)", math: "3y = 12  →  y = 4  →  Sy(0 | 4 | 0)" },
      { label: "z-Achse (x = y = 0)", math: "6z = 12  →  z = 2  →  Sz(0 | 0 | 2)" },
    ],
    result: "Sx(6|0|0),  Sy(0|4|0),  Sz(0|0|2)",
    mistakes: [
      "Beim Spurpunkt einer Achse nicht beide anderen Koordinaten null setzen.",
      "Die Division falsch durchführen, z. B. 12 : 6 = 2 mit 12 · 6 verwechseln.",
    ],
    locked: false,
  },
  {
    id: "lg13",
    tag: "Schnitt Gerade–Ebene",
    src: "Original-Übung · Abi-Stil B13",
    q: "Bestimmen Sie den Schnittpunkt der Geraden g: x = (1, 0, 2) + t·(2, 1, 1) mit der Ebene E: x + y + z = 11.",
    steps: [
      { label: "Geradenkoordinaten einsetzen", math: "(1+2t) + (0+t) + (2+t) = 11" },
      { label: "Zusammenfassen", math: "3 + 4t = 11" },
      { label: "t bestimmen", math: "4t = 8  →  t = 2" },
      { label: "t in g einsetzen", math: "x = (1+4, 0+2, 2+2) = (5, 2, 4)" },
    ],
    result: "Schnittpunkt S(5 | 2 | 4)",
    mistakes: [
      "Nur den Aufpunkt der Geraden in die Ebene einsetzen, statt die komplette Geradengleichung mit dem Parameter t.",
      "Den gefundenen Wert t nicht in die Geradengleichung zurücksetzen – t allein ist noch nicht der Schnittpunkt.",
    ],
    locked: false,
  },
  {
    id: "lg14",
    tag: "Abstand Punkt–Ebene",
    src: "Original-Übung · Abi-Stil B14",
    q: "Berechnen Sie den Abstand des Punktes P(2|−1|5) von der Ebene E: 2x − y + 2z = 6.",
    steps: [
      { label: "Abstandsformel (Hesse)", math: "d = |2·Px − Py + 2·Pz − 6| / |n|  mit n = (2, −1, 2)" },
      { label: "Betrag des Normalenvektors", math: "|n| = √(2² + (−1)² + 2²) = √9 = 3" },
      { label: "Zähler einsetzen", math: "|2·2 − (−1) + 2·5 − 6| = |4 + 1 + 10 − 6| = |9| = 9" },
      { label: "Abstand", math: "d = 9 / 3" },
    ],
    result: "d = 3 LE",
    mistakes: [
      "Vergessen, durch den Betrag des Normalenvektors zu teilen (hier ÷ 3).",
      "Im Zähler die rechte Seite (− 6) nicht abziehen oder den Betrag weglassen, sodass ein negativer „Abstand\" entsteht.",
    ],
    locked: false,
  },
  {
    id: "lg15",
    tag: "Einheitsvektor",
    src: "Original-Übung · Abi-Stil B15",
    q: "Bestimmen Sie einen Vektor der Länge 6, der in dieselbe Richtung wie a = (2, −1, 2) zeigt.",
    steps: [
      { label: "Betrag von a", math: "|a| = √(2² + (−1)² + 2²) = √9 = 3" },
      { label: "Einheitsvektor (Länge 1)", math: "a⁰ = (1/|a|)·a = (2/3, −1/3, 2/3)" },
      { label: "Auf Länge 6 strecken", math: "6 · a⁰ = (4, −2, 4)" },
    ],
    result: "v = (4, −2, 4)   (Länge 6, Richtung von a)",
    mistakes: [
      "Nur den Einheitsvektor bilden und das Strecken auf die gewünschte Länge (· 6) vergessen.",
      "Beim Normieren mit |a| multiplizieren statt zu dividieren – der Einheitsvektor ist a geteilt durch |a|.",
    ],
    locked: false,
  },
  {
    id: "lg16",
    tag: "Schwerpunkt",
    src: "Original-Übung · Abi-Stil B16",
    q: "Bestimmen Sie den Schwerpunkt S des Dreiecks mit den Eckpunkten A(1|2|0), B(4|−1|3) und C(1|2|3).",
    steps: [
      { label: "Formel für den Schwerpunkt", math: "S = ⅓ · (A + B + C)" },
      { label: "Komponenten addieren", math: "( 1+4+1,  2+(−1)+2,  0+3+3 ) = (6, 3, 6)" },
      { label: "Durch 3 teilen", math: "S = (6/3, 3/3, 6/3)" },
    ],
    result: "S(2 | 1 | 2)",
    mistakes: [
      "Durch 2 statt durch 3 teilen – ein Dreieck hat drei Eckpunkte, also Summe geteilt durch 3.",
      "Die Ortsvektoren subtrahieren statt addieren; der Schwerpunkt ist der Durchschnitt aller drei Punkte.",
    ],
    locked: false,
  },
  {
    id: "lg17",
    tag: "Lagebeziehung Geraden",
    src: "Original-Übung · Abi-Stil B17",
    q: "Untersuchen Sie die Lage der Geraden g: x = (1, 0, 0) + s·(1, 2, 3) und h: x = (0, 0, 1) + t·(2, 4, 6) zueinander.",
    steps: [
      { label: "Richtungsvektoren vergleichen", math: "(2, 4, 6) = 2 · (1, 2, 3)  →  Richtungen parallel" },
      { label: "Identisch? Aufpunkt (0,0,1) von h in g?", math: "1. Koord.: 1 + s = 0  →  s = −1" },
      { label: "Kontrolle mit s = −1", math: "2. Koord.: 0 + 2·(−1) = −2 ≠ 0  →  Aufpunkt liegt NICHT auf g" },
    ],
    result: "g und h sind echt parallel (nicht identisch, kein Schnittpunkt)",
    mistakes: [
      "Aus parallelen Richtungsvektoren sofort auf „identisch\" schließen – erst die Punktprobe entscheidet zwischen echt parallel und identisch.",
      "Bei der Punktprobe nur die erste Koordinate prüfen; der Parameter s muss in ALLEN Koordinaten passen.",
    ],
    locked: false,
  },
  {
    id: "lg18",
    tag: "Lagebeziehung Gerade–Ebene",
    src: "Original-Übung · Abi-Stil B18",
    q: "Untersuchen Sie die Lage der Geraden g: x = (1, 1, 1) + t·(1, 1, −2) zur Ebene E: x + y + z = 10.",
    steps: [
      { label: "Normalenvektor der Ebene", math: "n = (1, 1, 1)" },
      { label: "Richtungsvektor · Normalenvektor", math: "(1, 1, −2) · (1, 1, 1) = 1 + 1 − 2 = 0  →  Richtung ⊥ n" },
      { label: "In der Ebene? Aufpunkt (1,1,1) prüfen", math: "1 + 1 + 1 = 3 ≠ 10  →  Aufpunkt liegt NICHT in E" },
    ],
    result: "g ist echt parallel zur Ebene E (kein Schnittpunkt)",
    mistakes: [
      "Aus „Richtung · n = 0\" sofort „kein Schnittpunkt\" folgern – die Gerade könnte auch komplett IN der Ebene liegen; das klärt die Punktprobe.",
      "Statt Richtung · n das Skalarprodukt mit dem Aufpunkt bilden; für die Lage zählt der Richtungsvektor gegen den Normalenvektor.",
    ],
    locked: false,
  },
  {
    id: "lg19",
    tag: "Ebene aus 3 Punkten",
    src: "Original-Übung · Abi-Stil B19",
    q: "Stellen Sie eine Parametergleichung der Ebene E durch die Punkte A(1|0|0), B(0|1|0) und C(0|0|1) auf.",
    steps: [
      { label: "Stützpunkt wählen", math: "Aufpunkt A(1, 0, 0)" },
      { label: "Erster Spannvektor", math: "AB = B − A = (−1, 1, 0)" },
      { label: "Zweiter Spannvektor", math: "AC = C − A = (−1, 0, 1)" },
      { label: "Parameterform aufstellen", math: "E: x = (1,0,0) + s·(−1,1,0) + t·(−1,0,1)" },
    ],
    result: "E: x = (1, 0, 0) + s·(−1, 1, 0) + t·(−1, 0, 1)",
    mistakes: [
      "Die Spannvektoren zwischen wechselnden Punkten bilden, ohne für beide denselben Stützpunkt (hier A) zu verwenden.",
      "Zwei parallele oder gleiche Spannvektoren wählen; sie müssen verschiedene Richtungen haben, sonst spannen sie keine Ebene auf.",
    ],
    locked: false,
  },
  {
    id: "lg20",
    tag: "Parameter- zu Koordinatenform",
    src: "Original-Übung · Abi-Stil B20",
    q: "Bestimmen Sie eine Koordinatengleichung der Ebene E: x = (2, 0, 0) + s·(1, 1, 0) + t·(1, 0, 1).",
    steps: [
      { label: "Normalenvektor per Kreuzprodukt", math: "n = (1,1,0) × (1,0,1)" },
      { label: "Kreuzprodukt berechnen", math: "= (1·1 − 0·0,  0·1 − 1·1,  1·0 − 1·1) = (1, −1, −1)" },
      { label: "Ansatz Koordinatenform", math: "x − y − z = d" },
      { label: "d über den Stützpunkt (2,0,0)", math: "d = 2 − 0 − 0 = 2" },
    ],
    result: "E: x − y − z = 2",
    mistakes: [
      "Die mittlere Komponente des Kreuzprodukts mit falschem Vorzeichen berechnen – die „Mitte\" trägt das Minus.",
      "d aus einem Spannvektor statt aus dem Stützpunkt bestimmen; eingesetzt wird der Ortspunkt der Ebene.",
    ],
    locked: false,
  },
  {
    id: "lg21",
    tag: "Punktspiegelung",
    src: "Original-Übung · Abi-Stil B21",
    q: "Spiegeln Sie den Punkt P(1|2|3) am Punkt Z(4|4|4). Bestimmen Sie den Bildpunkt P'.",
    steps: [
      { label: "Z ist Mittelpunkt von P und P'", math: "Z = ½ · (P + P')" },
      { label: "Nach P' umstellen", math: "P' = 2·Z − P" },
      { label: "Einsetzen", math: "P' = (2·4 − 1,  2·4 − 2,  2·4 − 3) = (7, 6, 5)" },
    ],
    result: "P'(7 | 6 | 5)",
    mistakes: [
      "P' = 2P − Z statt P' = 2Z − P bilden – gespiegelt wird um Z, deshalb steht Z im doppelten Term.",
      "Nur den Verbindungsvektor PZ angeben; der Bildpunkt liegt noch einmal dieselbe Strecke hinter Z.",
    ],
    locked: false,
  },
  {
    id: "lg22",
    tag: "Raute (Nachweis)",
    src: "Original-Übung · Abi-Stil B22",
    q: "Zeigen Sie, dass das Viereck ABCD mit A(0|0|0), B(2|1|2), C(3|3|4) und D(1|2|2) eine Raute ist.",
    steps: [
      { label: "Seitenvektoren", math: "AB = (2,1,2),  BC = (1,2,2),  CD = (−2,−1,−2),  DA = (−1,−2,−2)" },
      { label: "Längen berechnen", math: "|AB| = √(4+1+4) = 3;  |BC| = √(1+4+4) = 3" },
      { label: "Restliche Seiten", math: "|CD| = 3,  |DA| = 3  →  alle Seiten gleich lang" },
      { label: "Parallelogramm nachweisen", math: "AB = DC = (2,1,2)  →  gegenüberliegende Seiten parallel & gleich" },
    ],
    result: "Alle vier Seiten sind 3 LE lang und ABCD ist ein Parallelogramm  →  Raute",
    mistakes: [
      "Nur gleiche Seitenlängen zeigen – im Raum muss zusätzlich AB = DC gelten, sonst ist es kein (ebenes) Parallelogramm.",
      "Beim Betrag die Vorzeichen „mitschleppen\"; durch das Quadrieren wird ohnehin alles positiv, (−2)² = 4.",
    ],
    locked: false,
  },
];
