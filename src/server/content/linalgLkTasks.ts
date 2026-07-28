// 22 originale Übungsaufgaben "Lineare Algebra / Geometrie" auf LEISTUNGSKURS-Niveau (Mathe-Abi Hessen).
// Selbst formuliert – NICHT aus echten Klausuren kopiert.
// Schwerpunkte: Ebenen, Schnittgeraden, Winkel, windschiefe Geraden, Abstände, Lot-/Spiegelpunkt, LGS, Matrizen.

export interface LinalgLkTask {
  id: string;
  tag: string;
  src: string;
  q: string;
  steps: { label: string; math: string }[];
  result: string;
  mistakes: string[];
  locked: boolean;
}

export const LINALG_LK_TASKS: LinalgLkTask[] = [
  {
    id: "ll1",
    tag: "Ebene durch 3 Punkte",
    src: "Original-Übung · LK-Stil G1",
    q: "Bestimmen Sie eine Koordinatengleichung der Ebene E durch A(1|0|0), B(0|2|0) und C(0|0|3).",
    steps: [
      { label: "Spannvektoren", math: "AB = B − A = (−1, 2, 0),  AC = C − A = (−1, 0, 3)" },
      { label: "Normalenvektor über Kreuzprodukt", math: "n = AB × AC = (2·3 − 0·0,  0·(−1) − (−1)·3,  (−1)·0 − 2·(−1)) = (6, 3, 2)" },
      { label: "Ansatz Koordinatenform", math: "6x + 3y + 2z = d" },
      { label: "Punkt A einsetzen", math: "6·1 + 3·0 + 2·0 = 6  →  d = 6" },
    ],
    result: "E: 6x + 3y + 2z = 6",
    mistakes: [
      "Beim Kreuzprodukt die mittlere Komponente ohne Vorzeichenwechsel berechnen – die zweite Zeile bekommt ein Minus.",
      "d weglassen und n nur als Richtung nutzen; d wird durch Einsetzen eines Punktes der Ebene bestimmt.",
    ],
    locked: false,
  },
  {
    id: "ll2",
    tag: "Schnittgerade zweier Ebenen",
    src: "Original-Übung · LK-Stil G2",
    q: "Bestimmen Sie die Schnittgerade der Ebenen E₁: x + z = 4 und E₂: x + y + z = 6.",
    steps: [
      { label: "Gleichungen subtrahieren", math: "E₂ − E₁:  y = 2" },
      { label: "Freien Parameter wählen", math: "Setze z = t  (t ∈ ℝ)" },
      { label: "Restgröße ausdrücken", math: "aus E₁:  x = 4 − z = 4 − t" },
      { label: "Geradengleichung zusammensetzen", math: "g: X = (4, 2, 0) + t·(−1, 0, 1)" },
    ],
    result: "g: X = (4 | 2 | 0) + t · (−1 | 0 | 1)",
    mistakes: [
      "Versuchen, eine eindeutige Lösung zu bestimmen – zwei Ebenen schneiden sich in einer ganzen Geraden, ein Parameter bleibt frei.",
      "Den Richtungsvektor aus den Normalenvektoren raten, statt ihn über den frei gewählten Parameter sauber abzulesen.",
    ],
    locked: false,
  },
  {
    id: "ll3",
    tag: "Winkel zwischen Ebenen",
    src: "Original-Übung · LK-Stil G3",
    q: "Berechnen Sie den Schnittwinkel der Ebenen E₁: x + y = 1 und E₂: y + z = 3.",
    steps: [
      { label: "Normalenvektoren ablesen", math: "n₁ = (1, 1, 0),  n₂ = (0, 1, 1)" },
      { label: "Skalarprodukt", math: "n₁ · n₂ = 1·0 + 1·1 + 0·1 = 1" },
      { label: "Beträge", math: "|n₁| = √2,  |n₂| = √2" },
      { label: "Winkelformel (Betrag im Zähler)", math: "cos φ = |n₁ · n₂| / (|n₁|·|n₂|) = 1 / (√2·√2) = 1/2" },
      { label: "Winkel", math: "φ = cos⁻¹(0,5) = 60°" },
    ],
    result: "φ = 60°",
    mistakes: [
      "Den Betrag im Zähler vergessen – beim Schnittwinkel zweier Ebenen nimmt man immer den spitzen Winkel.",
      "Mit Stützvektoren oder Punkten rechnen; für den Winkel zählen nur die Normalenvektoren.",
    ],
    locked: false,
  },
  {
    id: "ll4",
    tag: "Winkel Gerade–Ebene",
    src: "Original-Übung · LK-Stil G4",
    q: "Berechnen Sie den Schnittwinkel zwischen der Geraden g: X = (0,0,1) + t·(1, 0, 0) und der Ebene E: 2x + y + 2z = 4.",
    steps: [
      { label: "Richtungs- und Normalenvektor", math: "u = (1, 0, 0),  n = (2, 1, 2)" },
      { label: "Skalarprodukt und Beträge", math: "u · n = 2,  |u| = 1,  |n| = √(4+1+4) = 3" },
      { label: "Sinusformel (Gerade–Ebene)", math: "sin α = |u · n| / (|u|·|n|) = 2 / (1·3) = 2/3" },
      { label: "Winkel", math: "α = sin⁻¹(2/3) ≈ 41,8°" },
    ],
    result: "α ≈ 41,8°",
    mistakes: [
      "cos statt sin verwenden – beim Winkel Gerade–Ebene steht das Skalarprodukt im Sinus, weil n senkrecht zur Ebene ist.",
      "Den Betrag im Zähler vergessen und einen negativen Winkel erhalten.",
    ],
    locked: false,
  },
  {
    id: "ll5",
    tag: "Windschiefe Geraden",
    src: "Original-Übung · LK-Stil G5",
    q: "Zeigen Sie, dass die Geraden g: X = (1,2,3) + s·(1, 0, 1) und h: X = (0,0,1) + t·(0, 1, 1) windschief sind.",
    steps: [
      { label: "Richtungsvektoren vergleichen", math: "(1, 0, 1) und (0, 1, 1) sind keine Vielfachen → nicht parallel" },
      { label: "Auf Schnittpunkt prüfen (gleichsetzen)", math: "(1+s, 2, 3+s) = (0, t, 1+t)" },
      { label: "Aus x- und y-Zeile", math: "x:  1 + s = 0 → s = −1;   y:  2 = t" },
      { label: "z-Zeile als Widerspruch", math: "3 + (−1) = 2,  aber 1 + 2 = 3  →  2 ≠ 3" },
    ],
    result: "Nicht parallel und kein Schnittpunkt → die Geraden sind windschief.",
    mistakes: [
      "Nur die Richtungsvektoren prüfen – nicht-parallel allein reicht nicht, man muss zusätzlich den Schnittpunkt ausschließen.",
      "Die gefundenen s und t nicht in die dritte Gleichung einsetzen und so den Widerspruch übersehen.",
    ],
    locked: false,
  },
  {
    id: "ll6",
    tag: "Abstand Punkt–Gerade",
    src: "Original-Übung · LK-Stil G6",
    q: "Berechnen Sie den Abstand des Punktes P(4|6|5) von der Geraden g: X = (1,2,0) + t·(0, 0, 1).",
    steps: [
      { label: "Aufpunkt und Richtung", math: "A(1|2|0),  u = (0, 0, 1);  AP = P − A = (3, 4, 5)" },
      { label: "Kreuzprodukt AP × u", math: "AP × u = (4·1 − 5·0,  5·0 − 3·1,  3·0 − 4·0) = (4, −3, 0)" },
      { label: "Beträge", math: "|AP × u| = √(16 + 9) = 5,  |u| = 1" },
      { label: "Abstandsformel", math: "d = |AP × u| / |u| = 5 / 1" },
    ],
    result: "d = 5 LE",
    mistakes: [
      "Direkt |AP| als Abstand nehmen – das ist nur der Abstand zum Aufpunkt, nicht der senkrechte Abstand zur Geraden.",
      "Beim Kreuzprodukt die mittlere Komponente ohne Vorzeichenwechsel rechnen.",
    ],
    locked: false,
  },
  {
    id: "ll7",
    tag: "Abstand windschiefer Geraden",
    src: "Original-Übung · LK-Stil G7",
    q: "Berechnen Sie den Abstand der windschiefen Geraden g: X = (1,0,0) + s·(1, 1, 0) und h: X = (0,0,1) + t·(1, −1, 0).",
    steps: [
      { label: "Richtungsvektoren", math: "u₁ = (1, 1, 0),  u₂ = (1, −1, 0)" },
      { label: "Gemeinsamer Normalenvektor", math: "n = u₁ × u₂ = (0, 0, −2),  |n| = 2" },
      { label: "Verbindungsvektor der Aufpunkte", math: "A₁A₂ = (0,0,1) − (1,0,0) = (−1, 0, 1)" },
      { label: "Abstandsformel (Projektion auf n)", math: "d = |A₁A₂ · n| / |n| = |0 + 0 − 2| / 2" },
    ],
    result: "d = 1 LE",
    mistakes: [
      "Den Betrag im Zähler vergessen; das Skalarprodukt kann negativ sein, der Abstand ist aber immer positiv.",
      "Durch |A₁A₂| statt durch |n| teilen – im Nenner steht die Länge des gemeinsamen Normalenvektors.",
    ],
    locked: false,
  },
  {
    id: "ll8",
    tag: "Lotfußpunkt",
    src: "Original-Übung · LK-Stil G8",
    q: "Bestimmen Sie den Lotfußpunkt F des Punktes P(4|2|3) auf der Geraden g: X = (1,1,1) + t·(1, 2, 2).",
    steps: [
      { label: "Allgemeiner Geradenpunkt", math: "F = (1+t, 1+2t, 1+2t)" },
      { label: "Lotbedingung PF ⊥ u", math: "PF = F − P = (t−3, 2t−1, 2t−2);  PF · (1,2,2) = 0" },
      { label: "Gleichung lösen", math: "(t−3) + 2(2t−1) + 2(2t−2) = 9t − 9 = 0  →  t = 1" },
      { label: "t einsetzen", math: "F = (1+1, 1+2, 1+2)" },
    ],
    result: "F(2 | 3 | 3)",
    mistakes: [
      "Die Lotbedingung mit dem Normalenvektor statt mit dem Richtungsvektor u der Geraden ansetzen.",
      "t in den Punkt P statt in die Geradengleichung einsetzen.",
    ],
    locked: false,
  },
  {
    id: "ll9",
    tag: "Spiegelpunkt an Ebene",
    src: "Original-Übung · LK-Stil G9",
    q: "Spiegeln Sie den Punkt P(4|1|1) an der Ebene E: x + y + z = 3.",
    steps: [
      { label: "Lotgerade durch P (Richtung = Normale)", math: "X = (4,1,1) + r·(1, 1, 1)" },
      { label: "Schnitt mit E (Lotfußpunkt)", math: "(4+r)+(1+r)+(1+r) = 3  →  6 + 3r = 3  →  r = −1" },
      { label: "Lotfußpunkt", math: "F = (4−1, 1−1, 1−1) = (3, 0, 0)" },
      { label: "Spiegelpunkt = P + 2r·n", math: "P' = (4,1,1) + 2·(−1)·(1,1,1) = (4−2, 1−2, 1−2)" },
    ],
    result: "P'(2 | −1 | −1)",
    mistakes: [
      "Den Lotfußpunkt F mit dem Spiegelpunkt verwechseln – F liegt in der Mitte zwischen P und P'.",
      "Nur r statt 2r für den Spiegelpunkt verwenden; der Spiegelpunkt liegt doppelt so weit wie der Lotfußpunkt.",
    ],
    locked: false,
  },
  {
    id: "ll10",
    tag: "Lineares Gleichungssystem",
    src: "Original-Übung · LK-Stil G10",
    q: "Lösen Sie das lineare Gleichungssystem: 2x + y − z = 1;  x − y + z = 2;  3x + 2y + z = 10.",
    steps: [
      { label: "Gleichung I und II addieren", math: "(2x + y − z) + (x − y + z) = 1 + 2  →  3x = 3  →  x = 1" },
      { label: "x in II einsetzen", math: "1 − y + z = 2  →  z = y + 1" },
      { label: "x und z in III einsetzen", math: "3 + 2y + (y + 1) = 10  →  3y = 6  →  y = 2" },
      { label: "z bestimmen", math: "z = y + 1 = 3" },
    ],
    result: "x = 1,  y = 2,  z = 3",
    mistakes: [
      "Beim Einsetzen ein Vorzeichen verlieren – jede Gleichung sorgfältig nach einer Variablen umstellen.",
      "Nach zwei gefundenen Werten die dritte Variable nicht durch Rückeinsetzen prüfen.",
    ],
    locked: false,
  },
  {
    id: "ll11",
    tag: "Übergangsmatrix",
    src: "Original-Übung · LK-Stil G11",
    q: "Zwei Anbieter A und B teilen sich einen Markt. Pro Jahr bleiben 75 % der A-Kunden bei A, 25 % wechseln zu B; von B bleiben 50 % bei B, 50 % wechseln zu A. Heute haben A 80 und B 20 (in Tausend). Wie sieht die Verteilung nach einem Jahr aus?",
    steps: [
      { label: "Übergangsmatrix aufstellen", math: "M = ( 0,75  0,5 ; 0,25  0,5 )   (Spalten: Herkunft A bzw. B)" },
      { label: "Startvektor", math: "v₀ = (80, 20)" },
      { label: "Matrix-Vektor-Produkt A-Zeile", math: "A: 0,75·80 + 0,5·20 = 60 + 10 = 70" },
      { label: "B-Zeile", math: "B: 0,25·80 + 0,5·20 = 20 + 10 = 30" },
    ],
    result: "Nach einem Jahr: A = 70,  B = 30 (in Tausend)",
    mistakes: [
      "Zeilen und Spalten der Übergangsmatrix vertauschen – pro Spalte müssen die Anteile zusammen 100 % ergeben.",
      "Prozentwerte und absolute Kundenzahlen vermischen; erst die Matrix mal den Bestandsvektor rechnen.",
    ],
    locked: false,
  },
  {
    id: "ll12",
    tag: "Volumen (Spatprodukt)",
    src: "Original-Übung · LK-Stil G12",
    q: "Berechnen Sie das Volumen des Tetraeders mit den Ecken A(1|1|1), B(3|1|1), C(1|4|1) und D(1|1|5).",
    steps: [
      { label: "Kantenvektoren von A aus", math: "AB = (2, 0, 0),  AC = (0, 3, 0),  AD = (0, 0, 4)" },
      { label: "Kreuzprodukt AB × AC", math: "AB × AC = (0, 0, 6)" },
      { label: "Spatprodukt (· AD)", math: "(AB × AC) · AD = 0 + 0 + 6·4 = 24" },
      { label: "Tetraeder-Formel", math: "V = ⅙ · |Spatprodukt| = ⅙ · 24" },
    ],
    result: "V = 4 VE",
    mistakes: [
      "Den Faktor ⅙ vergessen – das Spatprodukt liefert das Volumen des Spats, das Tetraeder ist ein Sechstel davon.",
      "Den Betrag des Spatprodukts vergessen; ein negatives Vorzeichen bedeutet nur die Orientierung, nicht ein negatives Volumen.",
    ],
    locked: false,
  },
  {
    id: "ll13",
    tag: "Kugelgleichung (quadr. Ergänzung)",
    src: "Original-Übung · LK-Stil G13",
    q: "Bestimmen Sie Mittelpunkt und Radius der Kugel x² + y² + z² − 4x + 2y − 6z + 5 = 0 und prüfen Sie, ob P(2|−1|7) auf, in oder außerhalb der Kugel liegt.",
    steps: [
      { label: "Quadratische Ergänzung je Variable", math: "x²−4x = (x−2)²−4;  y²+2y = (y+1)²−1;  z²−6z = (z−3)²−9" },
      { label: "Einsetzen und ordnen", math: "(x−2)² + (y+1)² + (z−3)² − 14 + 5 = 0" },
      { label: "Mittelpunkt und Radius ablesen", math: "(x−2)² + (y+1)² + (z−3)² = 9  →  M(2|−1|3),  r = 3" },
      { label: "Abstand M zu P prüfen", math: "|MP| = |(0, 0, 4)| = 4 > 3  →  P liegt außerhalb" },
    ],
    result: "M(2 | −1 | 3),  r = 3;  P liegt außerhalb (Abstand 4 > 3)",
    mistakes: [
      "Bei der quadratischen Ergänzung die abgezogene Konstante vergessen – aus x²−4x wird (x−2)² MINUS 4.",
      "r² und r verwechseln: rechts steht 9, der Radius ist die Wurzel, also r = 3.",
    ],
    locked: false,
  },
  {
    id: "ll14",
    tag: "Schnitt Gerade–Kugel",
    src: "Original-Übung · LK-Stil G14",
    q: "Bestimmen Sie die Schnittpunkte der Geraden g: X = (0,0,3) + t·(1, 0, 0) mit der Kugel x² + y² + z² = 25.",
    steps: [
      { label: "Geradenpunkt einsetzen", math: "Punkt auf g: (t, 0, 3)  →  t² + 0² + 3² = 25" },
      { label: "Gleichung lösen", math: "t² + 9 = 25  →  t² = 16  →  t = ±4" },
      { label: "t = 4 einsetzen", math: "S₁ = (4, 0, 3)" },
      { label: "t = −4 einsetzen", math: "S₂ = (−4, 0, 3)" },
    ],
    result: "S₁(4 | 0 | 3),  S₂(−4 | 0 | 3)",
    mistakes: [
      "Beim Wurzelziehen nur t = 4 angeben und den zweiten Schnittpunkt (t = −4) vergessen.",
      "Die Koordinaten der Geraden falsch einsetzen – y bleibt 0 und z bleibt 3, nur x hängt von t ab.",
    ],
    locked: false,
  },
  {
    id: "ll15",
    tag: "Abstand paralleler Ebenen",
    src: "Original-Übung · LK-Stil G15",
    q: "Berechnen Sie den Abstand der parallelen Ebenen E₁: 2x − y + 2z = 6 und E₂: 2x − y + 2z = 15.",
    steps: [
      { label: "Gleicher Normalenvektor", math: "n = (2, −1, 2),  |n| = √(4+1+4) = 3" },
      { label: "Parallelität bestätigen", math: "beide Ebenen haben dasselbe n, nur die rechte Seite unterscheidet sich" },
      { label: "Abstandsformel", math: "d = |d₂ − d₁| / |n| = |15 − 6| / 3 = 9/3" },
    ],
    result: "d = 3 LE",
    mistakes: [
      "Die rechten Seiten 6 und 15 direkt subtrahieren, ohne durch |n| zu teilen.",
      "|n| falsch berechnen – die Wurzel aus 2²+(−1)²+2² = 9 ist 3, nicht 9.",
    ],
    locked: false,
  },
  {
    id: "ll16",
    tag: "Lagebeziehung zweier Ebenen",
    src: "Original-Übung · LK-Stil G16",
    q: "Untersuchen Sie die Lage der Ebenen E₁: x + 2y − z = 3 und E₂: 2x + 4y − 2z = 10 zueinander.",
    steps: [
      { label: "Normalenvektoren vergleichen", math: "n₁ = (1, 2, −1),  n₂ = (2, 4, −2) = 2·n₁  →  parallel" },
      { label: "Auf Identität prüfen", math: "E₁ mit 2 multiplizieren: 2x + 4y − 2z = 6" },
      { label: "Rechte Seiten vergleichen", math: "6 ≠ 10  →  keine gemeinsamen Punkte" },
    ],
    result: "Die Ebenen sind echt parallel (kein Schnitt).",
    mistakes: [
      "Aus parallelen Normalenvektoren sofort auf „identisch\" schließen – die rechten Seiten müssen ebenfalls passen.",
      "E₁ nur teilweise mit 2 multiplizieren und die rechte Seite 3 unverändert lassen.",
    ],
    locked: false,
  },
  {
    id: "ll17",
    tag: "Stationäre Verteilung (Fixvektor)",
    src: "Original-Übung · LK-Stil G17",
    q: "Für die Übergangsmatrix M = ( 0,75  0,5 ; 0,25  0,5 ) soll die stationäre Verteilung v = (a, b) mit M·v = v und a + b = 1 bestimmt werden.",
    steps: [
      { label: "Fixvektorgleichung (A-Zeile)", math: "0,75a + 0,5b = a  →  0,5b = 0,25a  →  b = 0,5a" },
      { label: "Nebenbedingung nutzen", math: "a + b = 1  →  a + 0,5a = 1  →  1,5a = 1" },
      { label: "a bestimmen", math: "a = 1 / 1,5 = 2/3" },
      { label: "b bestimmen", math: "b = 1 − 2/3 = 1/3" },
    ],
    result: "Stationäre Verteilung v = (2/3, 1/3),  Verhältnis A : B = 2 : 1",
    mistakes: [
      "Die Nebenbedingung a + b = 1 vergessen – ohne sie ist das Gleichungssystem nicht eindeutig lösbar.",
      "Die Zeilen der Matrix mit den Spalten vertauschen und dadurch die falsche Fixvektorgleichung aufstellen.",
    ],
    locked: false,
  },
  {
    id: "ll18",
    tag: "Übergangsmatrix (2 Schritte)",
    src: "Original-Übung · LK-Stil G18",
    q: "Mit der Übergangsmatrix M = ( 0,75  0,5 ; 0,25  0,5 ) und dem Startvektor v₀ = (80, 20) (in Tausend): Bestimmen Sie die Verteilung nach zwei Jahren.",
    steps: [
      { label: "Nach einem Jahr: v₁ = M·v₀", math: "A: 0,75·80 + 0,5·20 = 70;  B: 0,25·80 + 0,5·20 = 30" },
      { label: "Zwischenstand", math: "v₁ = (70, 30)" },
      { label: "Nach zwei Jahren: v₂ = M·v₁", math: "A: 0,75·70 + 0,5·30 = 52,5 + 15 = 67,5" },
      { label: "B-Komponente", math: "B: 0,25·70 + 0,5·30 = 17,5 + 15 = 32,5" },
    ],
    result: "Nach zwei Jahren: A = 67,5,  B = 32,5 (in Tausend)",
    mistakes: [
      "M nur einmal anwenden – für zwei Jahre muss das Matrix-Vektor-Produkt zweimal (oder M² · v₀) gerechnet werden.",
      "Beim zweiten Schritt wieder mit dem Startvektor v₀ statt mit dem Zwischenergebnis v₁ rechnen.",
    ],
    locked: false,
  },
  {
    id: "ll19",
    tag: "Abstand Punkt–Ebene",
    src: "Original-Übung · LK-Stil G19",
    q: "Berechnen Sie den Abstand des Punktes P(3|3|3) von der Ebene E: x + y + z = 3 und geben Sie den Lotfußpunkt an.",
    steps: [
      { label: "Lotgerade durch P (Richtung = Normale)", math: "X = (3,3,3) + r·(1, 1, 1)" },
      { label: "Schnitt mit E", math: "(3+r)+(3+r)+(3+r) = 3  →  9 + 3r = 3  →  r = −2" },
      { label: "Lotfußpunkt", math: "F = (3−2, 3−2, 3−2) = (1, 1, 1)" },
      { label: "Abstand", math: "d = |r| · |n| = 2 · √3 = 2√3 ≈ 3,46" },
    ],
    result: "d = 2√3 ≈ 3,46 LE,  Lotfußpunkt F(1 | 1 | 1)",
    mistakes: [
      "Den Abstand als |r| allein angeben – er ist |r| mal die Länge des Normalenvektors |n| = √3.",
      "In der Hesseschen Normalform das Teilen durch |n| vergessen: |6 − 3|/√3 ist nicht 3, sondern 3/√3 = √3 pro Einheit.",
    ],
    locked: false,
  },
  {
    id: "ll20",
    tag: "Spurpunkte & Volumen",
    src: "Original-Übung · LK-Stil G20",
    q: "Die Ebene E: 6x + 3y + 2z = 6 schneidet die Koordinatenachsen. Bestimmen Sie die Spurpunkte und das Volumen des Tetraeders zwischen E und den Koordinatenebenen.",
    steps: [
      { label: "Spurpunkt auf x-Achse (y=z=0)", math: "6x = 6  →  Sₓ(1 | 0 | 0)" },
      { label: "Spurpunkt auf y-Achse (x=z=0)", math: "3y = 6  →  S_y(0 | 2 | 0)" },
      { label: "Spurpunkt auf z-Achse (x=y=0)", math: "2z = 6  →  S_z(0 | 0 | 3)" },
      { label: "Volumen (Achsenabschnitte a,b,c)", math: "V = a·b·c / 6 = 1·2·3 / 6 = 6/6" },
    ],
    result: "Sₓ(1|0|0), S_y(0|2|0), S_z(0|0|3);  V = 1 VE",
    mistakes: [
      "Beim Spurpunkt nicht die jeweils anderen zwei Koordinaten null setzen.",
      "Beim Tetraeder-Volumen den Faktor 1/6 vergessen (a·b·c ist das Volumen des Quaders, nicht des Tetraeders).",
    ],
    locked: false,
  },
  {
    id: "ll21",
    tag: "Spiegelpunkt an Gerade",
    src: "Original-Übung · LK-Stil G21",
    q: "Spiegeln Sie den Punkt P(4|5|2) an der Geraden g: X = (1,0,0) + t·(0, 1, 0).",
    steps: [
      { label: "Allgemeiner Geradenpunkt", math: "F = (1, t, 0)" },
      { label: "Lotbedingung PF ⊥ u", math: "PF = (−3, t−5, −2);  PF · (0,1,0) = t − 5 = 0  →  t = 5" },
      { label: "Lotfußpunkt", math: "F = (1, 5, 0)" },
      { label: "Spiegelpunkt P' = 2F − P", math: "P' = (2·1−4, 2·5−5, 2·0−2) = (−2, 5, −2)" },
    ],
    result: "P'(−2 | 5 | −2)",
    mistakes: [
      "Die Lotbedingung mit einem Normalenvektor statt mit dem Richtungsvektor u der Geraden ansetzen.",
      "Für den Spiegelpunkt F + (F − P) rechnen, aber das Vorzeichen verlieren – sauber ist P' = 2F − P.",
    ],
    locked: false,
  },
  {
    id: "ll22",
    tag: "Gerade liegt in Ebene (Nachweis)",
    src: "Original-Übung · LK-Stil G22",
    q: "Zeigen Sie, dass die Gerade g: X = (2,0,1) + t·(1, 1, −1) vollständig in der Ebene E: x + 2y + 3z = 5 liegt.",
    steps: [
      { label: "Richtung senkrecht zur Normalen?", math: "u · n = (1,1,−1)·(1,2,3) = 1 + 2 − 3 = 0  →  g ist parallel zu E" },
      { label: "Aufpunkt in E einsetzen", math: "2 + 2·0 + 3·1 = 5  ✓  (erfüllt die Ebenengleichung)" },
      { label: "Schlussfolgerung", math: "parallel UND ein Punkt liegt in E  →  ganze Gerade liegt in E" },
    ],
    result: "u · n = 0 und der Aufpunkt erfüllt E → g liegt vollständig in E.",
    mistakes: [
      "Nur u · n = 0 prüfen und daraus „liegt in E\" folgern – das zeigt zunächst nur Parallelität.",
      "Nur den Aufpunkt testen, ohne die Richtung zu prüfen; beide Bedingungen zusammen sind nötig.",
    ],
    locked: false,
  },
];
