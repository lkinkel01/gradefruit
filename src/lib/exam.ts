// Einzige Quelle für den Prüfungstermin. Wird auf der Übersicht (Countdown)
// und im Reel-Modus (Motivations-Karte) angezeigt.
//
// Voraussichtlicher Termin der schriftlichen Mathe-Abiturprüfung Hessen 2027.
// Sobald das Hessische Kultusministerium den offiziellen Termin veröffentlicht:
// HIER eintragen und EXAM_DATE_IS_PRELIMINARY auf false setzen – die
// „voraussichtlich"-Labels verschwinden dann überall von selbst.
export const EXAM_DATE = new Date('2027-05-03T09:00:00');
export const EXAM_DATE_IS_PRELIMINARY = true;

// Verbleibende Tage bis zur Prüfung (nie negativ).
export function daysUntilExam(now: Date = new Date()): number {
  return Math.max(0, Math.ceil((EXAM_DATE.getTime() - now.getTime()) / 86_400_000));
}
