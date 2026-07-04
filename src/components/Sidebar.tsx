'use client';
import { useRouter } from 'next/navigation';
import { View, TOPICS } from '@/lib/types';
import { useProgress } from '@/lib/ProgressContext';
import styles from './Sidebar.module.css';

interface Props {
  view: View;
  owned: boolean;
  ownedLk: boolean;
  onNavigate: (v: View) => void;
  onOpenCheckout: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard', label: 'Übersicht',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
  },
  {
    id: 'videos', label: 'Erklärvideos',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
  },
  {
    id: 'saved', label: 'Gespeichert',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
  },
  {
    id: 'tutors', label: '1:1 Nachhilfe',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" /></svg>
  },
];

export default function Sidebar({ view, owned, ownedLk, onNavigate, onOpenCheckout }: Props) {
  const router = useRouter();
  const { totalDone, totalLessons, topicDone, topicTotal } = useProgress();
  const pct = totalLessons > 0 ? Math.round((totalDone / totalLessons) * 100) : 0;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand} onClick={() => onNavigate('landing')}>
        <span className={styles.dot} />
        Gradefruit
      </div>

      <div className={styles.course}>
        <div className={styles.courseTitle}>Mathe-Abi Hessen 2027</div>
        <div className={styles.courseSub}>Grundkurs · {totalDone}/{totalLessons} Aufgaben</div>
        <div className={styles.prog}>
          <div className={styles.bar}><i style={{ width: `${pct}%` }} /></div>
          <div className={styles.progLbl}>{pct}% abgeschlossen</div>
        </div>
      </div>

      <div className={styles.navsec}>Themen</div>
      <nav className={styles.snav}>
        {TOPICS.map(t => (
          <button
            key={t.id}
            className={view === t.id ? styles.on : ''}
            onClick={() => onNavigate(t.id)}
          >
            <span className={styles.cdot} style={{ background: t.color }} />
            <span className={styles.ti}>{t.label}</span>
            {topicTotal(t.id) > 0 && topicDone(t.id) === topicTotal(t.id)
              ? <span className={styles.stDone}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></span>
              : t.id !== 'analysis' && !owned && !ownedLk && <span className={styles.stLock}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></span>
            }
          </button>
        ))}
      </nav>

      <div className={styles.navsec} style={{ marginTop: 20 }}>Navigation</div>
      <nav className={styles.snav}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} className={view === item.id ? styles.on : ''} onClick={() => onNavigate(item.id)}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.ti}>{item.label}</span>
          </button>
        ))}
        {/* Lernfeed – eigener Swipe-Feed unter der Route /feed (Client-Navigation). */}
        <button onClick={() => router.push('/feed')}>
          <span className={styles.icon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="3" /><polygon points="10 8.5 15 12 10 15.5" fill="currentColor" stroke="none" /></svg>
          </span>
          <span className={styles.ti}>Lernfeed</span>
        </button>
      </nav>

      <div style={{ flex: 1 }} />

      {(owned || ownedLk) ? (
        <div className={styles.ownedTag}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          Vollzugang aktiv
        </div>
      ) : (
        <div className={styles.unlockCard}>
          <p>Schalte alle Aufgaben, Videos und Tutor-Buchungen frei.</p>
          <button className="btn primary btn sm" style={{ width: '100%', fontSize: 13 }} onClick={onOpenCheckout}>
            Vollzugang — 79 €
          </button>
        </div>
      )}
    </aside>
  );
}
