'use client';
import styles from './TutorsView.module.css';
import { TutorIcon } from './UiIcons';
import { useImAppRahmen } from '@/lib/nativeApp';

// 1:1-Nachhilfe ist in Vorbereitung. Diese Seite sagt das ehrlich, statt
// erfundene Tutor-Profile oder simulierte Buchungen zu zeigen.
export default function TutorsView() {
  // In der App steht der Titel schon in der Kopfzeile — er darf nicht doppelt
  // dastehen.
  const imApp = useImAppRahmen();
  return (
    <div className={styles.page}>
      {!imApp && <h1 className={styles.ph1}>1:1 Nachhilfe</h1>}

      <div className={`${styles.soonCard} ${imApp ? styles.ohneTitel : ''}`}>
        <div className={styles.soonBadge}>
          <TutorIcon size={22} />
        </div>
        <div className={styles.soonTitle}>Bald verfügbar</div>
        <p className={styles.soonText}>
          Hier kannst du künftig Einzelstunden buchen: gezielt zu deinen Lücken,
          passend zum hessischen Abitur, direkt aus deinem Kurs heraus.
        </p>
        <p className={styles.soonHint}>
          Bis dahin bekommst du sofort Hilfe: Der Gradefruit-Coach beantwortet dir
          in jeder Aufgabe jede Frage, Schritt für Schritt.
        </p>
      </div>
    </div>
  );
}
