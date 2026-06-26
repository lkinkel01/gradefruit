'use client';
import styles from './VideosView.module.css';

const VIDEOS = [
  { id: 'v1', title: 'Ableitung – Grundregeln', sub: 'Analysis · 8 Min.', color: '#F0524A', badge: 'Analysis' },
  { id: 'v2', title: 'Extrempunkte berechnen', sub: 'Analysis · 11 Min.', color: '#F0524A', badge: 'Analysis' },
  { id: 'v3', title: 'Integralrechnung Einführung', sub: 'Analysis · 14 Min.', color: '#F0524A', badge: 'Analysis' },
  { id: 'v4', title: 'Vektoren & Skalarprodukt', sub: 'Lineare Algebra · 9 Min.', color: '#6C63FF', badge: 'Lin. Algebra' },
  { id: 'v5', title: 'Geradengleichungen', sub: 'Lineare Algebra · 12 Min.', color: '#6C63FF', badge: 'Lin. Algebra' },
  { id: 'v6', title: 'Binomialverteilung', sub: 'Stochastik · 10 Min.', color: '#17B26A', badge: 'Stochastik' },
];

export default function VideosView() {
  return (
    <div className={styles.page}>
      <h1 className={styles.ph1}>Erklärvideos</h1>
      <p className={styles.pblurb}>Kurze, klare Erklärungen zu jedem Abiturthema.</p>
      {VIDEOS.map(v => (
        <button key={v.id} className={styles.vcard}>
          <div className={styles.vthumb} style={{ background: `linear-gradient(135deg, ${v.color}cc, ${v.color}66)` }}>
            <div className={styles.vbadge}>{v.badge}</div>
            <div className={styles.vplay}>
              <span>
                <svg viewBox="0 0 24 24" fill="#15141A"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span>
            </div>
          </div>
          <div className={styles.vinfo}>
            <div className={styles.vt}>{v.title}</div>
            <div className={styles.vd}>{v.sub}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
