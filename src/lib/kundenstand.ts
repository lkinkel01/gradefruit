'use client';

import { useAuth } from './AuthContext';
import { useProgress } from './ProgressContext';

/**
 * In welchem Verhältnis steht der Besucher zum Angebot?
 *
 * Vorher stand auf jeder Seite derselbe Satz, egal wer ihn las: „Kostenlos
 * testen" auch für jemanden mit gekauftem Leistungskurs, Preise auch für
 * jemanden, der beide Kurse hat. Diese vier Fälle decken ab, was die Texte
 * unterscheiden müssen.
 */
export type Kundenstand = 'gast' | 'ohneKurs' | 'einKurs' | 'alleKurse';

export function useKundenstand(): {
  stand: Kundenstand;
  angemeldet: boolean;
  owned: boolean;
  ownedLk: boolean;
} {
  const { user } = useAuth();
  const { owned, ownedLk } = useProgress();

  const stand: Kundenstand = !user
    ? 'gast'
    : owned && ownedLk
      ? 'alleKurse'
      : owned || ownedLk
        ? 'einKurs'
        : 'ohneKurs';

  return { stand, angemeldet: Boolean(user), owned, ownedLk };
}
