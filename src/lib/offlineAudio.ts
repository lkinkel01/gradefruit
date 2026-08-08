/**
 * Erklärvideos aufs Gerät legen.
 *
 * Der Ton der Videos sind einzelne mp3-Dateien unter `/audio/`, eine je
 * Abschnitt. Sie landen im Speicher des Service Workers (`gf-audio`, siehe
 * `public/sw.js`) — von dort bedient er sie ohne Netz.
 *
 * Sie kommen automatisch aufs Gerät, sobald die App einmal Netz hat — rund
 * 11 MB. Der Knopf unter „Konto" bleibt für den Fall, dass jemand nicht warten
 * will oder den Platz wieder freigeben möchte.
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

export interface LadeOptionen {
  /** Schon vorhandene Dateien überspringen (für den Lauf im Hintergrund). */
  nurFehlende?: boolean;
  /** Pause zwischen zwei Dateien in Millisekunden. */
  pause?: number;
  signal?: AbortSignal;
}

/**
 * Lädt die Tonspuren. Meldet nach jedem Stück den Stand, damit der Knopf
 * zeigen kann, wie weit es ist.
 *
 * Jede Datei wird frisch geholt (`cache: 'reload'`): Der Speicher überlebt
 * Veröffentlichungen, und ein geänderter Text darf nicht mit altem Ton
 * weiterlaufen. Im Hintergrundlauf (`nurFehlende`) wird das übersprungen, was
 * schon da ist — sonst lüde die App bei jedem Start 11 MB neu.
 *
 * Die Pause zwischen den Dateien ist der Hebel für den Datensparmodus: Dort
 * wird langsamer geladen, nicht weniger. Wer den Ton nicht hat, hat ihn im Zug
 * auch nicht — deshalb kommt er in jedem Fall, nur eben unauffälliger.
 */
export async function tonspurenLaden(
  onFortschritt: (fertig: number, gesamt: number) => void,
  optionen: LadeOptionen = {},
): Promise<{ fertig: number; gesamt: number }> {
  const { nurFehlende = false, pause = 0, signal } = optionen;
  const pfade = alleTonspuren();
  if (typeof caches === 'undefined') return { fertig: 0, gesamt: pfade.length };

  const speicher = await caches.open(SPEICHER);
  let fertig = 0;
  for (const pfad of pfade) {
    if (signal?.aborted) break;
    if (nurFehlende && (await speicher.match(pfad))) {
      fertig++;
      onFortschritt(fertig, pfade.length);
      continue;
    }
    try {
      const antwort = await fetch(pfad, { cache: 'reload', signal });
      if (antwort.ok) {
        await speicher.put(pfad, antwort.clone());
        fertig++;
      }
    } catch {
      /* Eine kaputte Datei soll nicht den ganzen Vorgang abbrechen. */
    }
    onFortschritt(fertig, pfade.length);
    if (pause > 0) await new Promise(weiter => setTimeout(weiter, pause));
  }
  return { fertig, gesamt: pfade.length };
}

/** Gibt den Platz wieder frei. */
export async function tonspurenEntfernen(): Promise<void> {
  if (typeof caches === 'undefined') return;
  try { await caches.delete(SPEICHER); } catch { /* nichts zu löschen */ }
}
