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
                <span className={styles.text}>
                  <span className={styles.name}>{topic.label}</span>
                  <span className={styles.meta}>
                    {fertig} von {gesamt} verstanden
                  </span>
                </span>
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
