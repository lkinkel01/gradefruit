/**
 * Die Texte der täglichen Lernerinnerung.
 *
 * Oben steht immer „Gradefruit" — der Titel ist die Marke, nicht die Botschaft.
 * Darunter ein Satz, der weiß, wo der Nutzer steht.
 *
 * Warum überhaupt personalisiert: Eine Mitteilung, die jeden Tag denselben
 * Spruch bringt, wird nach einer Woche weggewischt, ohne gelesen zu werden.
 * „Du hast 15 % geschafft" ist kein Spruch, sondern eine Tatsache über den
 * eigenen Fortschritt, und die liest man.
 *
 * Die Auswahl passiert auf dem Gerät, im Moment des Planens. Keine Daten
 * verlassen dafür das Handy.
 */

export type Lage = {
  /** Anteil verstandener Aufgaben, 0 bis 100. */
  prozent: number;
  /** Tage seit der letzten Nutzung. 0 = heute schon da gewesen. */
  tageWeg: number;
  /** Tage bis zur schriftlichen Prüfung. */
  tageBisPruefung: number;
};

/**
 * Der passende Satz zur Lage.
 *
 * Reihenfolge ist Absicht: Wer lange weg war, braucht einen anderen Anstoß als
 * wer gestern noch da war. Erst danach zählt der Fortschritt, und ganz am
 * Schluss stehen die allgemeinen Sätze.
 */
export function erinnerungsText(lage: Lage): string {
  const { prozent, tageWeg, tageBisPruefung } = lage;

  // 1) Abwesenheit hat Vorrang. Wer eine Woche weg war, will nicht hören, wie
  //    gut er vorankommt.
  if (tageWeg >= 7) return 'Eine Woche Pause ist okay. Heute zehn Minuten sind ein guter Wiedereinstieg.';
  if (tageWeg >= 3) return `${tageWeg} Tage nichts gemacht. Eine Aufgabe reicht, um wieder drin zu sein.`;
  if (tageWeg === 2) return 'Zwei Tage nicht im Kurs gewesen. Heute wieder einsteigen?';

  // 2) Fortschritt. Die Zahl ist der Punkt, nicht das Lob drumherum.
  if (prozent === 0) return 'Noch keine Aufgabe verstanden. Die erste ist die schwerste.';
  if (prozent >= 90) return `${prozent} % geschafft. Der Rest ist Wiederholen.`;
  if (prozent >= 50) return `Über die Hälfte: ${prozent} % verstanden. Weiter geht es.`;
  if (prozent >= 10) return `${prozent} % des Kurses geschafft. Heute ein Stück mehr.`;
  if (prozent > 0) return `${prozent} % stehen schon. Jeden Tag ein bisschen bringt dich hin.`;

  // 3) Ohne besonderen Anlass: der Prüfungstermin als ruhiger Anker.
  if (tageBisPruefung <= 30) return `Noch ${tageBisPruefung} Tage bis zur Prüfung. Heute zählt.`;
  if (tageBisPruefung <= 100) return `Noch ${tageBisPruefung} Tage. Wer jetzt dranbleibt, muss später nicht rennen.`;
  return 'Jeden Tag ein bisschen schlägt alles auf einmal.';
}
