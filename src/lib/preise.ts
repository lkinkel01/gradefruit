// Einzige Quelle für alles, was auf der Seite über Preise steht.
//
// Vorher standen die Preise doppelt — in der Startseite und im Checkout — mit
// einem Kommentar „Halte beide Werte gleich". Genau so etwas läuft irgendwann
// auseinander, und dann steht auf der Startseite ein anderer Preis als im
// Bezahlfenster. Deshalb jetzt an einer Stelle.
//
// WICHTIG: Abgerechnet wird IMMER der echte Preis aus Stripe. Wer hier etwas
// ändert, muss ihn in Stripe genauso ändern — sonst weicht die Anzeige von der
// Abbuchung ab, und das ist ein Rechtsproblem, kein Schönheitsfehler.

export const PREISE = {
  gk: { label: 'Grundkurs', einmalig: '49 €' },
  lk: { label: 'Leistungskurs', einmalig: '69 €' },
} as const;

/**
 * Steht Gradefruit unter der Kleinunternehmerregelung (§ 19 UStG)?
 *
 * Diese Entscheidung fällt im Fragebogen zur steuerlichen Erfassung bei ELSTER.
 * Sobald sie getroffen ist, hier umstellen — der Hinweis erscheint dann überall
 * automatisch richtig. Steht er falsch da, ist die Preisangabe fehlerhaft.
 */
export const KLEINUNTERNEHMER = false;

export const STEUERHINWEIS = KLEINUNTERNEHMER
  ? 'Gemäß § 19 UStG wird keine Umsatzsteuer erhoben.'
  : 'Alle Preise inkl. gesetzlicher Umsatzsteuer.';

/**
 * Dieselbe Aussage, aber als Anschlusssatz für die Rechtstexte formuliert —
 * dort steht davor „Alle Preise sind Endpreise in Euro."
 */
export const STEUERHINWEIS_AGB = KLEINUNTERNEHMER
  ? 'Gemäß § 19 UStG wird keine Umsatzsteuer erhoben und ausgewiesen.'
  : 'Sie enthalten die gesetzliche Umsatzsteuer.';
