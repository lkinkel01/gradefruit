'use client';
import { useState } from 'react';
import { SCENES, Scene } from '@/lib/scenes';
import SceneModal from './SceneModal';
import styles from './VideosView.module.css';
import { useImAppRahmen } from '@/lib/nativeApp';
import type { Stufe } from '@/lib/stufe';

const VIDEOS: Record<Stufe, { id: string; title: string; sub: string; color: string; badge: string }[]> = {
  gk: [
    { id: 'v1', title: 'Ableitung: Grundregeln', sub: 'Grundkurs', color: '#FF7A00', badge: 'Analysis' },
    { id: 'v2', title: 'Extrempunkte berechnen', sub: 'Grundkurs', color: '#FF7A00', badge: 'Analysis' },
    { id: 'v3', title: 'Integralrechnung Einführung', sub: 'Grundkurs', color: '#FF7A00', badge: 'Analysis' },
    { id: 'v4', title: 'Vektoren & Skalarprodukt', sub: 'Grundkurs', color: '#FF7A00', badge: 'Lin. Algebra' },
    { id: 'v5', title: 'Geradengleichungen', sub: 'Grundkurs', color: '#FF7A00', badge: 'Lin. Algebra' },
    { id: 'v6', title: 'Binomialverteilung', sub: 'Grundkurs', color: '#FF7A00', badge: 'Stochastik' },
  ],
  lk: [
    { id: 'lk-a1', title: 'Produktregel mit e-Funktion', sub: 'Leistungskurs', color: '#FF7A00', badge: 'Analysis' },
    { id: 'lk-a2', title: 'Integral einer e-Funktion', sub: 'Leistungskurs', color: '#FF7A00', badge: 'Analysis' },
    { id: 'lk-g1', title: 'Ebene durch drei Punkte', sub: 'Leistungskurs', color: '#FF7A00', badge: 'Lin. Algebra' },
    { id: 'lk-g2', title: 'Abstand Punkt und Gerade', sub: 'Leistungskurs', color: '#FF7A00', badge: 'Lin. Algebra' },
    { id: 'lk-s1', title: 'Zwei-Sigma-Intervall', sub: 'Leistungskurs', color: '#FF7A00', badge: 'Stochastik' },
    { id: 'lk-s2', title: 'Fehler erster Art', sub: 'Leistungskurs', color: '#FF7A00', badge: 'Stochastik' },
  ],
};

export default function VideosView({ level }: { level: Stufe }) {
  // Der Titel steht in der App bereits in der Kopfzeile.
  const imApp = useImAppRahmen();
  const [active, setActive] = useState<Scene | null>(null);
  const [notice, setNotice] = useState('');

  // Fehlt nur die Stimme, ist das Video trotzdem vollständig: Die Schritte
  // laufen, und der Sprechtext steht als Untertitel darunter. Es zu sperren
  // wäre nicht vorsichtig, sondern falsch — und es widerspräche dem
  // Reel-Modus, wo dieselben Videos längst laufen. Gesperrt bleibt nur, was
  // es wirklich noch nicht gibt.
  const openVideo = (id: string) => {
    const scene = SCENES[id];
    if (scene) {
      setActive(scene);
    } else {
      setNotice('Dieses Erklärvideo kommt bald.');
      setTimeout(() => setNotice(''), 2600);
    }
  };

  return (
    <div className={styles.page}>
      {!imApp && <h1 className={styles.ph1}>Erklärvideos</h1>}
      <p className={styles.pblurb}>Ausgewählte Themen kurz und klar erklärt.</p>
      {VIDEOS[level].map(v => {
        const scene = SCENES[v.id];
        // Drei Zustände, drei Aussagen: fertig, ohne Stimme, oder noch gar nicht da.
        const zusatz = !scene ? ' · bald' : scene.hasAudio ? '' : ' · noch ohne Ton';
        return (
          <button key={v.id} className={styles.vcard} onClick={() => openVideo(v.id)}>
            <div className={styles.vthumb} style={{ background: v.color }}>
              <div className={styles.vbadge}>{v.badge}</div>
              <div className={styles.vplay}>
                <span>
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </span>
              </div>
            </div>
            <div className={styles.vinfo}>
              <div className={styles.vt}>{v.title}</div>
              <div className={styles.vd}>{`${v.sub}${zusatz}`}</div>
            </div>
          </button>
        );
      })}

      {notice && <div className={styles.toast}>{notice}</div>}

      <SceneModal scene={active} onClose={() => setActive(null)} />
    </div>
  );
}
