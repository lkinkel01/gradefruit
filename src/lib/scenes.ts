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
    color: '#FF7A00',
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
    // Die Funktion, um die es geht — im Reel trägt sie das Bild. Ohne Graphen
    // stünde hier nur Text auf schwarzem Grund.
    graph: { fn: (x) => 3 * x ** 4 - 5 * x * x + 7, xMin: -1.5, xMax: 1.5 },
    hasAudio: true,
  },

  v2: {
    id: 'v2',
    title: 'Extrempunkte berechnen',
    topic: 'Analysis',
    color: '#FF7A00',
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
    color: '#FF7A00',
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
    color: '#FF7A00',
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
    color: '#FF7A00',
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
    color: '#FF7A00',
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

  'lk-a1': {
    id: 'lk-a1',
    title: 'Produktregel mit e-Funktion',
    topic: 'Analysis',
    color: '#FF7A00',
    func: 'f(x) = x² · eˣ',
    intro:
      'Wir leiten die Funktion f von x gleich x Quadrat mal e hoch x ab. Hier werden zwei Funktionen miteinander multipliziert. Genau dafür brauchst du die Produktregel.',
    steps: [
      {
        title: 'Beide Faktoren benennen',
        math: 'u(x) = x²     v(x) = eˣ',
        say: 'Wir nennen den ersten Faktor u und den zweiten Faktor v. Damit ist u von x gleich x Quadrat und v von x gleich e hoch x.',
      },
      {
        title: 'Faktoren ableiten',
        math: "u'(x) = 2x     v'(x) = eˣ",
        say: 'Jetzt leiten wir beide Faktoren einzeln ab. Aus x Quadrat wird zwei x. Die Ableitung von e hoch x ist wieder e hoch x.',
      },
      {
        title: 'Produktregel einsetzen',
        math: "f'(x) = u' · v + u · v'",
        say: 'Die Produktregel lautet: erster Faktor abgeleitet mal zweiter Faktor plus erster Faktor mal zweiter Faktor abgeleitet.',
      },
      {
        title: 'Terme zusammensetzen',
        math: "f'(x) = 2x · eˣ + x² · eˣ",
        say: 'Wir setzen die vier Teile ein. So erhalten wir zwei x mal e hoch x plus x Quadrat mal e hoch x.',
      },
      {
        title: 'Gemeinsamen Faktor ausklammern',
        math: "f'(x) = eˣ · (x² + 2x)",
        say: 'In beiden Summanden steckt e hoch x. Wir klammern diesen gemeinsamen Faktor aus. Übrig bleibt x Quadrat plus zwei x.',
      },
    ],
    outro:
      'Bei einem Produkt leitest du beide Faktoren getrennt ab und setzt sie mit der Produktregel zusammen. Das Ergebnis ist e hoch x mal Klammer auf x Quadrat plus zwei x Klammer zu.',
    result: "f'(x) = eˣ · (x² + 2x)",
    graph: { fn: (x) => x * x * Math.exp(x), xMin: -3, xMax: 1.2 },
  },

  'lk-a2': {
    id: 'lk-a2',
    title: 'Integral einer e-Funktion',
    topic: 'Analysis',
    color: '#FF7A00',
    func: '∫₀¹ e²ˣ dx',
    intro:
      'Wir berechnen das bestimmte Integral von null bis eins über e hoch zwei x. Der entscheidende Punkt ist der Faktor zwei im Exponenten.',
    steps: [
      {
        title: 'Innere Ableitung erkennen',
        math: '(2x)′ = 2',
        say: 'Im Exponenten steht zwei x. Seine Ableitung ist zwei. Diesen zusätzlichen Faktor müssen wir bei der Stammfunktion ausgleichen.',
      },
      {
        title: 'Stammfunktion bilden',
        math: 'F(x) = ½ · e²ˣ',
        say: 'Eine Stammfunktion ist ein Halb mal e hoch zwei x. Beim Ableiten entsteht durch die Kettenregel wieder der Faktor zwei. Ein Halb mal zwei ergibt eins.',
      },
      {
        title: 'Obere Grenze einsetzen',
        math: 'F(1) = ½ · e²',
        say: 'Für die obere Grenze setzen wir eins ein. Aus e hoch zwei mal eins wird e Quadrat.',
      },
      {
        title: 'Untere Grenze einsetzen',
        math: 'F(0) = ½ · e⁰ = ½',
        say: 'Für die untere Grenze setzen wir null ein. e hoch null ist eins. Damit ist groß F von null gleich ein Halb.',
      },
      {
        title: 'Oben minus unten',
        math: '½ · e² − ½ = ½ · (e² − 1)',
        say: 'Nach dem Hauptsatz rechnen wir obere Grenze minus untere Grenze. Wir klammern ein Halb aus und erhalten ein Halb mal e Quadrat minus eins.',
      },
    ],
    outro:
      'Bei e hoch a x steht in der Stammfunktion der Faktor eins durch a davor. Hier ist a gleich zwei. Das Integral ist ein Halb mal Klammer auf e Quadrat minus eins Klammer zu.',
    result: '∫₀¹ e²ˣ dx = ½ · (e² − 1) ≈ 3,19',
    graph: { fn: (x) => Math.exp(2 * x), xMin: -0.5, xMax: 1.2, shadeFrom: 0, shadeTo: 1 },
  },

  'lk-g1': {
    id: 'lk-g1',
    title: 'Ebene durch drei Punkte',
    topic: 'Lineare Algebra',
    color: '#FF7A00',
    func: 'A(1|0|0)   B(0|2|0)   C(0|0|3)',
    intro:
      'Wir bestimmen die Koordinatengleichung einer Ebene durch drei Punkte. Dafür bilden wir zwei Spannvektoren und daraus einen Normalenvektor.',
    steps: [
      {
        title: 'Ersten Spannvektor bilden',
        math: 'AB⃗ = B − A = (−1|2|0)',
        say: 'Wir ziehen A von B ab. So entsteht der erste Spannvektor mit den Komponenten minus eins, zwei und null.',
      },
      {
        title: 'Zweiten Spannvektor bilden',
        math: 'AC⃗ = C − A = (−1|0|3)',
        say: 'Danach ziehen wir A von C ab. Der zweite Spannvektor lautet minus eins, null und drei.',
      },
      {
        title: 'Normalenvektor bestimmen',
        math: 'n⃗ = AB⃗ × AC⃗ = (6|3|2)',
        say: 'Das Kreuzprodukt der beiden Spannvektoren steht senkrecht auf der Ebene. Es ergibt den Normalenvektor sechs, drei und zwei.',
      },
      {
        title: 'Koordinatenform ansetzen',
        math: '6x + 3y + 2z = d',
        say: 'Die Komponenten des Normalenvektors werden zu den Koeffizienten der Koordinatengleichung. Nur die rechte Seite d fehlt noch.',
      },
      {
        title: 'Einen Punkt einsetzen',
        math: 'A einsetzen: 6 · 1 + 3 · 0 + 2 · 0 = 6',
        say: 'Wir setzen den Punkt A ein. Damit erhalten wir für d den Wert sechs.',
      },
    ],
    outro:
      'Aus zwei Spannvektoren entsteht per Kreuzprodukt der Normalenvektor. Ein eingesetzter Punkt liefert die rechte Seite. Die Ebene lautet sechs x plus drei y plus zwei z gleich sechs.',
    result: 'E: 6x + 3y + 2z = 6',
  },

  'lk-g2': {
    id: 'lk-g2',
    title: 'Abstand Punkt und Gerade',
    topic: 'Lineare Algebra',
    color: '#FF7A00',
    func: 'P(4|6|5)   g: x⃗ = (1|2|0) + t·(0|0|1)',
    intro:
      'Wir berechnen den senkrechten Abstand eines Punktes von einer Geraden im Raum. Dafür nutzen wir ein Kreuzprodukt.',
    steps: [
      {
        title: 'Aufpunkt und Richtung ablesen',
        math: 'A(1|2|0)     u⃗ = (0|0|1)',
        say: 'Aus der Geradengleichung lesen wir den Aufpunkt A und den Richtungsvektor u ab.',
      },
      {
        title: 'Verbindungsvektor bilden',
        math: 'AP⃗ = P − A = (3|4|5)',
        say: 'Wir verbinden den Aufpunkt der Geraden mit P. Vier minus eins, sechs minus zwei und fünf minus null ergibt drei, vier und fünf.',
      },
      {
        title: 'Kreuzprodukt berechnen',
        math: 'AP⃗ × u⃗ = (4|−3|0)',
        say: 'Das Kreuzprodukt aus dem Verbindungsvektor und dem Richtungsvektor ergibt vier, minus drei und null.',
      },
      {
        title: 'Beträge bestimmen',
        math: '|AP⃗ × u⃗| = 5     |u⃗| = 1',
        say: 'Der Betrag des Kreuzprodukts ist die Wurzel aus sechzehn plus neun, also fünf. Der Richtungsvektor hat die Länge eins.',
      },
      {
        title: 'Abstandsformel anwenden',
        math: 'd = |AP⃗ × u⃗| / |u⃗| = 5',
        say: 'Wir teilen den Betrag des Kreuzprodukts durch die Länge des Richtungsvektors. Der senkrechte Abstand beträgt fünf Längeneinheiten.',
      },
    ],
    outro:
      'Der direkte Abstand zum Aufpunkt wäre falsch. Gesucht ist die senkrechte Entfernung zur ganzen Geraden. Mit der Kreuzproduktformel erhalten wir fünf Längeneinheiten.',
    result: 'd(P, g) = 5 LE',
  },

  'lk-s1': {
    id: 'lk-s1',
    title: 'Zwei-Sigma-Intervall',
    topic: 'Stochastik',
    color: '#FF7A00',
    func: 'X ~ B(100; 0,5)',
    intro:
      'Wir bestimmen das Zwei-Sigma-Intervall einer Binomialverteilung. Bei hundert Münzwürfen zählt X, wie oft Kopf erscheint.',
    steps: [
      {
        title: 'Erwartungswert berechnen',
        math: 'μ = n · p = 100 · 0,5 = 50',
        say: 'Der Erwartungswert ist n mal p. Bei hundert Versuchen mit Trefferwahrscheinlichkeit null Komma fünf liegt er bei fünfzig.',
      },
      {
        title: 'Standardabweichung berechnen',
        math: 'σ = √(n · p · (1 − p)) = √25 = 5',
        say: 'Die Standardabweichung ist die Wurzel aus n mal p mal eins minus p. Das ergibt die Wurzel aus fünfundzwanzig, also fünf.',
      },
      {
        title: 'Zwei Sigma nach unten',
        math: 'μ − 2σ = 50 − 10 = 40',
        say: 'Für die untere Grenze ziehen wir zweimal die Standardabweichung vom Erwartungswert ab. So erhalten wir vierzig.',
      },
      {
        title: 'Zwei Sigma nach oben',
        math: 'μ + 2σ = 50 + 10 = 60',
        say: 'Für die obere Grenze addieren wir zweimal die Standardabweichung. Das ergibt sechzig.',
      },
      {
        title: 'Wahrscheinlichkeit bestimmen',
        math: 'P(40 ≤ X ≤ 60) = F(60) − F(39) ≈ 96,48 %',
        say: 'Die Zwei-Sigma-Regel liefert eine Näherung von fünfundneunzig Komma vier Prozent. Mit der Binomialverteilung berechnet ergibt sich für das Intervall hier ein genauerer Wert von ungefähr sechsundneunzig Komma vier acht Prozent.',
      },
    ],
    outro:
      'Das Zwei-Sigma-Intervall liegt symmetrisch um den Erwartungswert. Hier reicht es von vierzig bis sechzig. Die exakte Binomialwahrscheinlichkeit für dieses Intervall beträgt ungefähr sechsundneunzig Komma vier acht Prozent.',
    result: '2σ-Intervall: [40; 60]     exakt P ≈ 96,48 %',
    graph: { fn: (x) => Math.exp(-0.5 * x * x), xMin: -3.5, xMax: 3.5, shadeFrom: -2, shadeTo: 2 },
  },

  'lk-s2': {
    id: 'lk-s2',
    title: 'Fehler erster Art',
    topic: 'Stochastik',
    color: '#FF7A00',
    func: 'H₀: p = 0,5     Ablehnung ab X ≥ 59',
    intro:
      'Wir berechnen bei einem Hypothesentest die Wahrscheinlichkeit für einen Fehler erster Art. Dabei wird die Nullhypothese abgelehnt, obwohl sie wahr ist.',
    steps: [
      {
        title: 'Fehlerwahrscheinlichkeit benennen',
        math: 'α = P(H₀ ablehnen | H₀ ist wahr)',
        say: 'Die Wahrscheinlichkeit für den Fehler erster Art heißt Alpha. Sie beschreibt den Fall, dass wir H null ablehnen, obwohl H null stimmt.',
      },
      {
        title: 'Ablehnungsbereich einsetzen',
        math: 'α = P(X ≥ 59 | p = 0,5)',
        say: 'Der Test verwirft ab neunundfünfzig Treffern. Unter der Nullhypothese rechnen wir deshalb mit p gleich null Komma fünf.',
      },
      {
        title: 'Stetigkeitskorrektur',
        math: 'P(X ≥ 59) ≈ P(X ≥ 58,5)',
        say: 'Für die Normalapproximation verschieben wir die Grenze um ein Halb nach unten. Aus neunundfünfzig wird achtundfünfzig Komma fünf.',
      },
      {
        title: 'Standardisieren',
        math: 'z = (58,5 − 50) / 5 = 1,7',
        say: 'Wir ziehen den Erwartungswert fünfzig ab und teilen durch die Standardabweichung fünf. Der z-Wert ist eins Komma sieben.',
      },
      {
        title: 'Rechten Rand berechnen',
        math: 'α ≈ 1 − Φ(1,7) = 1 − 0,9554 = 0,0446',
        say: 'Die Tabelle liefert die Fläche links von eins Komma sieben. Gesucht ist der rechte Rand. Deshalb rechnen wir eins minus null Komma neun fünf fünf vier.',
      },
    ],
    outro:
      'Die Wahrscheinlichkeit für einen Fehler erster Art beträgt ungefähr null Komma null vier vier sechs, also rund vier Komma fünf Prozent.',
    result: 'α ≈ 0,0446 = 4,5 %',
    graph: {
      fn: (x) => Math.exp(-0.5 * ((x - 50) / 5) ** 2),
      xMin: 30,
      xMax: 70,
      shadeFrom: 58.5,
      shadeTo: 70,
    },
  },

  l1: {
    id: 'l1',
    title: 'Abstand zweier Punkte',
    topic: 'Lineare Algebra',
    color: '#FF7A00',
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
