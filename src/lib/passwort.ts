/**
 * Die Bedingungen fürs Passwort — als Liste, damit sie sowohl geprüft als auch
 * angezeigt werden können.
 *
 * An EINER Stelle, weil es zwei Orte gibt, an denen ein Passwort gesetzt wird
 * (Registrierung und Zurücksetzen). Zwei Kopien derselben Regeln laufen
 * auseinander, und dann verlangt der eine Weg etwas, das der andere nicht
 * nennt — der Nutzer erfährt davon erst durch eine Ablehnung.
 */
export const PASSWORT_REGELN: { text: string; erfuellt: (p: string) => boolean }[] = [
  { text: 'Mindestens 8 Zeichen', erfuellt: p => p.length >= 8 },
  { text: 'Mindestens ein Buchstabe', erfuellt: p => /\p{L}/u.test(p) },
  { text: 'Mindestens eine Ziffer', erfuellt: p => /\d/.test(p) },
];
