/**
 * Inhalte der öffentlichen Seiten an einer Stelle.
 *
 * Vorher standen sie als Konstanten in der Startseite und waren damit nur dort
 * verwendbar. Seit es eigene Seiten gibt, greifen Startseite und Unterseite auf
 * dieselbe Quelle zu — sonst stünden dieselben Sätze bald zweimal da und
 * würden auseinanderlaufen.
 *
 * Hier steht ausschließlich, was es wirklich gibt.
 */

export const MERKMALE = [
  {
    titel: 'Ein klarer Weg durch den Stoff',
    text: 'Zusammenfassungen, Übungen und prüfungsnahe Aufgaben im Stil der hessischen Abiturprüfung — nach Themen sortiert.',
  },
  {
    titel: 'Ein Coach, der die Stelle kennt',
    text: 'Frag direkt an der Aufgabe nach, vor der du sitzt. „Kapier ich nicht" reicht völlig.',
  },
  {
    titel: 'Erst selbst rechnen, dann vergleichen',
    text: 'Jede Aufgabe mit Lösungsweg Schritt für Schritt — und den zwei Fehlern, die man dabei typischerweise macht.',
  },
  {
    titel: 'Deine eigenen Unterlagen',
    text: 'Lade deinen Rechenweg als Foto oder PDF hoch und geh ihn mit dem Coach durch.',
  },
  {
    titel: 'Wiederholen im Swipe-Format',
    text: 'Der Reel-Modus zeigt Aufgaben und Formeln im Hochformat — wie du es von TikTok kennst.',
  },
] as const;

export const THEMEN = [
  {
    titel: 'Analysis',
    inhalt: 'Differenzial- und Integralrechnung, Kurvendiskussion, Exponentialfunktionen, Optimierung',
  },
  {
    titel: 'Lineare Algebra und Geometrie',
    inhalt: 'Vektoren, Geraden, Ebenen, lineare Gleichungssysteme, Abstände und Schnitte',
  },
  {
    titel: 'Stochastik',
    inhalt: 'Wahrscheinlichkeit, Binomialverteilung, Erwartungswert, Varianz und Hypothesentests',
  },
] as const;

export const FRAGEN = [
  {
    frage: 'Für wen ist Gradefruit?',
    antwort: 'Für Schüler:innen im Grundkurs oder Leistungskurs, die 2027 ihr schriftliches Mathe-Abitur in Hessen schreiben.',
  },
  {
    frage: 'Was unterscheidet Gradefruit von anderen Lernplattformen?',
    antwort: 'Gradefruit ist nicht für jedes Fach gebaut. Lernstand, Wiederholung, Aufgaben, Lösungen und Coach greifen für genau ein Ziel ineinander.',
  },
  {
    frage: 'Wie funktioniert der Coach?',
    antwort: 'Er kennt die Aufgabe, Formel oder Lösung, die du gerade ansiehst. So fragst du genau an der Stelle, an der du nicht weiterkommst.',
  },
  {
    frage: 'Welche Inhalte gibt es?',
    antwort: 'Prüfungsnahe Aufgaben, Schritt-für-Schritt-Lösungen, Formelsammlungen und Erklärvideos für Analysis, lineare Algebra und Stochastik.',
  },
  {
    frage: 'Kann ich eigene Unterlagen nutzen?',
    antwort: 'Du kannst deinen Lösungsweg als Foto oder PDF hochladen und mit dem Coach besprechen.',
  },
  {
    frage: 'Welche Bundesländer werden unterstützt?',
    antwort: 'Hessen, Abiturjahrgang 2027. Mehr nicht — dafür dieses eine richtig.',
  },
] as const;
