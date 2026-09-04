// Einzige Quelle für alles, was auf der Seite über Preise steht — und für das,
// was tatsächlich abgebucht wird.
//
// Die Preise standen früher doppelt (Startseite und Bezahlfenster) mit dem
// Kommentar „Halte beide Werte gleich". Danach standen sie zwar an einer
// Stelle, aber der abgerechnete Betrag hing weiter an einer Umgebungsvariablen
// in Vercel. Genau das ist schiefgegangen: Auf der Seite stand 49 €, Stripe
// verlangte 79 €, weil dort noch die alte Preis-ID hinterlegt war.
//
// Deshalb ist der Betrag hier jetzt die Wahrheit. Der Server prüft vor jedem
// Kauf, ob der in Stripe hinterlegte Preis dazu passt, und bildet ihn sonst
// selbst — siehe `src/app/api/checkout/route.ts`. Eine vergessene Variable
// kann damit keinen falschen Betrag mehr abbuchen.

export type Kurs = 'gk' | 'lk';

/** Betrag in Cent — das ist der Wert, der abgerechnet wird. */
const CENT: Record<Kurs, number> = {
  gk: 4900,
  lk: 6900,
};

/** Produktname in Stripe. Wird gesucht und bei Bedarf angelegt. */
const PRODUKTNAME: Record<Kurs, string> = {
  gk: 'Mathe-Abi Hessen 2027 – Grundkurs',
  lk: 'Mathe-Abi Hessen 2027 – Leistungskurs',
};

const alsEuro = (cent: number) =>
  cent % 100 === 0
    ? `${cent / 100} €`
    : `${(cent / 100).toFixed(2).replace('.', ',')} €`;

export const PREISE = {
  gk: { label: 'Grundkurs', cent: CENT.gk, produktname: PRODUKTNAME.gk, einmalig: alsEuro(CENT.gk) },
  lk: { label: 'Leistungskurs', cent: CENT.lk, produktname: PRODUKTNAME.lk, einmalig: alsEuro(CENT.lk) },
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
