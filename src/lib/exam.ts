// Einzige Quelle für den Prüfungstermin. Wird auf der Übersicht (Countdown),
// der Startseite und im Reel-Modus (Motivations-Karte) angezeigt.
//
// Offizieller Termin der schriftlichen Mathe-Abiturprüfung Hessen 2027
// (Haupttermin, Grund- und Leistungskurse): Mittwoch, 5. Mai 2027.
// Quelle: Hessisches Ministerium für Kultus, Bildung und Chancen,
// „Termine Landesabitur 2027" (kultus.hessen.de; Abiturerlass zum
// Landesabitur 2027, Erlass vom 2. Juli 2025). Schriftlicher Prüfungszeitraum
// insgesamt: 15. April bis 5. Mai 2027; Mathematik ist der letzte Prüfungstag.
export const EXAM_DATE = new Date('2027-05-05T09:00:00');
export const EXAM_DATE_IS_PRELIMINARY = false;

// Verbleibende Tage bis zur Prüfung (nie negativ).
export function daysUntilExam(now: Date = new Date()): number {
  return Math.max(0, Math.ceil((EXAM_DATE.getTime() - now.getTime()) / 86_400_000));
}
