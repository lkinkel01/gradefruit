/**
 * Wann die Lernerinnerung kommt.
 *
 * Der Plan liegt auf dem Gerät. Er kennt sieben Wochentage, für jeden eine
 * eigene Uhrzeit und einen Schalter.
 *
 * Warum nicht einfach eine Uhrzeit für alle: Ein Schultag und ein Samstag sehen
 * nicht gleich aus. Eine Erinnerung um 13:30 trifft unter der Woche die Zeit
 * nach der Schule; am Wochenende ist sie zu spät für den Vormittag und zu früh
 * für den Abend.
 */

export type Wochentag = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sonntag, wie bei Date

export type Tagesplan = { an: boolean; zeit: string };
export type Plan = Record<Wochentag, Tagesplan>;

export const TAG_KURZ: Record<Wochentag, string> = {
  1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 6: 'Sa', 0: 'So',
};

/** Reihenfolge fürs Anzeigen: Montag zuerst, wie im Kalender. */
export const TAGE_REIHE: Wochentag[] = [1, 2, 3, 4, 5, 6, 0];

const PLAN_KEY = 'gf-erinnerung-plan';

/**
 * Der Plan, den jemand bekommt, der nichts einstellt.
 *
 * Unter der Woche 13:30 (nach der Schule), am Wochenende 12:00. Nicht jeden
 * Tag: Fünf Erinnerungen die Woche werden gelesen, sieben werden weggewischt.
 * Ausgelassen wird der Mittwoch und der Sonntag, damit nie mehr als zwei Tage
 * am Stück ohne Anstoß vergehen.
 */
export function standardPlan(): Plan {
  return {
    1: { an: true,  zeit: '13:30' },
    2: { an: true,  zeit: '13:30' },
    3: { an: false, zeit: '13:30' },
    4: { an: true,  zeit: '13:30' },
    5: { an: true,  zeit: '13:30' },
    6: { an: true,  zeit: '12:00' },
    0: { an: false, zeit: '12:00' },
  };
}

/**
 * Näher an der Prüfung wird enger getaktet.
 *
 * Acht Monate vorher ist tägliches Nachfragen Lärm; sechs Wochen vorher ist
 * zweimal die Woche zu wenig. Die Verdichtung passiert nur, solange der Nutzer
 * nichts Eigenes eingestellt hat: Eine selbst gewählte Einstellung darf die App
 * nicht hinter dem Rücken ändern.
 */
export function planFuerPhase(tageBisPruefung: number): Plan {
  const plan = standardPlan();
  // Letzte sechs Wochen: jeden Tag.
  if (tageBisPruefung <= 42) {
    TAGE_REIHE.forEach(tag => { plan[tag].an = true; });
    return plan;
  }
  // Letztes halbes Jahr: auch mittwochs.
  if (tageBisPruefung <= 180) {
    plan[3].an = true;
    return plan;
  }
  return plan;
}

export function planLesen(): { plan: Plan; eigen: boolean } {
  try {
    const roh = localStorage.getItem(PLAN_KEY);
    if (roh) {
      const gelesen = JSON.parse(roh) as Plan;
      // Grob prüfen: Fehlt ein Tag, ist der Eintrag unbrauchbar.
      if (TAGE_REIHE.every(t => gelesen[t] && typeof gelesen[t].zeit === 'string')) {
        return { plan: gelesen, eigen: true };
      }
    }
  } catch { /* Speicher gesperrt oder Unsinn gespeichert */ }
  return { plan: standardPlan(), eigen: false };
}

export function planSchreiben(plan: Plan): void {
  try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch { /* Speicher gesperrt */ }
}

export function planLoeschen(): void {
  try { localStorage.removeItem(PLAN_KEY); } catch { /* Speicher gesperrt */ }
}

/** Kurzfassung für die Konto-Seite: „Mo, Di, Do, Fr um 13:30" o. Ä. */
export function planBeschreiben(plan: Plan): string {
  const aktive = TAGE_REIHE.filter(t => plan[t].an);
  if (aktive.length === 0) return 'Kein Tag ausgewählt';
  if (aktive.length === 7) {
    const zeiten = new Set(aktive.map(t => plan[t].zeit));
    if (zeiten.size === 1) return `Täglich um ${plan[1].zeit}`;
  }
  const zeiten = new Set(aktive.map(t => plan[t].zeit));
  const tage = aktive.map(t => TAG_KURZ[t]).join(', ');
  return zeiten.size === 1 ? `${tage} um ${[...zeiten][0]}` : tage;
}
