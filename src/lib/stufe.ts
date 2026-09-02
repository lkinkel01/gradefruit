// Welche Kursstufe gerade gilt — an genau einer Stelle entschieden.
//
// Die Regel steckte in `page.tsx` und wurde von dort an alles Weitere
// durchgereicht. Der Reel-Modus liegt aber auf einer eigenen Route und kam nie
// daran vorbei: Er stand fest auf 'gk'. Wer den Leistungskurs gekauft hatte,
// bekam dort Grundkurs-Videos zu sehen, und was er als „verstanden" markierte,
// landete an Grundkurs-Aufgaben — der eigene Fortschritt bewegte sich nicht.
//
// Deshalb liegt die Regel hier. Wer eine zweite Stelle braucht, holt sie sich
// hier ab, statt sie noch einmal aufzuschreiben.

export type Stufe = 'gk' | 'lk';

export const STUFE_KEY = 'gf-level';

/** Die zuletzt getroffene Wahl aus dem lokalen Speicher, sonst der Grundkurs. */
export function gespeicherteStufe(): Stufe {
  try {
    const wert = localStorage.getItem(STUFE_KEY);
    if (wert === 'gk' || wert === 'lk') return wert;
  } catch { /* Speicher gesperrt */ }
  return 'gk';
}

export function stufeMerken(stufe: Stufe): void {
  try { localStorage.setItem(STUFE_KEY, stufe); } catch { /* Speicher gesperrt */ }
}

/**
 * Wer genau einen Kurs besitzt, hat sich bereits entschieden — dann zählt der
 * Kauf und nicht die Einstellung. Nur Gäste und Doppelkäufer wählen selbst.
 */
export function stufeAus(owned: boolean, ownedLk: boolean, wahl: Stufe): Stufe {
  if (owned && !ownedLk) return 'gk';
  if (ownedLk && !owned) return 'lk';
  return wahl;
}

/** Wahr, wenn die Stufe überhaupt zur Wahl steht (keiner oder beide Kurse). */
export function stufeWaehlbar(owned: boolean, ownedLk: boolean): boolean {
  return owned === ownedLk;
}
