'use client';
import { useState } from 'react';
import { ANALYSIS_TASKS } from '@/lib/analysisTasks';
import { ANALYSIS_LK_TASKS } from '@/lib/analysisLkTasks';
import { SCENES, Scene } from '@/lib/scenes';
import SceneModal from './SceneModal';
import styles from './LandingDemo.module.css';

// Interaktive Produkt-Demo auf der Landingpage: eine Mini-Version der Plattform.
// Nutzt ECHTE Gratis-Aufgaben (Analysis, GK und LK) und den ECHTEN Video-Player.
// KI-Antworten sind vorbereitete Beispiele und klar als solche markiert –
// nichts wird vorgetäuscht.

interface Props {
  onRegister: () => void;
}

interface KiExample {
  q: string;
  a: string;
}

// Pro Kursstufe: echte Aufgabe + dazu passende Beispiel-Fragen an die KI.
const LEVELS = {
  gk: {
    label: 'Grundkurs',
    task: ANALYSIS_TASKS[0],
    ki: [
      {
        q: 'Warum brauche ich die zweite Ableitung?',
        a: 'Die erste Ableitung liefert dir nur die Kandidaten, also Stellen mit Steigung null. Ob dort wirklich ein Hoch- oder Tiefpunkt liegt, verrät die Krümmung: f″(2) = 18 ist positiv, der Graph macht eine Linkskurve, also liegt bei x = 2 ein Tiefpunkt.',
      },
      {
        q: 'Woher kommt (x − 2)(x + 1)?',
        a: 'Du suchst zwei Zahlen, deren Produkt −2 und deren Summe −1 ergibt. Das sind −2 und +1. Damit zerfällt x² − x − 2 in (x − 2)(x + 1), und die Nullstellen 2 und −1 kannst du direkt ablesen.',
      },
    ] as KiExample[],
  },
  lk: {
    label: 'Leistungskurs',
    task: ANALYSIS_LK_TASKS[0],
    ki: [
      {
        q: 'Warum brauche ich hier die Produktregel?',
        a: 'Weil f aus zwei Faktoren besteht, die beide von x abhängen: x² und e^x. Solche Produkte darfst du nicht Faktor für Faktor ableiten, sonst fehlt ein Summand. Die Produktregel verbindet beides: u′v + uv′.',
      },
      {
        q: 'Warum darf ich e^x ausklammern?',
        a: 'Beide Summanden enthalten den Faktor e^x. Klammerst du ihn aus, bleibt e^x · (x² + 2x). Das ist dieselbe Funktion, nur kompakter, und Nullstellen der Ableitung erkennst du sofort.',
      },
    ] as KiExample[],
  },
} as const;

type Level = keyof typeof LEVELS;
type View = 'task' | 'solution' | 'ki' | 'save' | 'tutor';

const DEMO_SCENE = SCENES['v1'];

export default function LandingDemo({ onRegister }: Props) {
  const [level, setLevel] = useState<Level>('gk');
  const [view, setView] = useState<View>('task');
  const [kiIndex, setKiIndex] = useState<number | null>(null);
  const [video, setVideo] = useState<Scene | null>(null);

  const current = LEVELS[level];
  const task = current.task;

  // Wie in der echten App: eine Sache im Fokus. Ein zweiter Tap schließt wieder.
  const toggleView = (v: View) => setView(prev => (prev === v ? 'task' : v));

  const switchLevel = (l: Level) => {
    if (l === level) return;
    setLevel(l);
    setView('task');
    setKiIndex(null);
  };

  return (
    <div className={styles.demo}>
      <div className={styles.head}>
        <span className={styles.live}>Interaktive Vorschau</span>
        <span className={styles.headSub}>Analysis · gratis</span>
      </div>

      <div className={styles.levelRow} role="tablist" aria-label="Kursniveau wählen">
        {(Object.keys(LEVELS) as Level[]).map(l => (
          <button
            key={l}
            role="tab"
            aria-selected={level === l}
            className={`${styles.levelBtn} ${level === l ? styles.levelOn : ''}`}
            onClick={() => switchLevel(l)}
          >
            {LEVELS[l].label}
          </button>
        ))}
      </div>

      <div className={styles.taskBox} key={`task-${level}`}>
        <div className={styles.taskTag}>{task.tag}</div>
        <p className={styles.taskText}>{task.q}</p>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.mini} ${view === 'solution' ? styles.miniOn : ''}`}
          onClick={() => toggleView('solution')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points={view === 'solution' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
          </svg>
          {view === 'solution' ? 'Lösung verbergen' : 'Lösung zeigen'}
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
          className={`${styles.mini} ${view === 'ki' ? styles.miniOn : ''}`}
          onClick={() => toggleView('ki')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
            <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
          </svg>
          KI fragen
        </button>
        <button
          className={`${styles.mini} ${view === 'save' ? styles.miniOn : ''}`}
          onClick={() => toggleView('save')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Speichern
        </button>
        <button
          className={`${styles.mini} ${view === 'tutor' ? styles.miniOn : ''}`}
          onClick={() => toggleView('tutor')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.4" />
            <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
          </svg>
          Tutor
        </button>
      </div>

      {view === 'solution' && (
        <div className={styles.reveal} key={`sol-${level}`}>
          <div className={styles.solTitle}>Schritt-für-Schritt-Lösung</div>
          <div className={styles.solScroll}>
            {task.steps.map((step, i) => (
              <div key={i} className={styles.step} style={{ animationDelay: `${i * 70}ms` }}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div>
                  <div className={styles.stepLabel}>{step.label}</div>
                  <div className={styles.stepMath}>{step.math}</div>
                </div>
              </div>
            ))}
            <div className={styles.result} style={{ animationDelay: `${task.steps.length * 70}ms` }}>
              {task.result}
            </div>
          </div>
          <div className={styles.note}>
            Analysis ist mit allen Aufgaben gratis. Alle drei Prüfungsgebiete mit über
            130 Aufgaben gibt es im Vollzugang. <a href="#preise">Preise ansehen</a>
          </div>
        </div>
      )}

      {view === 'ki' && (
        <div className={styles.reveal} key={`ki-${level}`}>
          <div className={styles.panelTitle}>Frag die KI zu dieser Aufgabe</div>
          <div className={styles.chips}>
            {current.ki.map((ex, i) => (
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
            <div className={styles.chat} key={`chat-${kiIndex}`}>
              <div className={styles.userBubble}>{current.ki[kiIndex].q}</div>
              <div className={styles.aiBubble}>
                <span className={styles.exampleTag}>Beispiel-Antwort</span>
                {current.ki[kiIndex].a}
              </div>
            </div>
          )}
          <div className={styles.note}>
            Mit einem kostenlosen Konto stellst du der KI eigene Fragen, 30 pro Tag inklusive.{' '}
            <button className={styles.noteBtn} onClick={onRegister}>Kostenlos registrieren</button>
          </div>
        </div>
      )}

      {view === 'save' && (
        <div className={styles.reveal}>
          <div className={styles.note}>
            Mit einem kostenlosen Konto speicherst du Aufgaben und deinen Fortschritt,
            damit du später genau dort weitermachst.{' '}
            <button className={styles.noteBtn} onClick={onRegister}>Kostenlos registrieren</button>
          </div>
        </div>
      )}

      {view === 'tutor' && (
        <div className={styles.reveal}>
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
