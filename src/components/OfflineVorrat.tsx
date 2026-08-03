'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { useContentLaden } from '@/lib/ContentContext';
import type { ContentLevel, ContentTopic } from '@/lib/contentIndex';

const THEMEN: ContentTopic[] = ['analysis', 'linalg', 'stochastik'];

/**
 * Legt alle zugänglichen Kursinhalte im Hintergrund aufs Gerät.
 *
 * Vorher landete dort nur, was man ohnehin geöffnet hatte — Offline-Lernen war
 * damit Zufall: Wer im Zug eine Aufgabe aufschlagen wollte, die er vorher nie
 * angesehen hatte, stand vor einer Fehlermeldung. Es gab zwar „Für offline
 * speichern" je Thema, aber daran muss man denken, und woran man denken muss,
 * das passiert nicht.
 *
 * Dass das ungefragt läuft, ist vertretbar: Der Text aller sechs
 * Thema/Stufe-Kombinationen liegt im Bereich weniger hundert Kilobyte — das ist
 * weniger als ein einziges Foto. Die Erklärvideos sind ein anderer Fall (rund
 * 11 MB) und bleiben deshalb ein bewusster Knopf unter „Konto".
 *
 * Nur was zum Zugang gehört: Analysis-Grundkurs ist die kostenlose Probe, alles
 * Weitere hängt am Kauf. Ein Abruf ohne Zugang bekäme ohnehin eine Absage.
 */
export default function OfflineVorrat() {
  const { user } = useAuth();
  const { ready, owned, ownedLk } = useProgress();
  const laden = useContentLaden();
  // Einmal je Konto und Sitzung. `request` selbst ist schon gegen doppelte
  // Anfragen abgesichert, aber es soll auch nicht bei jedem Rendern erneut
  // angestoßen werden.
  const erledigt = useRef<string | null>(null);

  useEffect(() => {
    if (!user || !ready) return;
    if (erledigt.current === user.id) return;
    // Ohne Netz gibt es nichts zu holen; beim nächsten Start mit Netz wieder.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    erledigt.current = user.id;

    const paare: [ContentTopic, ContentLevel][] = [];
    if (owned) THEMEN.forEach(thema => paare.push([thema, 'gk']));
    else paare.push(['analysis', 'gk']);
    if (ownedLk) THEMEN.forEach(thema => paare.push([thema, 'lk']));

    // Nacheinander, mit Luft dazwischen: Das läuft im Hintergrund und darf dem
    // Thema, das gerade jemand liest, nicht die Leitung wegnehmen.
    let abgebrochen = false;
    (async () => {
      for (const [thema, stufe] of paare) {
        if (abgebrochen) return;
        laden(thema, stufe);
        await new Promise(weiter => setTimeout(weiter, 400));
      }
    })();
    return () => { abgebrochen = true; };
  }, [user, ready, owned, ownedLk, laden]);

  return null;
}
