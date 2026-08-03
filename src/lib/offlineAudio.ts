/**
 * Erklärvideos aufs Gerät legen.
 *
 * Der Ton der Videos sind einzelne mp3-Dateien unter `/audio/`, eine je
 * Abschnitt. Sie landen im Speicher des Service Workers (`gf-audio`, siehe
 * `public/sw.js`) — von dort bedient er sie ohne Netz.
 *
 * Bewusst ein eigener Knopf und nicht wie die Texte automatisch: Es sind rund
 * 11 MB. Das lädt niemand ungefragt über das Mobilfunknetz eines Schülers
 * herunter.
 */

import { SCENES } from './scenes';

const SPEICHER = 'gf-audio';

/** Alle Tonspuren, die es gibt: je Szene mit Ton ein Stück pro Abschnitt. */
export function alleTonspuren(): string[] {
  const pfade: string[] = [];
  Object.values(SCENES).forEach(scene => {
    if (!scene.hasAudio) return;
    // Intro + Schritte + Outro — dieselbe Zählung wie im Player.
    const anzahl = scene.steps.length + 2;
    for (let i = 0; i < anzahl; i++) pfade.push(`/audio/${scene.id}-${i}.mp3`);
  });
  return pfade;
}

/** Wie viele davon liegen schon auf dem Gerät? */
export async function tonspurenVorhanden(): Promise<number> {
  if (typeof caches === 'undefined') return 0;
  try {
    const speicher = await caches.open(SPEICHER);
    const treffer = await Promise.all(
      alleTonspuren().map(pfad => speicher.match(pfad).then(Boolean)),
    );
    return treffer.filter(Boolean).length;
  } catch {
    return 0;
  }
}

/**
 * Lädt alle Tonspuren. Meldet nach jedem Stück den Stand, damit der Knopf
 * zeigen kann, wie weit es ist.
 *
 * Jede Datei wird frisch geholt (`cache: 'reload'`): Der Speicher überlebt
 * Veröffentlichungen, und ein geänderter Text darf nicht mit altem Ton
 * weiterlaufen.
 */
export async function tonspurenLaden(
  onFortschritt: (fertig: number, gesamt: number) => void,
): Promise<{ fertig: number; gesamt: number }> {
  const pfade = alleTonspuren();
  if (typeof caches === 'undefined') return { fertig: 0, gesamt: pfade.length };

  const speicher = await caches.open(SPEICHER);
  let fertig = 0;
  for (const pfad of pfade) {
    try {
      const antwort = await fetch(pfad, { cache: 'reload' });
      if (antwort.ok) {
        await speicher.put(pfad, antwort.clone());
        fertig++;
      }
    } catch {
      /* Eine kaputte Datei soll nicht den ganzen Vorgang abbrechen. */
    }
    onFortschritt(fertig, pfade.length);
  }
  return { fertig, gesamt: pfade.length };
}

/** Gibt den Platz wieder frei. */
export async function tonspurenEntfernen(): Promise<void> {
  if (typeof caches === 'undefined') return;
  try { await caches.delete(SPEICHER); } catch { /* nichts zu löschen */ }
}
