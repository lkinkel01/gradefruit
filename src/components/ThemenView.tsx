'use client';

import { TOPICS, type NavigateTo, type View } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import { GrapefruitProgress } from './Logo';
import { ArrowRightIcon } from './UiIcons';
import styles from './ThemenView.module.css';

/**
 * Themenübersicht als eigener Menüpunkt.
 *
 * In der App gehören die Inhalte in die untere Leiste — genau wie Instagram
 * seine Bereiche dort hat. Vorher waren die drei Prüfungsgebiete nur über das
 * Dashboard erreichbar, also einen Umweg entfernt.
 */
/* `owned` und `ownedLk` sind entfallen: Sie dienten nur dazu, Themen mit
   einem Schloss zu versehen. Das Schloss ist weg, also auch die Angaben. */
export default function ThemenView({
  level,
  onNavigate,
}: {
  /** Kursstufe — sonst zählt der Nenner die Aufgaben der anderen Stufe mit. */
  level: 'gk' | 'lk';
  onNavigate: NavigateTo;
}) {
  const { topicDone, topicTotal } = useProgress();

  return (
    <div className={styles.seite}>
      {/* Überschrift und eine Zeile Einordnung. Vorher begann die Seite ohne
          Kopf direkt mit der ersten Zeile, die damit an der Kante der
          Brotkrumenleiste klebte und wie ein abgeschnittener Ausschnitt
          wirkte statt wie eine eigene Seite. */}
      <div className={styles.kopf}>
        <h1 className={styles.titel}>Themen</h1>
        <p className={styles.unter}>Die drei Gebiete deiner Prüfung.</p>
      </div>
      <ul className={styles.liste}>
        {TOPICS.map(topic => {
          const gesamt = topicTotal(topic.id, level) || 1;
          const fertig = topicDone(topic.id, level);

          return (
            <li key={topic.id}>
              <button
                type="button"
                className={styles.zeile}
                onClick={() => onNavigate(topic.id as View, { tab: 'uebersicht' })}
              >
                <GrapefruitProgress pct={(fertig / gesamt) * 100} size={30} />
                {/* Nur der Name. Wie weit man ist, steht in der Übersicht —
                    zweimal dieselbe Zahl an zwei Orten heißt nur, dass eine von
                    beiden irgendwann nicht mehr stimmt. Hier geht es ums
                    Hineingehen, nicht ums Nachrechnen. */}
                <span className={styles.name}>{topic.label}</span>
                {/* Kein Schloss: In jedes Thema führt ein kostenloser Anfang,
                    also stimmt „gesperrt" nicht mehr. */}
                <ArrowRightIcon size={17} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
