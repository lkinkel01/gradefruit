/**
 * Name für die Vorschau ohne Anmeldung.
 *
 * Wer „Kostenlos testen" klickt, landet in der echten Lernoberfläche, ohne ein
 * Konto zu haben. Ohne Namen stand dort „Guten Tag." und die Kachel oben
 * rechts war leer — die Oberfläche wirkte halbfertig statt einladend.
 *
 * Warum „Alex" und nicht mehr „Max Mustermann": Der Mustermann ist als
 * Formular-Platzhalter erkennbar und sagt damit „das hier ist eine Attrappe" —
 * ausgerechnet in der Vorschau, die überzeugen soll. „Alex" liest sich wie ein
 * echter Name, ist geschlechtsneutral und in mehreren Sprachen gebräuchlich.
 * Dieselbe Begrüßung steht auch auf den Werbebildern, deshalb soll sie
 * niemanden ausschließen.
 */
export const VORSCHAU_NAME = 'Alex';

/** Kürzel für die Kachel oben rechts. */
export const VORSCHAU_INITIALEN = 'A';

/** Nur der Vorname für die Begrüßung — „Guten Tag, Alex." */
export const VORSCHAU_VORNAME = 'Alex';
