// 12 originale Übungsaufgaben "Lineare Algebra / Geometrie" auf LEISTUNGSKURS-Niveau (Mathe-Abi Hessen).
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
];
