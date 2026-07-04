'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { SCENES, Scene } from '@/lib/scenes';
import SceneModal from '@/components/SceneModal';
import styles from './feed.module.css';

// Lernfeed V1 – vertikaler Swipe-Feed der vorhandenen Erklärvideo-Szenen.
// Nur Anzeige + Abspielen im bestehenden Player (SceneModal). Kein Community-Kram.
const FEED_SCENES: Scene[] = Object.values(SCENES);

export default function FeedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [active, setActive] = useState<Scene | null>(null);

  // Lernfeed ist nur für eingeloggte Nutzer. Gäste zur Startseite schicken.
  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className={styles.gate}>{loading ? 'Laden …' : 'Weiterleitung …'}</div>;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <div className={styles.topRow}>
          <button className={styles.back} onClick={() => router.back()} aria-label="Zurück">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div className={styles.intro}>
            <div className={styles.feedTitle}>Lernfeed</div>
            <div className={styles.feedSub}>Lerne in wenigen Minuten mit kurzen Erklärvideos.</div>
          </div>
        </div>
      </div>

      <div className={styles.feed}>
        {FEED_SCENES.map((scene, i) => (
          <section key={scene.id} className={styles.slide}>
            <div
              className={styles.card}
              style={{ background: `linear-gradient(160deg, ${scene.color}, ${scene.color}55)` }}
            >
              <div className={styles.spacer} />
              <span className={styles.badge}>{scene.topic}</span>
              <h2 className={styles.title}>{scene.title}</h2>
              {scene.func && <div className={styles.func}>{scene.func}</div>}
              <button className={styles.play} onClick={() => setActive(scene)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4" /></svg>
                Video abspielen
              </button>
            </div>
            {i === 0 && FEED_SCENES.length > 1 && (
              <div className={styles.hint}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                nach oben wischen
              </div>
            )}
          </section>
        ))}

        {FEED_SCENES.length === 0 && (
          <section className={styles.slide}>
            <div className={styles.card} style={{ background: 'var(--surface-2)' }}>
              <div className={styles.spacer} />
              <h2 className={styles.title} style={{ color: 'var(--ink)' }}>Bald verfügbar</h2>
              <p style={{ color: 'var(--muted)' }}>Die Erklärvideos für den Lernfeed sind in Arbeit.</p>
            </div>
          </section>
        )}
      </div>

      <SceneModal scene={active} onClose={() => setActive(null)} />
    </div>
  );
}
