'use client';
import styles from './LandingPage.module.css';

interface Props {
  onEnter: () => void;
  onOpenCheckout: () => void;
}

export default function LandingPage({ onEnter, onOpenCheckout }: Props) {
  return (
    <div className={styles.lpage}>
      <nav className={styles.lnav}>
        <div className={styles.brand}>
          <span className={styles.dot} />
          Gradefruit
        </div>
        <div className={styles.lbtns}>
          <button className="btn light" onClick={onEnter}>Anmelden</button>
          <button className="btn primary" onClick={onOpenCheckout}>Vollzugang</button>
        </div>
      </nav>

      <div className={styles.hero}>
        <div className={styles.eyebrow}>Mathe-Abi Hessen 2027 · Grundkurs</div>
        <h1>Besteh dein<br /><span className={styles.grad}>Mathe-Abi.</span></h1>
        <p>Alle Themen, echte Abituraufgaben und Schritt-für-Schritt-Erklärungen — genau auf den hessischen Grundkurs zugeschnitten.</p>
        <div className={styles.cta}>
          <button className="btn primary" onClick={onEnter}>Kostenlos starten</button>
          <button className="btn light" onClick={onOpenCheckout}>Vollzugang 79 €</button>
        </div>
        <p className={styles.microline}>Keine Anmeldung nötig · Sofort loslegen</p>
      </div>

      <div className={styles.topicchips}>
        {[
          { label: 'Analysis', color: '#F0524A' },
          { label: 'Lineare Algebra & Geometrie', color: '#6C63FF' },
          { label: 'Stochastik', color: '#17B26A' },
        ].map(t => (
          <span key={t.label} className={styles.tchip}>
            <span className={styles.cdot} style={{ background: t.color }} />
            {t.label}
          </span>
        ))}
      </div>

      <div className={styles.lsec}>
        <div className={styles.lh}>Was du bekommst</div>
        <div className={styles.incl}>
          {[
            { title: 'Abituraufgaben', desc: 'Echte Aufgaben aus Hessen mit Musterlösungen', color: '#F0524A' },
            { title: 'Erklärvideos', desc: 'Kurze, klare Videos zu jedem Thema', color: '#6C63FF' },
            { title: 'KI-Assistent', desc: 'Jederzeit Fragen stellen und Schritte erklären lassen', color: '#17B26A' },
            { title: '1:1 Nachhilfe', desc: 'Echte Tutor:innen für schwierige Stellen buchen', color: '#F5A623' },
          ].map(item => (
            <div key={item.title} className={styles.irow}>
              <div className={styles.ck} style={{ background: item.color }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <b>{item.title}</b>
                <span>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.lsec}>
        <div className={styles.lh}>Preise</div>
        <div className={styles.plans}>
          <div className={styles.plan}>
            <div className={styles.pt}>Gratis</div>
            <h3>Schnuppern</h3>
            <div className={styles.price}>0 €</div>
            <div className={styles.per}>für immer kostenlos</div>
            <button className="btn light" style={{ marginTop: 'auto' }} onClick={onEnter}>Jetzt starten</button>
          </div>
          <div className={`${styles.plan} ${styles.planHl}`}>
            <div className={styles.pt}>Empfohlen</div>
            <h3>Vollzugang</h3>
            <div className={styles.price}>79 €</div>
            <div className={styles.per}>einmalig · bis zur Prüfung</div>
            <button className="btn primary" style={{ marginTop: 'auto' }} onClick={onOpenCheckout}>Jetzt freischalten</button>
          </div>
        </div>
      </div>
    </div>
  );
}
