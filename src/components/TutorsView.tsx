'use client';
import styles from './TutorsView.module.css';

// 1:1-Nachhilfe ist in Vorbereitung. Diese Seite sagt das ehrlich, statt
// erfundene Tutor-Profile oder simulierte Buchungen zu zeigen.
export default function TutorsView() {
  return (
    <div className={styles.page}>
      <h1 className={styles.ph1}>1:1 Nachhilfe</h1>
      <p className={styles.pblurb}>
        Persönliche Einzelstunden mit geprüften Tutor:innen sind in Vorbereitung.
      </p>

      <div className={styles.soonCard}>
        <div className={styles.soonBadge}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.4" />
            <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
          </svg>
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
