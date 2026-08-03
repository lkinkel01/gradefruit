'use client';

import { TOPICS, type NavigateTo, type View } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import { GrapefruitProgress } from './Logo';
import { ArrowRightIcon, LockIcon } from './UiIcons';
import styles from './ThemenView.module.css';

/**
 * Themenübersicht als eigener Menüpunkt.
 *
 * In der App gehören die Inhalte in die untere Leiste — genau wie Instagram
 * seine Bereiche dort hat. Vorher waren die drei Prüfungsgebiete nur über das
 * Dashboard erreichbar, also einen Umweg entfernt.
 */
export default function ThemenView({
  owned,
  ownedLk,
  onNavigate,
}: {
  owned: boolean;
  ownedLk: boolean;
  onNavigate: NavigateTo;
}) {
  const { topicDone, topicTotal } = useProgress();
  const hatZugang = owned || ownedLk;

  return (
    <div className={styles.seite}>
      <ul className={styles.liste}>
        {TOPICS.map(topic => {
          const gesamt = topicTotal(topic.id) || 1;
          const fertig = topicDone(topic.id);
          const gesperrt = topic.id !== 'analysis' && !hatZugang;

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
                {gesperrt
                  ? <span className={styles.schloss} aria-label="Nicht in deinem Zugang"><LockIcon size={15} /></span>
                  : <ArrowRightIcon size={17} />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
