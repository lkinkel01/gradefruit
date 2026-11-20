import styles from './Gruende.module.css';

/**
 * Vier Gründe nebeneinander, jeder mit Symbol, Überschrift und zwei Zeilen.
 *
 * Das ersetzt keine Hakenliste, sondern ergänzt sie an anderer Stelle: Die
 * Haken neben den Preisen sagen, WAS enthalten ist. Hier steht, WARUM es so
 * gebaut ist. Das ist der Unterschied zwischen einer Packungsbeilage und
 * einem Argument.
 *
 * Die Symbole sind bewusst schlicht und einfarbig. Bunte Symbole in vier
 * verschiedenen Tönen sind das Erkennungszeichen zusammengeklickter
 * Baukastenseiten, und zwei Rottöne sind das Limit der Marke.
 */
const GRUENDE = [
  {
    titel: 'Nur Hessen, nur 2027',
    text: 'Kein Durchschnitt aus sechzehn Lehrplänen. Alles folgt dem hessischen Kerncurriculum.',
    icon: (
      <>
        <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
  },
  {
    titel: 'Im Prüfungsformat',
    text: 'Die Aufgaben sind so gestellt, wie sie in der Abiturprüfung gestellt werden.',
    icon: (
      <>
        <path d="M8 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 13l2 2 4-4" />
      </>
    ),
  },
  {
    titel: 'Lesen oder ansehen',
    text: 'Zu jedem Thema und jedem Lösungsweg gibt es ein Erklärvideo. Du entscheidest.',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M10 9.5l5 2.5-5 2.5z" />
      </>
    ),
  },
  {
    titel: 'Fragen ohne Melden',
    text: 'Der Coach kennt die Stelle, an der du hängst, und wird nie ungeduldig.',
    icon: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L4 21l1.1-3.4A8.4 8.4 0 1 1 21 11.5z" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1v.4" />
        <path d="M12 16.2v.01" />
      </>
    ),
  },
] as const;

export default function Gruende() {
  return (
    <ul className={styles.gruende}>
      {GRUENDE.map(g => (
        <li key={g.titel}>
          <span className={styles.symbol} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {g.icon}
            </svg>
          </span>
          <strong>{g.titel}</strong>
          <span className={styles.text}>{g.text}</span>
        </li>
      ))}
    </ul>
  );
}
