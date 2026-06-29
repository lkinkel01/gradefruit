// Erklärvideo-Szenen.
// Jede Szene wird Schritt für Schritt animiert und vorgelesen.
//  - `say`  = der gesprochene Text (in Worten, nicht in Symbolen) für die Stimme
//             (ElevenLabs, mit Browser-Stimme als Rückfall)
//  - `math` = die Formelzeile, die auf dem Bildschirm erscheint (mit Symbolen)
//  - `mark` = optionaler Punkt, der im Graphen auftaucht
//
// `hasAudio: true` setzen wir erst, wenn die mp3-Dateien erzeugt sind.
// Solange es false ist, nutzt der Player direkt die Browser-Stimme.

export interface SceneMark {
  x: number;
  y: number;
  label: string;
}

export interface SceneStep {
  title: string; // kurze Überschrift des Schritts
  math?: string; // Formel, die eingeblendet wird
  say: string; // gesprochener Text
  mark?: SceneMark; // optionaler Punkt im Graphen
}

export interface SceneGraph {
  fn: (x: number) => number;
  xMin: number;
  xMax: number;
  shadeFrom?: number; // optional: Fläche unter der Kurve ab hier schattieren (Integral)
  shadeTo?: number; // optional: bis hier schattieren
}

export interface Scene {
  id: string;
  title: string;
  topic: string;
  color: string;
  func?: string; // Funktion, die oben groß angezeigt wird
  intro: string; // gesprochene Einleitung
  steps: SceneStep[];
  outro: string; // gesprochener Abschluss
  result?: string; // Ergebnis-Kasten am Ende
  graph?: SceneGraph;
  hasAudio?: boolean; // true = mp3s vorhanden, sonst Browser-Stimme
}

export const SCENES: Record<string, Scene> = {
  v1: {
    id: 'v1',
    title: 'Ableitung – Grundregeln',
    topic: 'Analysis',
    color: '#F0524A',
    func: 'f(x) = 3x⁴ − 5x² + 7',
    intro:
      'In diesem Video lernst du die wichtigsten Ableitungsregeln kennen. Wir leiten die Funktion f von x gleich drei x hoch vier minus fünf x Quadrat plus sieben ab. Ableiten klingt schwer, ist aber mit ein paar einfachen Regeln ganz leicht. Los geht es!',
    steps: [
      {
        title: 'Die Potenzregel',
        math: "(xⁿ)' = n · xⁿ⁻¹",
        say: 'Die wichtigste Regel ist die Potenzregel. Sie sagt: Wenn du x hoch n ableitest, ziehst du den Exponenten n nach vorne und verringerst den Exponenten um eins. Aus x hoch n wird also n mal x hoch n minus eins. Diese Regel wenden wir jetzt auf jedes Glied einzeln an.',
      },
      {
        title: 'Erstes Glied ableiten',
        math: "(3x⁴)' = 3 · 4x³ = 12x³",
        say: 'Wir beginnen mit drei x hoch vier. Den Faktor drei lassen wir einfach stehen. Den Exponenten vier ziehen wir nach vorne und verringern ihn um eins. So wird aus x hoch vier das Vierfache von x hoch drei. Drei mal vier ergibt zwölf. Wir erhalten also zwölf x hoch drei.',
      },
      {
        title: 'Zweites Glied ableiten',
        math: "(−5x²)' = −5 · 2x = −10x",
        say: 'Jetzt minus fünf x Quadrat. Wieder ziehen wir den Exponenten zwei nach vorne und verringern ihn um eins. Aus x Quadrat wird zwei x. Minus fünf mal zwei ergibt minus zehn. Wir bekommen also minus zehn x.',
      },
      {
        title: 'Konstante ableiten',
        math: "(7)' = 0",
        say: 'Bleibt noch die sieben. Eine Zahl ohne x ist eine Konstante, und die Ableitung einer Konstante ist immer null. Die sieben fällt also einfach weg.',
      },
      {
        title: 'Alles zusammensetzen',
        math: "f'(x) = 12x³ − 10x",
        say: 'Jetzt setzen wir alle Teile zusammen: zwölf x hoch drei minus zehn x. Und fertig ist unsere Ableitung. Du siehst: Mit der Potenzregel ist Ableiten wirklich kein Hexenwerk.',
      },
    ],
    outro:
      'Fassen wir zusammen: Mit der Potenzregel leitest du jedes Glied einzeln ab, Faktoren bleiben stehen, und Konstanten fallen weg. Das Ergebnis lautet f Strich von x gleich zwölf x hoch drei minus zehn x. Super, jetzt kennst du die Grundregeln des Ableitens!',
    result: "f'(x) = 12x³ − 10x",
    hasAudio: true,
  },

  v2: {
    id: 'v2',
    title: 'Extrempunkte berechnen',
    topic: 'Analysis',
    color: '#F0524A',
    func: 'f(x) = x³ − 3x² + 2',
    intro:
      'Lass uns gemeinsam die Extrempunkte dieser Funktion bestimmen. Gegeben ist f von x gleich x hoch drei minus drei x Quadrat plus zwei. Extrempunkte sind die Hoch- und Tiefpunkte einer Kurve – also die Stellen, an denen die Kurve ihre Richtung ändert.',
    steps: [
      {
        title: 'Erste Ableitung bilden',
        math: "f'(x) = 3x² − 6x",
        say: 'Im ersten Schritt leiten wir die Funktion ab. Aus x hoch drei wird drei x Quadrat, und aus minus drei x Quadrat wird minus sechs x. Die zwei am Ende fällt weg. Wir erhalten also: f Strich von x gleich drei x Quadrat minus sechs x.',
      },
      {
        title: 'Ableitung gleich null setzen',
        math: '3x² − 6x = 0   →   3x(x − 2) = 0',
        say: 'An einem Extrempunkt ist die Steigung null. Deshalb setzen wir die Ableitung gleich null. Jetzt klammern wir drei x aus und erhalten: drei x mal Klammer auf, x minus zwei, Klammer zu, gleich null.',
      },
      {
        title: 'Kritische Stellen ablesen',
        math: 'x₁ = 0   und   x₂ = 2',
        say: 'Ein Produkt ist genau dann null, wenn einer der Faktoren null ist. Also ist entweder x gleich null oder x gleich zwei. Das sind unsere beiden Kandidaten für die Extrempunkte.',
      },
      {
        title: 'Zweite Ableitung bilden',
        math: "f''(x) = 6x − 6",
        say: 'Jetzt wollen wir wissen, ob es Hoch- oder Tiefpunkte sind. Dafür brauchen wir die zweite Ableitung. Wir leiten f Strich noch einmal ab und bekommen: f zwei Strich von x gleich sechs x minus sechs.',
      },
      {
        title: 'x = 0 einsetzen',
        math: "f''(0) = −6 < 0   →   Hochpunkt",
        say: 'Wir setzen x gleich null ein: sechs mal null minus sechs ergibt minus sechs. Das ist kleiner als null. Und das bedeutet: An dieser Stelle haben wir einen Hochpunkt.',
        mark: { x: 0, y: 2, label: 'HP' },
      },
      {
        title: 'x = 2 einsetzen',
        math: "f''(2) = 6 > 0   →   Tiefpunkt",
        say: 'Und jetzt x gleich zwei: sechs mal zwei minus sechs ergibt plus sechs. Das ist größer als null. Also haben wir hier einen Tiefpunkt.',
        mark: { x: 2, y: -2, label: 'TP' },
      },
    ],
    outro:
      'Zum Schluss setzen wir die x-Werte noch in die ursprüngliche Funktion ein, um die y-Werte zu bekommen. Unser Ergebnis: ein Hochpunkt bei null, zwei und ein Tiefpunkt bei zwei, minus zwei. Und schon haben wir beide Extrempunkte bestimmt. Super gemacht!',
    result: 'HP(0 | 2)     TP(2 | −2)',
    graph: { fn: (x) => x * x * x - 3 * x * x + 2, xMin: -1.5, xMax: 3.5 },
    hasAudio: true,
  },

  v3: {
    id: 'v3',
    title: 'Integralrechnung Einführung',
    topic: 'Analysis',
    color: '#F0524A',
    func: '∫₀² (2x + 1) dx',
    intro:
      'In diesem Video schauen wir uns die Integralrechnung an. Wir berechnen das Integral von null bis zwei über die Funktion zwei x plus eins. Ein Integral beschreibt anschaulich die Fläche zwischen dem Graphen und der x-Achse. Schauen wir uns das Schritt für Schritt an.',
    steps: [
      {
        title: 'Was ist eine Stammfunktion?',
        math: "F'(x) = f(x)",
        say: 'Um ein Integral zu berechnen, brauchen wir zuerst eine sogenannte Stammfunktion. Das ist eine Funktion groß F, deren Ableitung wieder unsere Funktion f ergibt. Wir suchen also rückwärts: Welche Funktion ergibt abgeleitet zwei x plus eins?',
      },
      {
        title: 'Stammfunktion bilden',
        math: 'F(x) = x² + x',
        say: 'Wir gehen die Potenzregel rückwärts. Aus zwei x wird x Quadrat, denn x Quadrat abgeleitet ergibt zwei x. Aus der eins wird x, denn x abgeleitet ergibt eins. Unsere Stammfunktion ist also groß F von x gleich x Quadrat plus x.',
      },
      {
        title: 'Der Hauptsatz',
        math: '∫ₐᵇ f(x) dx = F(b) − F(a)',
        say: 'Jetzt kommt der Hauptsatz der Integralrechnung. Er sagt: Das Integral von a bis b ist groß F an der oberen Grenze minus groß F an der unteren Grenze. Wir setzen also die Grenzen zwei und null in unsere Stammfunktion ein.',
      },
      {
        title: 'Obere Grenze einsetzen',
        math: 'F(2) = 2² + 2 = 6',
        say: 'Wir beginnen mit der oberen Grenze zwei. Zwei Quadrat ist vier, plus zwei ergibt sechs. Also ist groß F von zwei gleich sechs.',
      },
      {
        title: 'Untere Grenze einsetzen',
        math: 'F(0) = 0² + 0 = 0',
        say: 'Jetzt die untere Grenze null. Null Quadrat ist null, plus null bleibt null. Also ist groß F von null gleich null.',
      },
      {
        title: 'Ergebnis berechnen',
        math: '6 − 0 = 6',
        say: 'Zum Schluss ziehen wir ab: sechs minus null ergibt sechs. Die Fläche unter dem Graphen zwischen null und zwei beträgt also sechs Flächeneinheiten.',
      },
    ],
    outro:
      'Und so berechnest du ein Integral: Stammfunktion bilden, obere und untere Grenze einsetzen und voneinander abziehen. Unsere Fläche beträgt sechs. Das Integral ist also gar nicht so schwer, wie es aussieht!',
    result: '∫₀² (2x + 1) dx = 6',
    graph: { fn: (x) => 2 * x + 1, xMin: -0.5, xMax: 2.5, shadeFrom: 0, shadeTo: 2 },
    hasAudio: true,
  },

  v4: {
    id: 'v4',
    title: 'Vektoren & Skalarprodukt',
    topic: 'Lineare Algebra',
    color: '#6C63FF',
    func: 'a⃗ = (3 | 4 | 0)     b⃗ = (1 | 2 | 2)',
    intro:
      'In diesem Video geht es um Vektoren und das Skalarprodukt. Gegeben sind zwei Vektoren: a mit den Komponenten drei, vier, null und b mit den Komponenten eins, zwei, zwei. Wir berechnen das Skalarprodukt und den Winkel zwischen den beiden Vektoren.',
    steps: [
      {
        title: 'Was ist das Skalarprodukt?',
        math: 'a⃗ · b⃗ = a₁b₁ + a₂b₂ + a₃b₃',
        say: 'Das Skalarprodukt zweier Vektoren berechnest du, indem du die Komponenten paarweise multiplizierst und dann alles addierst. Also erste mal erste, plus zweite mal zweite, plus dritte mal dritte.',
      },
      {
        title: 'Skalarprodukt berechnen',
        math: '= 3·1 + 4·2 + 0·2 = 11',
        say: 'Setzen wir ein: drei mal eins ist drei, plus vier mal zwei ist acht, plus null mal zwei ist null. Drei plus acht plus null ergibt elf. Das Skalarprodukt ist also elf.',
      },
      {
        title: 'Längen der Vektoren',
        math: '|a⃗| = √(9+16+0) = 5     |b⃗| = √(1+4+4) = 3',
        say: 'Für den Winkel brauchen wir noch die Längen der Vektoren. Die Länge berechnest du mit der Wurzel aus der Summe der quadrierten Komponenten. Für a ergibt das Wurzel aus neun plus sechzehn plus null, also Wurzel aus fünfundzwanzig gleich fünf. Für b ergibt das Wurzel aus neun, also drei.',
      },
      {
        title: 'Formel für den Winkel',
        math: 'cos φ = (a⃗ · b⃗) / (|a⃗| · |b⃗|)',
        say: 'Den Winkel zwischen den Vektoren bekommen wir über den Kosinus. Der Kosinus des Winkels ist das Skalarprodukt geteilt durch das Produkt der beiden Längen.',
      },
      {
        title: 'Werte einsetzen',
        math: 'cos φ = 11 / 15 ≈ 0,733',
        say: 'Wir setzen ein: elf geteilt durch fünf mal drei, also elf geteilt durch fünfzehn. Das ergibt ungefähr null Komma sieben drei drei.',
      },
      {
        title: 'Winkel bestimmen',
        math: 'φ = cos⁻¹(0,733) ≈ 42,8°',
        say: 'Zum Schluss nehmen wir den Kosinus rückwärts, den sogenannten Arkuskosinus. Der Winkel beträgt etwa zweiundvierzig Komma acht Grad. Und fertig!',
      },
    ],
    outro:
      'Zusammengefasst: Das Skalarprodukt berechnest du komponentenweise, hier kam elf heraus. Über die Längen und den Kosinus bekommst du den Winkel von rund dreiundvierzig Grad. So vergleichst du die Richtung zweier Vektoren!',
    result: 'a⃗ · b⃗ = 11     φ ≈ 42,8°',
    hasAudio: true,
  },

  v5: {
    id: 'v5',
    title: 'Geradengleichungen',
    topic: 'Lineare Algebra',
    color: '#6C63FF',
    func: 'A(1 | 2 | 3)     B(3 | 6 | 7)',
    intro:
      'In diesem Video stellen wir die Gleichung einer Geraden im Raum auf. Gegeben sind zwei Punkte: A mit den Koordinaten eins, zwei, drei und B mit drei, sechs, sieben. Wir bestimmen die Geradengleichung und prüfen anschließend, ob ein weiterer Punkt auf der Geraden liegt.',
    steps: [
      {
        title: 'Richtungsvektor bestimmen',
        math: 'u⃗ = B − A = (2 | 4 | 4)',
        say: 'Zuerst brauchen wir die Richtung der Geraden. Den Richtungsvektor bekommst du, indem du den Ortsvektor von A vom Ortsvektor von B abziehst. Drei minus eins ist zwei, sechs minus zwei ist vier, sieben minus drei ist vier. Der Richtungsvektor ist also zwei, vier, vier.',
      },
      {
        title: 'Geradengleichung aufstellen',
        math: 'g: x⃗ = (1 | 2 | 3) + t · (2 | 4 | 4)',
        say: 'Jetzt stellen wir die Gerade auf. Wir nehmen den Punkt A als Stützpunkt und hängen den Richtungsvektor mit dem Parameter t daran. Die Gerade g lautet: x gleich eins, zwei, drei plus t mal zwei, vier, vier.',
      },
      {
        title: 'Punktprobe vorbereiten',
        math: 'P(5 | 10 | 11) einsetzen',
        say: 'Nun prüfen wir, ob der Punkt P mit den Koordinaten fünf, zehn, elf auf der Geraden liegt. Dazu setzen wir P in die Geradengleichung ein und schauen, ob wir für t überall denselben Wert bekommen.',
      },
      {
        title: 'Parameter t berechnen',
        math: '1 + 2t = 5   →   t = 2',
        say: 'Wir nehmen die erste Zeile: eins plus zwei t gleich fünf. Wir ziehen die eins ab und teilen durch zwei. Das ergibt t gleich zwei. Diesen Wert prüfen wir jetzt in den anderen Zeilen.',
      },
      {
        title: 'Probe in den anderen Zeilen',
        math: '2 + 4·2 = 10 ✓     3 + 4·2 = 11 ✓',
        say: 'Zweite Zeile: zwei plus vier mal zwei ist zehn. Passt. Dritte Zeile: drei plus vier mal zwei ist elf. Passt auch. In allen Zeilen kommt t gleich zwei heraus.',
      },
      {
        title: 'Ergebnis',
        math: 'P liegt auf g   (t = 2)',
        say: 'Da t in allen drei Zeilen denselben Wert hat, liegt der Punkt P tatsächlich auf der Geraden. Wäre auch nur eine Zeile nicht aufgegangen, läge P nicht auf g.',
      },
    ],
    outro:
      'Zusammengefasst: Den Richtungsvektor bekommst du aus B minus A, die Gerade besteht aus Stützpunkt plus t mal Richtungsvektor. Mit der Punktprobe prüfst du, ob ein Punkt auf der Geraden liegt. Hier lag P auf g. Klasse gemacht!',
    result: 'g: x⃗ = (1|2|3) + t · (2|4|4)     P ∈ g',
    hasAudio: true,
  },

  v6: {
    id: 'v6',
    title: 'Binomialverteilung',
    topic: 'Stochastik',
    color: '#17B26A',
    func: 'n = 10     p = 0,5     k = 4',
    intro:
      'In diesem Video geht es um die Binomialverteilung. Stell dir vor, du wirfst zehn Mal eine Münze. Wie wahrscheinlich ist es, dass genau vier Mal Kopf fällt? Wir haben also n gleich zehn Versuche, eine Wahrscheinlichkeit p von null Komma fünf und suchen genau k gleich vier Treffer.',
    steps: [
      {
        title: 'Wann benutze ich sie?',
        math: 'n = 10,  p = 0,5,  k = 4',
        say: 'Die Binomialverteilung benutzt du immer dann, wenn ein Versuch mehrmals wiederholt wird und es nur zwei Ausgänge gibt: Treffer oder kein Treffer. Hier ist Kopf der Treffer, mit der Wahrscheinlichkeit null Komma fünf, bei zehn Würfen.',
      },
      {
        title: 'Die Formel',
        math: 'P(X=k) = C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ',
        say: 'Die Formel lautet: P von X gleich k ist gleich n über k, mal p hoch k, mal Klammer auf eins minus p Klammer zu hoch n minus k. Der erste Teil zählt die Möglichkeiten, die anderen beiden geben die Wahrscheinlichkeit für genau einen dieser Fälle.',
      },
      {
        title: 'Binomialkoeffizient',
        math: 'C(10,4) = 210',
        say: 'Zuerst der Binomialkoeffizient zehn über vier. Er sagt, auf wie viele Arten vier Treffer auf zehn Würfe verteilt sein können. Das ergibt zweihundertzehn Möglichkeiten.',
      },
      {
        title: 'Wahrscheinlichkeiten',
        math: '0,5⁴ · 0,5⁶ = 0,5¹⁰ ≈ 0,000977',
        say: 'Jetzt die Wahrscheinlichkeiten: p hoch vier mal eins minus p hoch sechs, also null Komma fünf hoch vier mal null Komma fünf hoch sechs. Zusammen ist das null Komma fünf hoch zehn, das sind ungefähr null Komma null null null neun sieben sieben.',
      },
      {
        title: 'Alles multiplizieren',
        math: '210 · 0,000977 ≈ 0,205',
        say: 'Zum Schluss multiplizieren wir die Anzahl der Möglichkeiten mit dieser Wahrscheinlichkeit. Zweihundertzehn mal null Komma null null null neun sieben sieben ergibt ungefähr null Komma zwei null fünf.',
      },
      {
        title: 'Ergebnis deuten',
        math: 'P(X=4) ≈ 20,5 %',
        say: 'Die Wahrscheinlichkeit, bei zehn Würfen genau vier Mal Kopf zu bekommen, liegt also bei etwa zwanzig Komma fünf Prozent. Gar nicht mal so selten!',
      },
    ],
    outro:
      'Zusammengefasst: Mit der Binomialverteilung berechnest du die Wahrscheinlichkeit für eine bestimmte Anzahl Treffer. Du brauchst den Binomialkoeffizienten und die Wahrscheinlichkeiten hoch Treffer und hoch Nicht-Treffer. Hier kamen rund zwanzig Komma fünf Prozent heraus. Super!',
    result: 'P(X=4) ≈ 0,205  (20,5 %)',
    hasAudio: true,
  },

  l1: {
    id: 'l1',
    title: 'Abstand zweier Punkte',
    topic: 'Lineare Algebra',
    color: '#6C63FF',
    func: 'A(1 | 2 | 3)     B(4 | 6 | 3)',
    intro:
      'In diesem Video berechnen wir den Abstand zweier Punkte im Raum. Gegeben sind A mit den Koordinaten eins, zwei, drei und B mit vier, sechs, drei. Der Abstand ist einfach die Länge der Strecke zwischen den beiden Punkten.',
    steps: [
      {
        title: 'Verbindungsvektor bilden',
        math: 'AB⃗ = B − A = (3 | 4 | 0)',
        say: 'Zuerst bestimmen wir den Verbindungsvektor von A nach B. Den bekommst du, indem du A von B abziehst. Vier minus eins ist drei, sechs minus zwei ist vier, drei minus drei ist null. Der Verbindungsvektor ist also drei, vier, null.',
      },
      {
        title: 'Betrag ansetzen',
        math: '|AB⃗| = √(3² + 4² + 0²)',
        say: 'Der Abstand ist die Länge, also der Betrag dieses Vektors. Den berechnest du mit der Wurzel aus der Summe der quadrierten Komponenten. Also Wurzel aus drei Quadrat plus vier Quadrat plus null Quadrat.',
      },
      {
        title: 'Quadrate ausrechnen',
        math: '= √(9 + 16 + 0) = √25',
        say: 'Wir rechnen die Quadrate aus: drei Quadrat ist neun, vier Quadrat ist sechzehn, null Quadrat ist null. Neun plus sechzehn plus null ergibt fünfundzwanzig. Wir haben also die Wurzel aus fünfundzwanzig.',
      },
      {
        title: 'Wurzel ziehen',
        math: '√25 = 5',
        say: 'Zum Schluss ziehen wir die Wurzel. Die Wurzel aus fünfundzwanzig ist fünf. Der Abstand zwischen A und B beträgt also fünf Einheiten.',
      },
    ],
    outro:
      'Zusammengefasst: Den Abstand zweier Punkte bekommst du, indem du den Verbindungsvektor bildest und dann seine Länge berechnest. Hier beträgt der Abstand genau fünf. So einfach ist das!',
    result: '|AB⃗| = 5',
  },
};
