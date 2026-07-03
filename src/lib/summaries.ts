// Themen-Zusammenfassungen mit den wichtigsten Formeln ("Formelsammlung").
// Pro Prüfungsgebiet und Kursstufe: kompakte Abschnitte in Lern-Reihenfolge.
// Selbst formuliert, orientiert am hessischen Lehrplan.

export interface SummarySection {
  title: string;
  text: string;
  formulas: string[];
}

export interface TopicSummary {
  intro: string;
  sections: SummarySection[];
}

export const SUMMARIES: Record<'analysis' | 'linalg' | 'stochastik', Record<'gk' | 'lk', TopicSummary>> = {
  analysis: {
    gk: {
      intro:
        'Analysis dreht sich um zwei Fragen: Wie schnell ändert sich etwas (Ableitung) und wie viel kommt insgesamt zusammen (Integral). Diese Zusammenfassung bündelt alles, was du im Grundkurs sicher können musst.',
      sections: [
        {
          title: 'Ableitung und Grundregeln',
          text: 'Die Ableitung f′(x₀) ist die Steigung des Graphen an der Stelle x₀. Polynome leitest du Glied für Glied mit der Potenzregel ab.',
          formulas: [
            '(xⁿ)′ = n · xⁿ⁻¹',
            '(c · f)′ = c · f′,   (f + g)′ = f′ + g′',
            '(e^(ax+b))′ = a · e^(ax+b)',
          ],
        },
        {
          title: 'Extrempunkte',
          text: 'Kandidaten liefert f′(x) = 0. Ob Hoch- oder Tiefpunkt, entscheidet die zweite Ableitung. Zum Punkt gehört immer auch der y-Wert.',
          formulas: [
            'notwendig: f′(x₀) = 0',
            'f″(x₀) < 0 → Hochpunkt,   f″(x₀) > 0 → Tiefpunkt',
          ],
        },
        {
          title: 'Wendepunkte und Monotonie',
          text: 'Wendestellen findest du über f″(x) = 0 mit f‴(x₀) ≠ 0. Das Vorzeichen von f′ verrät, wo der Graph steigt oder fällt.',
          formulas: [
            'Wendepunkt: f″(x₀) = 0 und f‴(x₀) ≠ 0',
            'f′(x) > 0 → streng monoton steigend,   f′(x) < 0 → fallend',
          ],
        },
        {
          title: 'Tangente und Normale',
          text: 'Die Tangente berührt den Graphen mit der Steigung f′(x₀). Die Normale steht senkrecht darauf.',
          formulas: [
            't(x) = f′(x₀) · (x − x₀) + f(x₀)',
            'Normale: m = −1 / f′(x₀)',
          ],
        },
        {
          title: 'Integral und Fläche',
          text: 'Das bestimmte Integral berechnest du über eine Stammfunktion F. Für Flächen unterhalb der x-Achse nimmst du den Betrag, bei zwei Kurven integrierst du die Differenz.',
          formulas: [
            '∫ₐᵇ f(x) dx = F(b) − F(a)',
            'Fläche zwischen f und g: ∫ₐᵇ (f(x) − g(x)) dx',
            'Mittelwert: m = 1/(b − a) · ∫ₐᵇ f(x) dx',
          ],
        },
        {
          title: 'Änderungsrate und Bestand',
          text: 'In Sachaufgaben ist f′ die momentane Änderungsrate. Umgekehrt liefert das Integral über eine Rate den Bestand.',
          formulas: [
            'Änderung des Bestands: B(b) − B(a) = ∫ₐᵇ r(t) dt',
          ],
        },
      ],
    },
    lk: {
      intro:
        'Im Leistungskurs kommen e- und ln-Funktionen, stärkere Ableitungsregeln, Integrationstechniken und Funktionenscharen dazu. Diese Übersicht sammelt die Werkzeuge, die in fast jeder LK-Aufgabe stecken.',
      sections: [
        {
          title: 'Produkt-, Quotienten- und Kettenregel',
          text: 'Produkte, Brüche und Verkettungen leitest du mit den drei großen Regeln ab. Bei Verkettungen immer die innere Ableitung nachziehen.',
          formulas: [
            '(u · v)′ = u′v + uv′',
            '(u / v)′ = (u′v − uv′) / v²',
            '(f(g(x)))′ = f′(g(x)) · g′(x)',
          ],
        },
        {
          title: 'e- und ln-Funktion',
          text: 'e^x ist ihre eigene Ableitung, ln x lebt nur für x > 0. Exponentialgleichungen löst du durch Logarithmieren.',
          formulas: [
            '(e^x)′ = e^x,   (ln x)′ = 1/x',
            'e^(ln x) = x,   ln(e^x) = x',
            'e^x = c  →  x = ln c   (c > 0)',
          ],
        },
        {
          title: 'Integrationstechniken',
          text: 'Partielle Integration hilft bei Produkten wie x · e^x, die lineare Substitution bei inneren Funktionen ax + b. Uneigentliche Integrale untersuchst du über den Grenzwert.',
          formulas: [
            '∫ u′v = uv − ∫ uv′',
            '∫ f(ax + b) dx = 1/a · F(ax + b) + C',
            '∫₁^∞ f(x) dx = lim_{z→∞} ∫₁^z f(x) dx',
          ],
        },
        {
          title: 'Rotationsvolumen',
          text: 'Rotiert der Graph von f um die x-Achse, entsteht ein Körper, dessen Volumen du über das Quadrat von f integrierst.',
          formulas: [
            'V = π · ∫ₐᵇ (f(x))² dx',
          ],
        },
        {
          title: 'Funktionenscharen und Ortskurven',
          text: 'Ein Parameter t erzeugt eine ganze Familie von Graphen. Für die Ortskurve besonderer Punkte drückst du t durch x aus und setzt ein.',
          formulas: [
            'Extrempunkt E(x(t) | y(t))  →  t eliminieren  →  y = f(x)',
          ],
        },
        {
          title: 'Trigonometrische Funktionen',
          text: 'sin und cos leiten sich zyklisch ab. Extrem- und Wendestellen wiederholen sich mit der Periode.',
          formulas: [
            '(sin x)′ = cos x,   (cos x)′ = −sin x',
            'Periode von sin(bx): p = 2π / b',
          ],
        },
      ],
    },
  },
  linalg: {
    gk: {
      intro:
        'In der linearen Algebra beschreibst du Punkte, Geraden und Ebenen im Raum mit Vektoren. Fast alles läuft über drei Werkzeuge: Betrag, Skalarprodukt und Lagebeziehungen.',
      sections: [
        {
          title: 'Vektoren und Abstände',
          text: 'Ein Vektor verbindet zwei Punkte. Sein Betrag ist die Länge, der Abstand zweier Punkte der Betrag des Verbindungsvektors.',
          formulas: [
            'AB→ = B − A',
            '|a→| = √(a₁² + a₂² + a₃²)',
            'Mittelpunkt: M = ½ · (A + B)',
          ],
        },
        {
          title: 'Skalarprodukt und Winkel',
          text: 'Das Skalarprodukt misst Winkel. Ist es null, stehen die Vektoren senkrecht aufeinander.',
          formulas: [
            'a→ · b→ = a₁b₁ + a₂b₂ + a₃b₃',
            'cos φ = (a→ · b→) / (|a→| · |b→|)',
            'a→ ⊥ b→  ⇔  a→ · b→ = 0',
          ],
        },
        {
          title: 'Geraden',
          text: 'Eine Gerade besteht aus Aufpunkt und Richtungsvektor. Für die Punktprobe setzt du ein und prüfst, ob ein gemeinsames t alle Zeilen erfüllt. Bei zwei Geraden gilt: parallel, identisch, schneidend oder windschief.',
          formulas: [
            'g: x→ = p→ + t · u→',
          ],
        },
        {
          title: 'Ebenen',
          text: 'Die Koordinatenform gewinnst du aus einem Normalenvektor. Spurpunkte sind die Schnittpunkte mit den Achsen, den Schnitt mit einer Geraden liefert Einsetzen.',
          formulas: [
            'E: n₁x₁ + n₂x₂ + n₃x₃ = d,   n→ ⊥ E',
            'Spurpunkt auf x₁-Achse: S₁(d/n₁ | 0 | 0)',
          ],
        },
        {
          title: 'Abstand und Flächen',
          text: 'Den Abstand Punkt–Ebene liefert die Hessesche Normalenform. Dreiecksflächen berechnest du über das Kreuzprodukt.',
          formulas: [
            'd(P, E) = |n₁p₁ + n₂p₂ + n₃p₃ − d| / |n→|',
            'A = ½ · |AB→ × AC→|',
          ],
        },
      ],
    },
    lk: {
      intro:
        'Der Leistungskurs erweitert die Geometrie um Kreuz- und Spatprodukt, Kugeln, Spiegelungen und Übergangsmatrizen. Die Grundwerkzeuge aus dem Grundkurs bleiben die Basis.',
      sections: [
        {
          title: 'Kreuz- und Spatprodukt',
          text: 'Das Kreuzprodukt liefert einen Normalenvektor und Flächen, das Spatprodukt Volumina.',
          formulas: [
            'a→ × b→ = (a₂b₃ − a₃b₂ | a₃b₁ − a₁b₃ | a₁b₂ − a₂b₁)',
            'Spat: V = |(a→ × b→) · c→|,   Pyramide: V = 1/6 · |(a→ × b→) · c→|',
          ],
        },
        {
          title: 'Lagebeziehungen und Winkel',
          text: 'Zwei Ebenen schneiden sich in einer Geraden, wenn ihre Normalenvektoren nicht parallel sind. Winkel berechnest du immer über das Skalarprodukt, bei Gerade–Ebene mit Sinus.',
          formulas: [
            'Ebenen: cos φ = |n₁→ · n₂→| / (|n₁→| · |n₂→|)',
            'Gerade–Ebene: sin φ = |u→ · n→| / (|u→| · |n→|)',
          ],
        },
        {
          title: 'Abstände und Spiegelungen',
          text: 'Für Spiegelungen fällst du das Lot: Lotfußpunkt F bestimmen, dann über F hinaus verdoppeln.',
          formulas: [
            'P′ = P + 2 · PF→',
            'd(P, g) über Lotfußpunkt oder Hilfsebene',
          ],
        },
        {
          title: 'Kugeln',
          text: 'Eine Kugel ist durch Mittelpunkt und Radius bestimmt. Die Lage einer Geraden ergibt sich durch Einsetzen und die Zahl der Lösungen.',
          formulas: [
            'K: (x₁ − m₁)² + (x₂ − m₂)² + (x₃ − m₃)² = r²',
            '0 / 1 / 2 Lösungen → Passante / Tangente / Sekante',
          ],
        },
        {
          title: 'Übergangsmatrizen',
          text: 'Prozesse mit festen Übergangsquoten beschreibst du als Matrix mal Verteilungsvektor. Die stationäre Verteilung ändert sich nicht mehr.',
          formulas: [
            'v⁽ⁿ⁺¹⁾ = M · v⁽ⁿ⁾',
            'stationär: M · v = v',
          ],
        },
      ],
    },
  },
  stochastik: {
    gk: {
      intro:
        'Stochastik beschreibt Zufall mit Zahlen: von einfachen Laplace-Experimenten über Baumdiagramme bis zur Binomialverteilung. Diese Übersicht enthält alle Standard-Werkzeuge des Grundkurses.',
      sections: [
        {
          title: 'Grundlagen',
          text: 'Beim Laplace-Experiment sind alle Ergebnisse gleich wahrscheinlich. Oft ist das Gegenereignis der schnellere Weg.',
          formulas: [
            'P(A) = günstige / mögliche',
            'P(Ā) = 1 − P(A)',
            'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)',
          ],
        },
        {
          title: 'Baumdiagramme',
          text: 'Entlang eines Pfades multiplizierst du, mehrere Pfade addierst du. Ohne Zurücklegen ändern sich die Brüche von Stufe zu Stufe.',
          formulas: [
            'Pfadregel: multiplizieren,   Summenregel: addieren',
          ],
        },
        {
          title: 'Bedingte Wahrscheinlichkeit',
          text: 'Die Vierfeldertafel sortiert die Anteile, daraus liest du bedingte Wahrscheinlichkeiten ab. Unabhängig sind Ereignisse, wenn die Produktformel gilt.',
          formulas: [
            'P_B(A) = P(A ∩ B) / P(B)',
            'unabhängig  ⇔  P(A ∩ B) = P(A) · P(B)',
          ],
        },
        {
          title: 'Erwartungswert und Streuung',
          text: 'Der Erwartungswert ist der Durchschnitt auf lange Sicht, die Standardabweichung misst die Streuung. Ein Spiel ist fair, wenn der erwartete Gewinn null ist.',
          formulas: [
            'E(X) = Σ xᵢ · P(X = xᵢ)',
            'σ = √(Var(X)),   Var(X) = Σ (xᵢ − E(X))² · P(X = xᵢ)',
          ],
        },
        {
          title: 'Binomialverteilung',
          text: 'Sie zählt Treffer bei n gleichen, unabhängigen Versuchen mit Trefferwahrscheinlichkeit p. Mindestens-Aufgaben löst du über das Gegenereignis.',
          formulas: [
            'P(X = k) = C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ',
            'μ = n · p,   σ = √(n · p · (1 − p))',
            'P(X ≥ 1) = 1 − (1 − p)ⁿ',
          ],
        },
      ],
    },
    lk: {
      intro:
        'Im Leistungskurs kommen Hypothesentests, die Normalapproximation und weitere Verteilungen dazu. Wichtig ist vor allem der sichere Umgang mit kumulierten Wahrscheinlichkeiten.',
      sections: [
        {
          title: 'Binomialverteilung vertieft',
          text: 'Kumulierte Wahrscheinlichkeiten setzt du aus Intervallen zusammen. Die Sigma-Regeln geben schnelle Näherungen um den Erwartungswert.',
          formulas: [
            'P(a ≤ X ≤ b) = P(X ≤ b) − P(X ≤ a − 1)',
            '≈ 95,4 % in [μ − 2σ; μ + 2σ]',
          ],
        },
        {
          title: 'Hypothesentests',
          text: 'Du testest eine Annahme p₀ gegen Daten. Der Ablehnungsbereich wird so gewählt, dass der Fehler 1. Art höchstens dem Signifikanzniveau entspricht.',
          formulas: [
            'einseitig rechts: kleinste Zahl k mit P(X ≥ k) ≤ α',
            'Fehler 1. Art: H₀ fälschlich verworfen',
          ],
        },
        {
          title: 'Normalapproximation',
          text: 'Für großes σ nähert die Normalverteilung die Binomialverteilung an. Damit rechnest du Intervalle über die Standardisierung.',
          formulas: [
            'Faustregel: σ = √(npq) > 3',
            'z = (x − μ) / σ',
          ],
        },
        {
          title: 'Totale Wahrscheinlichkeit und Bayes',
          text: 'Die totale Wahrscheinlichkeit summiert über alle Zweige, Bayes dreht die Bedingung um.',
          formulas: [
            'P(B) = P(A) · P_A(B) + P(Ā) · P_Ā(B)',
            'P_B(A) = P(A) · P_A(B) / P(B)',
          ],
        },
        {
          title: 'Weitere Verteilungen und Transformationen',
          text: 'Die geometrische Verteilung wartet auf den ersten Treffer, die hypergeometrische zieht ohne Zurücklegen. Lineare Transformationen verschieben Erwartungswert und strecken die Streuung.',
          formulas: [
            'P(X = k) = (1 − p)ᵏ⁻¹ · p,   E(X) = 1/p',
            'E(aX + b) = a · E(X) + b,   σ(aX + b) = |a| · σ(X)',
          ],
        },
      ],
    },
  },
};
