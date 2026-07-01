// 22 originale Übungsaufgaben "Stochastik" im Abitur-Stil (Mathe-Abi Hessen, Grundkurs).
// Selbst formuliert – NICHT aus echten Klausuren kopiert.
// Struktur kompatibel mit dem Task-Typ der Plattform (TopicView), erweitert um "mistakes".

export interface StochastikTask {
  id: string;
  tag: string;                                 // Themen-Kategorie
  src: string;                                 // Quelle (Original-Übung im Abi-Stil)
  q: string;                                   // Aufgabentext
  steps: { label: string; math: string }[];   // Lösungsweg in nachvollziehbaren Schritten
  result: string;                              // Endergebnis
  mistakes: string[];                          // 2 typische Fehler
  locked: boolean;
}

export const STOCHASTIK_TASKS: StochastikTask[] = [
  {
    id: "st1",
    tag: "Laplace-Wahrscheinlichkeit",
    src: "Original-Übung · Abi-Stil C1",
    q: "Zwei faire Würfel werden geworfen. Mit welcher Wahrscheinlichkeit ist die Augensumme gleich 8?",
    steps: [
      { label: "Alle Ergebnisse", math: "6 · 6 = 36 gleichwahrscheinliche Ergebnisse" },
      { label: "Günstige für Summe 8", math: "(2,6), (3,5), (4,4), (5,3), (6,2)  →  5 Möglichkeiten" },
      { label: "Laplace-Formel", math: "P = günstige / mögliche = 5/36" },
    ],
    result: "P(Augensumme = 8) = 5/36 ≈ 0,139",
    mistakes: [
      "(2,6) und (6,2) als ein Ergebnis zählen – bei zwei unterscheidbaren Würfeln sind das zwei verschiedene Ergebnisse.",
      "Mit 21 statt 36 möglichen Ergebnissen rechnen; ignoriert man die Reihenfolge, sind die Ergebnisse nicht mehr gleichwahrscheinlich.",
    ],
    locked: false,
  },
  {
    id: "st2",
    tag: "Baumdiagramm (ohne Zurücklegen)",
    src: "Original-Übung · Abi-Stil C2",
    q: "In einer Urne liegen 3 rote und 2 blaue Kugeln. Es werden nacheinander 2 Kugeln ohne Zurücklegen gezogen. Mit welcher Wahrscheinlichkeit sind beide rot?",
    steps: [
      { label: "1. Ziehung", math: "P(1. rot) = 3/5" },
      { label: "2. Ziehung (eine rote weniger)", math: "P(2. rot | 1. rot) = 2/4" },
      { label: "Pfadregel (multiplizieren)", math: "P(beide rot) = 3/5 · 2/4 = 6/20" },
    ],
    result: "P(beide rot) = 3/10 = 0,3",
    mistakes: [
      "Beim zweiten Zug weiter mit 3/5 rechnen – ohne Zurücklegen sinken Anzahl und Gesamtzahl (nur noch 2 von 4 sind rot).",
      "Entlang eines Pfades addieren statt multiplizieren; entlang eines Astes gilt die Produktregel.",
    ],
    locked: false,
  },
  {
    id: "st3",
    tag: "Gegenwahrscheinlichkeit",
    src: "Original-Übung · Abi-Stil C3",
    q: "Aus der Urne (3 rot, 2 blau) werden 2 Kugeln ohne Zurücklegen gezogen. Mit welcher Wahrscheinlichkeit ist mindestens eine Kugel rot?",
    steps: [
      { label: "Gegenereignis bestimmen", math: "„mindestens 1 rot\" ist das Gegenteil von „keine rot\" (beide blau)" },
      { label: "P(beide blau)", math: "P = 2/5 · 1/4 = 2/20 = 1/10" },
      { label: "Gegenwahrscheinlichkeit", math: "P(mind. 1 rot) = 1 − 1/10" },
    ],
    result: "P(mindestens 1 rot) = 9/10 = 0,9",
    mistakes: [
      "„Mindestens eins\" mühsam über viele Einzelfälle rechnen und dabei Fälle vergessen – der Umweg über das Gegenereignis ist sicherer.",
      "Vergessen, am Ende von 1 abzuziehen, und nur P(beide blau) angeben.",
    ],
    locked: false,
  },
  {
    id: "st4",
    tag: "Kombinatorik",
    src: "Original-Übung · Abi-Stil C4",
    q: "Aus einer Gruppe mit 10 Personen soll ein Team aus 3 Personen gebildet werden. Wie viele verschiedene Teams sind möglich (Reihenfolge egal)?",
    steps: [
      { label: "Modell", math: "Auswahl ohne Reihenfolge  →  Binomialkoeffizient C(10, 3)" },
      { label: "Formel", math: "C(10, 3) = (10 · 9 · 8) / (3 · 2 · 1)" },
      { label: "Berechnen", math: "= 720 / 6" },
    ],
    result: "C(10, 3) = 120 verschiedene Teams",
    mistakes: [
      "Die Reihenfolge mitzählen (10 · 9 · 8 = 720) – beim Team ist die Reihenfolge egal, also durch 3! = 6 teilen.",
      "Den Nenner 3! falsch berechnen: 3! = 1 · 2 · 3 = 6, nicht 3 · 3 = 9.",
    ],
    locked: false,
  },
  {
    id: "st5",
    tag: "Erwartungswert",
    src: "Original-Übung · Abi-Stil C5",
    q: "Eine Zufallsgröße X hat die Werte 0, 1 und 2 mit P(X=0)=0,5, P(X=1)=0,3 und P(X=2)=0,2. Berechnen Sie den Erwartungswert E(X).",
    steps: [
      { label: "Formel", math: "E(X) = Σ xᵢ · P(X = xᵢ)" },
      { label: "Einsetzen", math: "E(X) = 0·0,5 + 1·0,3 + 2·0,2" },
      { label: "Berechnen", math: "= 0 + 0,3 + 0,4" },
    ],
    result: "E(X) = 0,7",
    mistakes: [
      "Nur den Durchschnitt der Werte (0+1+2)/3 = 1 bilden und die Wahrscheinlichkeiten ignorieren.",
      "Werte und Wahrscheinlichkeiten falsch zuordnen, also x mit der falschen Wahrscheinlichkeit multiplizieren.",
    ],
    locked: false,
  },
  {
    id: "st6",
    tag: "Standardabweichung",
    src: "Original-Übung · Abi-Stil C6",
    q: "Eine Zufallsgröße X nimmt die Werte 1, 2 und 3 an mit P(X=1)=0,2, P(X=2)=0,5 und P(X=3)=0,3. Berechnen Sie Erwartungswert und Standardabweichung.",
    steps: [
      { label: "Erwartungswert", math: "μ = 1·0,2 + 2·0,5 + 3·0,3 = 0,2 + 1,0 + 0,9 = 2,1" },
      { label: "Varianz (Formel)", math: "Var(X) = Σ (xᵢ − μ)² · P(X = xᵢ)" },
      { label: "Einsetzen", math: "= (1−2,1)²·0,2 + (2−2,1)²·0,5 + (3−2,1)²·0,3" },
      { label: "Berechnen", math: "= 0,242 + 0,005 + 0,243 = 0,49" },
      { label: "Standardabweichung", math: "σ = √0,49" },
    ],
    result: "E(X) = 2,1;  σ = 0,7",
    mistakes: [
      "Standardabweichung und Varianz verwechseln – σ ist die WURZEL aus der Varianz.",
      "Bei der Varianz die Abweichungen nicht quadrieren oder den falschen Erwartungswert μ einsetzen.",
    ],
    locked: false,
  },
  {
    id: "st7",
    tag: "Faires Spiel",
    src: "Original-Übung · Abi-Stil C7",
    q: "Bei einem Glücksspiel zahlt man 2 € Einsatz. Mit Wahrscheinlichkeit 0,15 gewinnt man 10 € (sonst nichts). Ist das Spiel fair? Berechnen Sie den erwarteten Reingewinn.",
    steps: [
      { label: "Reingewinn bei Gewinn", math: "10 € − 2 € = 8 €   (Wahrscheinlichkeit 0,15)" },
      { label: "Reingewinn bei Niete", math: "0 € − 2 € = −2 €   (Wahrscheinlichkeit 0,85)" },
      { label: "Erwartungswert", math: "E = 8·0,15 + (−2)·0,85 = 1,2 − 1,7" },
    ],
    result: "E = −0,50 €  →  nicht fair (Nachteil für den Spieler)",
    mistakes: [
      "Den Einsatz von 2 € vergessen und nur 10 · 0,15 = 1,50 € als Gewinn rechnen.",
      "Ein Spiel als fair bezeichnen, obwohl E ≠ 0 – fair ist es nur, wenn der erwartete Reingewinn 0 beträgt.",
    ],
    locked: false,
  },
  {
    id: "st8",
    tag: "Unabhängigkeit",
    src: "Original-Übung · Abi-Stil C8",
    q: "Für zwei Ereignisse A und B gilt P(A)=0,5, P(B)=0,4 und P(A∩B)=0,2. Sind A und B stochastisch unabhängig?",
    steps: [
      { label: "Kriterium", math: "unabhängig  ⇔  P(A∩B) = P(A) · P(B)" },
      { label: "Produkt berechnen", math: "P(A) · P(B) = 0,5 · 0,4 = 0,2" },
      { label: "Vergleich", math: "P(A∩B) = 0,2 = 0,2  →  Bedingung erfüllt" },
    ],
    result: "A und B sind unabhängig (0,2 = 0,2)",
    mistakes: [
      "Unabhängigkeit mit Unvereinbarkeit verwechseln – unvereinbar (disjunkt) heißt P(A∩B) = 0, das ist etwas anderes.",
      "Nur P(A) und P(B) vergleichen, statt das Produkt P(A)·P(B) mit P(A∩B) zu prüfen.",
    ],
    locked: false,
  },
  {
    id: "st9",
    tag: "Vierfeldertafel",
    src: "Original-Übung · Abi-Stil C9",
    q: "Von 200 befragten Personen sind 120 weiblich und 80 männlich. 90 Personen tragen eine Brille, davon 60 Frauen. Mit welcher Wahrscheinlichkeit trägt eine zufällig gewählte männliche Person eine Brille?",
    steps: [
      { label: "Tafel ergänzen", math: "Männer mit Brille = 90 − 60 = 30" },
      { label: "Männer gesamt", math: "80" },
      { label: "Bedingte Wahrscheinlichkeit", math: "P(Brille | männlich) = 30 / 80" },
    ],
    result: "P(Brille | männlich) = 3/8 = 0,375",
    mistakes: [
      "Durch die Gesamtzahl 200 teilen statt durch die Anzahl der Männer (80) – die Bedingung ist die neue Grundgesamtheit.",
      "P(Brille | männlich) und P(männlich | Brille) verwechseln (30/80 gegenüber 30/90).",
    ],
    locked: false,
  },
  {
    id: "st10",
    tag: "Satz von Bayes",
    src: "Original-Übung · Abi-Stil C10",
    q: "Eine Krankheit tritt bei 1 % der Bevölkerung auf. Ein Test erkennt Kranke zu 90 % richtig und liefert bei Gesunden in 5 % der Fälle fälschlich ein positives Ergebnis. Wie wahrscheinlich ist eine positiv getestete Person tatsächlich krank?",
    steps: [
      { label: "Pfad krank & positiv", math: "0,01 · 0,90 = 0,009" },
      { label: "Pfad gesund & positiv", math: "0,99 · 0,05 = 0,0495" },
      { label: "Gesamt positiv", math: "P(positiv) = 0,009 + 0,0495 = 0,0585" },
      { label: "Bayes (umgekehrte Bedingung)", math: "P(krank | positiv) = 0,009 / 0,0585" },
    ],
    result: "P(krank | positiv) ≈ 0,154 (≈ 15,4 %)",
    mistakes: [
      "Die 90 % direkt als P(krank | positiv) deuten – gesucht ist die UMGEKEHRTE Bedingung über beide positiven Pfade.",
      "Den Pfad „gesund & positiv\" vergessen; wegen der vielen Gesunden trägt er stark zu „positiv\" bei.",
    ],
    locked: false,
  },
  {
    id: "st11",
    tag: "Binomialverteilung P(X=k)",
    src: "Original-Übung · Abi-Stil C11",
    q: "Erfahrungsgemäß sind 20 % der Teile von Sorte A. Es werden 10 Teile zufällig entnommen. Mit welcher Wahrscheinlichkeit sind genau 2 davon von Sorte A?",
    steps: [
      { label: "Modell", math: "Binomialverteilung mit n = 10, p = 0,2, k = 2" },
      { label: "Formel", math: "P(X=2) = C(10, 2) · 0,2² · 0,8⁸" },
      { label: "Werte einsetzen", math: "C(10,2) = 45;  0,2² = 0,04;  0,8⁸ ≈ 0,1678" },
      { label: "Berechnen", math: "P(X=2) = 45 · 0,04 · 0,1678" },
    ],
    result: "P(X=2) ≈ 0,302 (≈ 30,2 %)",
    mistakes: [
      "Den Exponenten von (1−p) falsch wählen – es sind n − k = 8 „Misserfolge\", also 0,8⁸.",
      "Den Binomialkoeffizienten C(10,2) = 45 vergessen und nur 0,2² · 0,8⁸ rechnen.",
    ],
    locked: false,
  },
  {
    id: "st12",
    tag: "Binomial (mindestens eins)",
    src: "Original-Übung · Abi-Stil C12",
    q: "Ein Bauteil ist mit Wahrscheinlichkeit 5 % defekt. Einer Lieferung werden 10 Bauteile zufällig entnommen. Mit welcher Wahrscheinlichkeit ist mindestens ein Bauteil defekt?",
    steps: [
      { label: "Gegenereignis", math: "„mindestens 1 defekt\" = Gegenteil von „kein Defekt\"" },
      { label: "P(kein Defekt)", math: "P(X=0) = 0,95¹⁰ ≈ 0,5987" },
      { label: "Gegenwahrscheinlichkeit", math: "P(X ≥ 1) = 1 − 0,5987" },
    ],
    result: "P(mindestens 1 defekt) ≈ 0,401 (≈ 40,1 %)",
    mistakes: [
      "P(mindestens 1) als 10 · 0,05 = 0,5 rechnen – das ist der Erwartungswert, nicht die Wahrscheinlichkeit.",
      "Bei P(X=0) mit 0,05 statt mit der Intaktwahrscheinlichkeit 0,95 potenzieren.",
    ],
    locked: false,
  },
  {
    id: "st13",
    tag: "Binomial: μ und σ",
    src: "Original-Übung · Abi-Stil C13",
    q: "Bei einem Glücksrad erscheint mit Wahrscheinlichkeit p = 0,2 die Farbe Rot. Das Rad wird 50-mal gedreht. Berechnen Sie Erwartungswert und Standardabweichung für die Anzahl der roten Ergebnisse.",
    steps: [
      { label: "Erwartungswert", math: "μ = n · p = 50 · 0,2 = 10" },
      { label: "Varianz", math: "Var = n · p · (1 − p) = 50 · 0,2 · 0,8 = 8" },
      { label: "Standardabweichung", math: "σ = √8 ≈ 2,83" },
    ],
    result: "μ = 10;  σ = √8 ≈ 2,83",
    mistakes: [
      "Für σ die Wurzel vergessen und 8 (die Varianz) als Standardabweichung angeben.",
      "Bei der Varianz den Faktor (1 − p) weglassen und nur n · p rechnen.",
    ],
    locked: false,
  },
  {
    id: "st14",
    tag: "Binomial (mindestens 8)",
    src: "Original-Übung · Abi-Stil C14",
    q: "Eine faire Münze wird 10-mal geworfen (p = 0,5 für Kopf). Mit welcher Wahrscheinlichkeit fällt mindestens 8-mal Kopf?",
    steps: [
      { label: "Zerlegen", math: "P(X ≥ 8) = P(X=8) + P(X=9) + P(X=10)" },
      { label: "Binomialkoeffizienten", math: "C(10,8) = 45,  C(10,9) = 10,  C(10,10) = 1" },
      { label: "Zusammenfassen (jeder Pfad · 0,5¹⁰)", math: "(45 + 10 + 1) · 0,5¹⁰ = 56 / 1024" },
    ],
    result: "P(X ≥ 8) = 56/1024 ≈ 0,0547 (≈ 5,5 %)",
    mistakes: [
      "„Mindestens 8\" als nur P(X=8) deuten – auch X = 9 und X = 10 gehören dazu.",
      "Bei p = 0,5 die Faktoren getrennt behandeln; jeder Pfad ergibt insgesamt 0,5¹⁰ = 1/1024.",
    ],
    locked: false,
  },
  {
    id: "st15",
    tag: "Binomial (höchstens k)",
    src: "Original-Übung · Abi-Stil C15",
    q: "Ein Los enthält 10 % Ausschuss. Es werden 20 Teile zufällig entnommen. Mit welcher Wahrscheinlichkeit sind höchstens 2 Teile Ausschuss?",
    steps: [
      { label: "Modell", math: "Binomialverteilung mit n = 20, p = 0,1;  gesucht P(X ≤ 2)" },
      { label: "Zerlegen", math: "P(X ≤ 2) = P(X=0) + P(X=1) + P(X=2)" },
      { label: "Einzelwahrscheinlichkeiten", math: "P(0) = 0,9²⁰ ≈ 0,1216;  P(1) ≈ 0,2702;  P(2) = C(20,2)·0,1²·0,9¹⁸ ≈ 0,2852" },
      { label: "Summe", math: "≈ 0,1216 + 0,2702 + 0,2852" },
    ],
    result: "P(X ≤ 2) ≈ 0,677 (≈ 67,7 %)",
    mistakes: [
      "„Höchstens 2\" nur als P(X=2) deuten – dazu gehören auch X = 0 und X = 1.",
      "Am Taschenrechner P(X=2) statt der kumulierten Wahrscheinlichkeit P(X≤2) (binomcdf) nehmen.",
    ],
    locked: false,
  },
  {
    id: "st16",
    tag: "Mindestanzahl (Binomial)",
    src: "Original-Übung · Abi-Stil C16",
    q: "Ein Glücksrad zeigt mit Wahrscheinlichkeit p = 0,2 einen Gewinn. Wie oft muss man mindestens drehen, damit mit einer Wahrscheinlichkeit von mindestens 99 % wenigstens einmal ein Gewinn dabei ist?",
    steps: [
      { label: "Ansatz über das Gegenereignis", math: "P(X ≥ 1) = 1 − 0,8ⁿ ≥ 0,99" },
      { label: "Umstellen", math: "0,8ⁿ ≤ 0,01" },
      { label: "Logarithmieren", math: "n ≥ ln(0,01) / ln(0,8) ≈ 20,64" },
      { label: "Aufrunden (n ganzzahlig)", math: "n = 21" },
    ],
    result: "mindestens n = 21 Drehungen",
    mistakes: [
      "Das Ergebnis 20,64 abrunden – für „mindestens 99 %\" muss man immer AUFrunden, sonst wird die Schranke nicht erreicht.",
      "Beim Teilen durch das negative ln(0,8) das Ungleichheitszeichen falsch behandeln; sauber „0,8ⁿ ≤ 0,01\" ansetzen.",
    ],
    locked: false,
  },
  {
    id: "st17",
    tag: "Baumdiagramm (genau eins)",
    src: "Original-Übung · Abi-Stil C17",
    q: "In einer Urne liegen 3 rote und 2 blaue Kugeln. Es werden 2 Kugeln ohne Zurücklegen gezogen. Mit welcher Wahrscheinlichkeit ist genau eine Kugel rot?",
    steps: [
      { label: "Zwei Pfade führen zum Ereignis", math: "(rot, blau) und (blau, rot)" },
      { label: "Pfad (rot, blau)", math: "3/5 · 2/4 = 6/20" },
      { label: "Pfad (blau, rot)", math: "2/5 · 3/4 = 6/20" },
      { label: "Pfade addieren", math: "6/20 + 6/20 = 12/20" },
    ],
    result: "P(genau 1 rot) = 3/5 = 0,6",
    mistakes: [
      "Nur einen Pfad (z. B. rot–blau) rechnen – „genau eine rote\" umfasst BEIDE Reihenfolgen.",
      "Innerhalb eines Pfades addieren; entlang eines Astes wird multipliziert, erst die verschiedenen Pfade werden addiert.",
    ],
    locked: false,
  },
  {
    id: "st18",
    tag: "Bedingte Wahrscheinlichkeit",
    src: "Original-Übung · Abi-Stil C18",
    q: "Für zwei Ereignisse gilt P(A) = 0,5, P(B) = 0,4 und P(A∩B) = 0,3. Berechnen Sie P(A|B) und P(B|A).",
    steps: [
      { label: "Formel", math: "P(A|B) = P(A∩B) / P(B)" },
      { label: "P(A|B) einsetzen", math: "= 0,3 / 0,4 = 0,75" },
      { label: "Andere Richtung", math: "P(B|A) = P(A∩B) / P(A) = 0,3 / 0,5 = 0,6" },
    ],
    result: "P(A|B) = 0,75;  P(B|A) = 0,6",
    mistakes: [
      "Durch die falsche Wahrscheinlichkeit teilen: bei P(A|B) steht die Bedingung B im Nenner, also ÷ P(B).",
      "P(A|B) und P(B|A) für gleich halten – sie unterscheiden sich, sobald P(A) ≠ P(B).",
    ],
    locked: false,
  },
  {
    id: "st19",
    tag: "Additionssatz",
    src: "Original-Übung · Abi-Stil C19",
    q: "Für zwei Ereignisse gilt P(A) = 0,5, P(B) = 0,4 und P(A∩B) = 0,2. Berechnen Sie P(A∪B).",
    steps: [
      { label: "Additionssatz", math: "P(A∪B) = P(A) + P(B) − P(A∩B)" },
      { label: "Einsetzen", math: "= 0,5 + 0,4 − 0,2" },
    ],
    result: "P(A∪B) = 0,7",
    mistakes: [
      "Den Schnitt P(A∩B) nicht abziehen und einfach 0,5 + 0,4 = 0,9 rechnen – der gemeinsame Teil würde doppelt gezählt.",
      "Den Additionssatz auch bei unvereinbaren Ereignissen mit einem Schnitt ansetzen; sind A und B disjunkt, ist P(A∩B) = 0.",
    ],
    locked: false,
  },
  {
    id: "st20",
    tag: "Wahrscheinlichkeitsverteilung",
    src: "Original-Übung · Abi-Stil C20",
    q: "Zwei faire Münzen werden geworfen. Die Zufallsgröße X zählt die Anzahl „Kopf\". Stellen Sie die Wahrscheinlichkeitsverteilung auf und berechnen Sie E(X).",
    steps: [
      { label: "Alle Ergebnisse (je 1/4)", math: "ZZ, ZK, KZ, KK" },
      { label: "Verteilung", math: "P(X=0) = 1/4,  P(X=1) = 2/4 = 1/2,  P(X=2) = 1/4" },
      { label: "Erwartungswert", math: "E(X) = 0·(1/4) + 1·(1/2) + 2·(1/4)" },
    ],
    result: "E(X) = 1   (Verteilung: 1/4, 1/2, 1/4 für X = 0, 1, 2)",
    mistakes: [
      "P(X=1) nur als 1/4 ansetzen – für „genau 1 Kopf\" gibt es ZWEI Ergebnisse (ZK und KZ), also 2/4.",
      "Beim Erwartungswert die Werte ungewichtet mitteln (0+1+2)/3, statt mit den Wahrscheinlichkeiten zu gewichten.",
    ],
    locked: false,
  },
  {
    id: "st21",
    tag: "Sigma-Regeln",
    src: "Original-Übung · Abi-Stil C21",
    q: "Eine faire Münze wird 100-mal geworfen (p = 0,5 für Kopf). In welchem Intervall liegt die Anzahl der Köpfe mit einer Wahrscheinlichkeit von etwa 95,4 % (2σ-Umgebung)?",
    steps: [
      { label: "Erwartungswert", math: "μ = n·p = 100·0,5 = 50" },
      { label: "Standardabweichung", math: "σ = √(n·p·(1−p)) = √(100·0,5·0,5) = √25 = 5" },
      { label: "2σ-Umgebung (≈ 95,4 %)", math: "[μ − 2σ; μ + 2σ] = [50 − 10; 50 + 10]" },
    ],
    result: "mit ≈ 95,4 % liegt die Trefferzahl im Intervall [40; 60]",
    mistakes: [
      "Für die ≈ 95,4-%-Umgebung μ ± σ statt μ ± 2σ nehmen – diese Regel gehört zu ZWEI Standardabweichungen.",
      "σ mit der Varianz (25) verwechseln; erst die Wurzel ziehen (σ = 5), dann ± 2σ rechnen.",
    ],
    locked: false,
  },
  {
    id: "st22",
    tag: "Hypothesentest",
    src: "Original-Übung · Abi-Stil C22",
    q: "Ein Hersteller behauptet, höchstens 10 % seiner Produkte seien fehlerhaft. Zur Prüfung werden n = 50 Produkte getestet (Signifikanzniveau 5 %). Der Ablehnungsbereich wurde als {X ≥ 10} bestimmt. In der Stichprobe sind 12 Produkte fehlerhaft. Wie lautet die Testentscheidung?",
    steps: [
      { label: "Hypothesen", math: "H₀: p ≤ 0,10 (Behauptung),   H₁: p > 0,10" },
      { label: "Ablehnungsbereich (gegeben)", math: "{X ≥ 10} auf dem 5-%-Niveau" },
      { label: "Beobachtung", math: "in der Stichprobe: X = 12" },
      { label: "Vergleich", math: "12 ≥ 10  →  X liegt im Ablehnungsbereich" },
    ],
    result: "H₀ wird abgelehnt – die Behauptung „höchstens 10 % fehlerhaft\" wird auf dem 5-%-Niveau verworfen.",
    mistakes: [
      "Aus der Ablehnung folgern „H₁ ist bewiesen\" – ein Test beweist nichts, ein Irrtum (Fehler 1. Art) bleibt mit bis zu 5 % möglich.",
      "Den Ablehnungsbereich auf der falschen Seite ansetzen; wegen H₁: p > 0,10 wird nur bei GROSSEN Werten von X abgelehnt.",
    ],
    locked: false,
  },
];
