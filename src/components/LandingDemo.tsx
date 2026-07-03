'use client';
import { useState } from 'react';
import { ANALYSIS_TASKS } from '@/lib/analysisTasks';
import { SCENES, Scene } from '@/lib/scenes';
import SceneModal from './SceneModal';
import styles from './LandingDemo.module.css';

// Interaktive Produkt-Demo auf der Landingpage.
// Nutzt eine ECHTE Gratis-Aufgabe (Analysis) und den ECHTEN Video-Player.
// KI-Antworten sind hier vorbereitete Beispiele und klar als solche markiert –
// nichts wird vorgetäuscht.

interface Props {
  onRegister: () => void;
}

const TASK = ANALYSIS_TASKS[0];
const DEMO_SCENE = SCENES['v1'];

// Vorbereitete Beispiel-Fragen samt Antworten (klar als Beispiel gekennzeichnet).
const KI_EXAMPLES = [
  {
    q: 'Warum brauche ich die zweite Ableitung?',
    a: 'Die erste Ableitung liefert dir nur die Kandidaten, also Stellen mit Steigung null. Ob dort wirklich ein Hoch- oder Tiefpunkt liegt, verrät die Krümmung: f″(2) = 18 ist positiv, der Graph macht eine Linkskurve, also liegt bei x = 2 ein Tiefpunkt.',
  },
  {
    q: 'Woher kommt (x − 2)(x + 1)?',
    a: 'Du suchst zwei Zahlen, deren Produkt −2 und deren Summe −1 ergibt. Das sind −2 und +1. Damit zerfällt x² − x − 2 in (x − 2)(x + 1), und die Nullstellen 2 und −1 kannst du direkt ablesen.',
  },
];

type Panel = 'none' | 'ki' | 'save' | 'tutor';

export default function LandingDemo({ onRegister }: Props) {
  const [showSolution, setShowSolution] = useState(false);
  const [panel, setPanel] = useState<Panel>('none');
  const [kiIndex, setKiIndex] = useState<number | null>(null);
  const [video, setVideo] = useState<Scene | null>(null);

  const togglePanel = (p: Panel) => setPanel(prev => (prev === p ? 'none' : p));

  return (
    <div className={styles.demo}>
      <div className={styles.head}>
        <span className={styles.badge}>Beispielaufgabe</span>
        <span className={styles.headSub}>Analysis · {TASK.tag}</span>
        <span className={styles.live}>
          <span className={styles.pulse} />
          Zum Ausprobieren
        </span>
      </div>

      <div className={styles.taskBox}>
        <p className={styles.taskText}>{TASK.q}</p>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.mini} ${showSolution ? styles.miniOn : ''}`}
          onClick={() => setShowSolution(s => !s)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points={showSolution ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
          </svg>
          {showSolution ? 'Lösung verbergen' : 'Lösung zeigen'}
        </button>
        {DEMO_SCENE && (
          <button className={styles.mini} onClick={() => setVideo(DEMO_SCENE)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
            Video ansehen
          </button>
        )}
        <button
          className={`${styles.mini} ${panel === 'ki' ? styles.miniOn : ''}`}
          onClick={() => togglePanel('ki')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
            <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
          </svg>
          KI fragen
        </button>
        <button
          className={`${styles.mini} ${panel === 'save' ? styles.miniOn : ''}`}
          onClick={() => togglePanel('save')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Speichern
        </button>
        <button
          className={`${styles.mini} ${panel === 'tutor' ? styles.miniOn : ''}`}
          onClick={() => togglePanel('tutor')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.4" />
            <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
          </svg>
          Tutor
        </button>
      </div>

      {showSolution && (
        <div className={styles.solution}>
          <div className={styles.solTitle}>Schritt-für-Schritt-Lösung</div>
          <div className={styles.solScroll}>
            {TASK.steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div>
                  <div className={styles.stepLabel}>{step.label}</div>
                  <div className={styles.stepMath}>{step.math}</div>
                </div>
              </div>
            ))}
            <div className={styles.result}>{TASK.result}</div>
          </div>
          <div className={styles.note}>
            Analysis ist mit allen Aufgaben gratis. Alle drei Prüfungsgebiete mit über
            130 Aufgaben gibt es im Vollzugang. <a href="#preise">Preise ansehen</a>
          </div>
        </div>
      )}

      {panel === 'ki' && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Frag die KI zu dieser Aufgabe</div>
          <div className={styles.chips}>
            {KI_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                className={`${styles.chip} ${kiIndex === i ? styles.chipOn : ''}`}
                onClick={() => setKiIndex(i)}
              >
                {ex.q}
              </button>
            ))}
          </div>
          {kiIndex !== null && (
            <div className={styles.chat}>
              <div className={styles.userBubble}>{KI_EXAMPLES[kiIndex].q}</div>
              <div className={styles.aiBubble}>
                <span className={styles.exampleTag}>Beispiel-Antwort</span>
                {KI_EXAMPLES[kiIndex].a}
              </div>
            </div>
          )}
          <div className={styles.note}>
            Mit einem kostenlosen Konto stellst du der KI eigene Fragen, 30 pro Tag inklusive.{' '}
            <button className={styles.noteBtn} onClick={onRegister}>Kostenlos registrieren</button>
          </div>
        </div>
      )}

      {panel === 'save' && (
        <div className={styles.panel}>
          <div className={styles.note}>
            Mit einem kostenlosen Konto speicherst du Aufgaben und deinen Fortschritt,
            damit du später genau dort weitermachst.{' '}
            <button className={styles.noteBtn} onClick={onRegister}>Kostenlos registrieren</button>
          </div>
        </div>
      )}

      {panel === 'tutor' && (
        <div className={styles.panel}>
          <div className={styles.note}>
            Persönliche Tutoren sind bald verfügbar. Bis dahin beantwortet dir die KI
            jede Frage sofort.
          </div>
        </div>
      )}

      <SceneModal scene={video} onClose={() => setVideo(null)} />
    </div>
  );
}
