// AUTOMATISCH ERZEUGT von scripts/build-content-index.mjs — nicht von Hand ändern.
//
// Inhaltsverzeichnis für die Navigation: nur IDs und Überschriften. Diese Datei
// darf im Browser landen. Die eigentlichen Inhalte (Aufgabentexte, Lösungswege,
// Ergebnisse, typische Fehler, Formeln) liegen in src/server/content/ und
// kommen ausschließlich über /api/content — nach Zugangsprüfung.

export type ContentTopic = 'analysis' | 'linalg' | 'stochastik';
export type ContentLevel = 'gk' | 'lk';

export interface IndexTask {
  id: string;
  tag: string;
  videoId?: string;
}

export interface IndexSection {
  title: string;
}

export interface TopicIndex {
  tasks: IndexTask[];
  sections: IndexSection[];
}

export const CONTENT_INDEX: Record<ContentTopic, Record<ContentLevel, TopicIndex>> =
{
  "analysis": {
    "gk": {
      "tasks": [
        {
          "id": "an1",
          "tag": "Extrempunkte",
          "videoId": "v2"
        },
        {
          "id": "an2",
          "tag": "Wendepunkte"
        },
        {
          "id": "an3",
          "tag": "Kurvendiskussion"
        },
        {
          "id": "an4",
          "tag": "Tangente",
          "videoId": "v1"
        },
        {
          "id": "an5",
          "tag": "Bestimmtes Integral",
          "videoId": "v3"
        },
        {
          "id": "an6",
          "tag": "Fläche zur x-Achse",
          "videoId": "v3"
        },
        {
          "id": "an7",
          "tag": "Fläche zwischen zwei Kurven"
        },
        {
          "id": "an8",
          "tag": "Mittelwert (Integral)"
        },
        {
          "id": "an9",
          "tag": "Stammfunktion durch Punkt"
        },
        {
          "id": "an10",
          "tag": "Extrempunkt (e-Funktion)"
        },
        {
          "id": "an11",
          "tag": "Monotonie"
        },
        {
          "id": "an12",
          "tag": "Steckbriefaufgabe"
        },
        {
          "id": "an13",
          "tag": "Änderungsrate"
        },
        {
          "id": "an14",
          "tag": "Extremwertproblem"
        },
        {
          "id": "an15",
          "tag": "Sachkontext"
        },
        {
          "id": "an16",
          "tag": "Nullstellen"
        },
        {
          "id": "an17",
          "tag": "Symmetrie"
        },
        {
          "id": "an18",
          "tag": "Grenzverhalten"
        },
        {
          "id": "an19",
          "tag": "Normale"
        },
        {
          "id": "an20",
          "tag": "Kettenregel"
        },
        {
          "id": "an21",
          "tag": "Fläche (e-Funktion)"
        },
        {
          "id": "an22",
          "tag": "Trigonometrie"
        },
        {
          "id": "an23",
          "tag": "Sachkontext (Bestand)"
        }
      ],
      "sections": [
        {
          "title": "Einleitung"
        },
        {
          "title": "Ableitung und Grundregeln"
        },
        {
          "title": "Extrempunkte"
        },
        {
          "title": "Wendepunkte und Monotonie"
        },
        {
          "title": "Tangente und Normale"
        },
        {
          "title": "Integral und Fläche"
        },
        {
          "title": "Änderungsrate und Bestand"
        }
      ]
    },
    "lk": {
      "tasks": [
        {
          "id": "la1",
          "tag": "Produktregel (e-Funktion)"
        },
        {
          "id": "la2",
          "tag": "Kettenregel"
        },
        {
          "id": "la3",
          "tag": "Quotientenregel"
        },
        {
          "id": "la4",
          "tag": "Ableitung mit ln"
        },
        {
          "id": "la5",
          "tag": "Extrempunkte (e-Funktion)"
        },
        {
          "id": "la6",
          "tag": "Wendestellen (e-Funktion)"
        },
        {
          "id": "la7",
          "tag": "Kurvendiskussion (e-Funktion)"
        },
        {
          "id": "la8",
          "tag": "Tangente (e-Funktion)"
        },
        {
          "id": "la9",
          "tag": "Integral (e-Funktion)"
        },
        {
          "id": "la10",
          "tag": "Fläche zwischen Kurven"
        },
        {
          "id": "la11",
          "tag": "Rotationsvolumen"
        },
        {
          "id": "la12",
          "tag": "Funktionenschar"
        },
        {
          "id": "la13",
          "tag": "Partielle Integration"
        },
        {
          "id": "la14",
          "tag": "Lineare Substitution"
        },
        {
          "id": "la15",
          "tag": "Uneigentliches Integral"
        },
        {
          "id": "la16",
          "tag": "Kurvendiskussion (ln)"
        },
        {
          "id": "la17",
          "tag": "Extremwertproblem"
        },
        {
          "id": "la18",
          "tag": "Wendetangente"
        },
        {
          "id": "la19",
          "tag": "Trigonometrie (Extremstellen)"
        },
        {
          "id": "la20",
          "tag": "Ortskurve der Hochpunkte"
        },
        {
          "id": "la21",
          "tag": "Fläche mit Vorzeichenwechsel"
        },
        {
          "id": "la22",
          "tag": "Grenzverhalten"
        }
      ],
      "sections": [
        {
          "title": "Einleitung"
        },
        {
          "title": "Produkt-, Quotienten- und Kettenregel"
        },
        {
          "title": "e- und ln-Funktion"
        },
        {
          "title": "Integrationstechniken"
        },
        {
          "title": "Rotationsvolumen"
        },
        {
          "title": "Funktionenscharen und Ortskurven"
        },
        {
          "title": "Trigonometrische Funktionen"
        }
      ]
    }
  },
  "linalg": {
    "gk": {
      "tasks": [
        {
          "id": "lg1",
          "tag": "Betrag & Abstand"
        },
        {
          "id": "lg2",
          "tag": "Mittelpunkt"
        },
        {
          "id": "lg3",
          "tag": "Skalarprodukt & Winkel",
          "videoId": "v4"
        },
        {
          "id": "lg4",
          "tag": "Orthogonalität",
          "videoId": "v4"
        },
        {
          "id": "lg5",
          "tag": "Kollinearität"
        },
        {
          "id": "lg6",
          "tag": "Gerade & Punktprobe",
          "videoId": "v5"
        },
        {
          "id": "lg7",
          "tag": "Schnittpunkt zweier Geraden",
          "videoId": "v5"
        },
        {
          "id": "lg8",
          "tag": "Rechtwinkliges Dreieck"
        },
        {
          "id": "lg9",
          "tag": "Parallelogramm"
        },
        {
          "id": "lg10",
          "tag": "Dreiecksfläche (Kreuzprodukt)"
        },
        {
          "id": "lg11",
          "tag": "Ebene (Koordinatenform)"
        },
        {
          "id": "lg12",
          "tag": "Spurpunkte einer Ebene"
        },
        {
          "id": "lg13",
          "tag": "Schnitt Gerade–Ebene"
        },
        {
          "id": "lg14",
          "tag": "Abstand Punkt–Ebene"
        },
        {
          "id": "lg15",
          "tag": "Einheitsvektor"
        },
        {
          "id": "lg16",
          "tag": "Schwerpunkt"
        },
        {
          "id": "lg17",
          "tag": "Lagebeziehung Geraden"
        },
        {
          "id": "lg18",
          "tag": "Lagebeziehung Gerade–Ebene"
        },
        {
          "id": "lg19",
          "tag": "Ebene aus 3 Punkten"
        },
        {
          "id": "lg20",
          "tag": "Parameter- zu Koordinatenform"
        },
        {
          "id": "lg21",
          "tag": "Punktspiegelung"
        },
        {
          "id": "lg22",
          "tag": "Raute (Nachweis)"
        }
      ],
      "sections": [
        {
          "title": "Einleitung"
        },
        {
          "title": "Vektoren und Abstände"
        },
        {
          "title": "Skalarprodukt und Winkel"
        },
        {
          "title": "Geraden"
        },
        {
          "title": "Ebenen"
        },
        {
          "title": "Abstand und Flächen"
        }
      ]
    },
    "lk": {
      "tasks": [
        {
          "id": "ll1",
          "tag": "Ebene durch 3 Punkte"
        },
        {
          "id": "ll2",
          "tag": "Schnittgerade zweier Ebenen"
        },
        {
          "id": "ll3",
          "tag": "Winkel zwischen Ebenen"
        },
        {
          "id": "ll4",
          "tag": "Winkel Gerade–Ebene"
        },
        {
          "id": "ll5",
          "tag": "Windschiefe Geraden"
        },
        {
          "id": "ll6",
          "tag": "Abstand Punkt–Gerade"
        },
        {
          "id": "ll7",
          "tag": "Abstand windschiefer Geraden"
        },
        {
          "id": "ll8",
          "tag": "Lotfußpunkt"
        },
        {
          "id": "ll9",
          "tag": "Spiegelpunkt an Ebene"
        },
        {
          "id": "ll10",
          "tag": "Lineares Gleichungssystem"
        },
        {
          "id": "ll11",
          "tag": "Übergangsmatrix"
        },
        {
          "id": "ll12",
          "tag": "Volumen (Spatprodukt)"
        },
        {
          "id": "ll13",
          "tag": "Kugelgleichung (quadr. Ergänzung)"
        },
        {
          "id": "ll14",
          "tag": "Schnitt Gerade–Kugel"
        },
        {
          "id": "ll15",
          "tag": "Abstand paralleler Ebenen"
        },
        {
          "id": "ll16",
          "tag": "Lagebeziehung zweier Ebenen"
        },
        {
          "id": "ll17",
          "tag": "Stationäre Verteilung (Fixvektor)"
        },
        {
          "id": "ll18",
          "tag": "Übergangsmatrix (2 Schritte)"
        },
        {
          "id": "ll19",
          "tag": "Abstand Punkt–Ebene"
        },
        {
          "id": "ll20",
          "tag": "Spurpunkte & Volumen"
        },
        {
          "id": "ll21",
          "tag": "Spiegelpunkt an Gerade"
        },
        {
          "id": "ll22",
          "tag": "Gerade liegt in Ebene (Nachweis)"
        }
      ],
      "sections": [
        {
          "title": "Einleitung"
        },
        {
          "title": "Kreuz- und Spatprodukt"
        },
        {
          "title": "Lagebeziehungen und Winkel"
        },
        {
          "title": "Abstände und Spiegelungen"
        },
        {
          "title": "Kugeln"
        },
        {
          "title": "Übergangsmatrizen"
        }
      ]
    }
  },
  "stochastik": {
    "gk": {
      "tasks": [
        {
          "id": "st1",
          "tag": "Laplace-Wahrscheinlichkeit"
        },
        {
          "id": "st2",
          "tag": "Baumdiagramm (ohne Zurücklegen)"
        },
        {
          "id": "st3",
          "tag": "Gegenwahrscheinlichkeit"
        },
        {
          "id": "st4",
          "tag": "Kombinatorik"
        },
        {
          "id": "st5",
          "tag": "Erwartungswert"
        },
        {
          "id": "st6",
          "tag": "Standardabweichung"
        },
        {
          "id": "st7",
          "tag": "Faires Spiel"
        },
        {
          "id": "st8",
          "tag": "Unabhängigkeit"
        },
        {
          "id": "st9",
          "tag": "Vierfeldertafel"
        },
        {
          "id": "st10",
          "tag": "Satz von Bayes"
        },
        {
          "id": "st11",
          "tag": "Binomialverteilung P(X=k)",
          "videoId": "v6"
        },
        {
          "id": "st12",
          "tag": "Binomial (mindestens eins)",
          "videoId": "v6"
        },
        {
          "id": "st13",
          "tag": "Binomial: μ und σ"
        },
        {
          "id": "st14",
          "tag": "Binomial (mindestens 8)"
        },
        {
          "id": "st15",
          "tag": "Binomial (höchstens k)"
        },
        {
          "id": "st16",
          "tag": "Mindestanzahl (Binomial)"
        },
        {
          "id": "st17",
          "tag": "Baumdiagramm (genau eins)"
        },
        {
          "id": "st18",
          "tag": "Bedingte Wahrscheinlichkeit"
        },
        {
          "id": "st19",
          "tag": "Additionssatz"
        },
        {
          "id": "st20",
          "tag": "Wahrscheinlichkeitsverteilung"
        },
        {
          "id": "st21",
          "tag": "Sigma-Regeln"
        },
        {
          "id": "st22",
          "tag": "Hypothesentest"
        }
      ],
      "sections": [
        {
          "title": "Einleitung"
        },
        {
          "title": "Grundlagen"
        },
        {
          "title": "Baumdiagramme"
        },
        {
          "title": "Bedingte Wahrscheinlichkeit"
        },
        {
          "title": "Erwartungswert und Streuung"
        },
        {
          "title": "Binomialverteilung"
        }
      ]
    },
    "lk": {
      "tasks": [
        {
          "id": "sl1",
          "tag": "σ-Regeln (Binomial)"
        },
        {
          "id": "sl2",
          "tag": "Erwartungswert & σ"
        },
        {
          "id": "sl3",
          "tag": "Normalapproximation"
        },
        {
          "id": "sl4",
          "tag": "Mindestens-eins (Binomial)"
        },
        {
          "id": "sl5",
          "tag": "Kleinstes n bestimmen"
        },
        {
          "id": "sl6",
          "tag": "Konfidenzintervall"
        },
        {
          "id": "sl7",
          "tag": "Hypothesentest · Fehler 1. Art"
        },
        {
          "id": "sl8",
          "tag": "Hypothesentest · Fehler 2. Art"
        },
        {
          "id": "sl9",
          "tag": "Totale W. & Bayes"
        },
        {
          "id": "sl10",
          "tag": "Kumulierte Binomialverteilung"
        },
        {
          "id": "sl11",
          "tag": "Zweiseitiger Test"
        },
        {
          "id": "sl12",
          "tag": "Erwartungswert & σ (allg. ZG)"
        },
        {
          "id": "sl13",
          "tag": "Geometrische Verteilung (Wartezeit)"
        },
        {
          "id": "sl14",
          "tag": "Hypergeometrische Verteilung"
        },
        {
          "id": "sl15",
          "tag": "Kritischer Wert (einseitiger Test)"
        },
        {
          "id": "sl16",
          "tag": "Normalapproximation (Intervall)"
        },
        {
          "id": "sl17",
          "tag": "Vierfeldertafel & bedingte W."
        },
        {
          "id": "sl18",
          "tag": "Erwartungswert eines Spiels"
        },
        {
          "id": "sl19",
          "tag": "Ziehen ohne Zurücklegen (Baum)"
        },
        {
          "id": "sl20",
          "tag": "Kombinatorik (Laplace)"
        },
        {
          "id": "sl21",
          "tag": "Lineare Transformation (E & σ)"
        },
        {
          "id": "sl22",
          "tag": "Additionssatz (Siebformel)"
        }
      ],
      "sections": [
        {
          "title": "Einleitung"
        },
        {
          "title": "Binomialverteilung vertieft"
        },
        {
          "title": "Hypothesentests"
        },
        {
          "title": "Normalapproximation"
        },
        {
          "title": "Totale Wahrscheinlichkeit und Bayes"
        },
        {
          "title": "Weitere Verteilungen und Transformationen"
        }
      ]
    }
  }
};

/** Aufgaben eines Themas in der gewählten Stufe — nur Überschriften. */
export function indexFor(topic: ContentTopic, level: ContentLevel): TopicIndex {
  return CONTENT_INDEX[topic][level];
}
