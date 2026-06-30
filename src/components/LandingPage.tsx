'use client';
import styles from './LandingPage.module.css';

interface Props {
  isAuthed: boolean;
  owned: boolean;
  dark: boolean;
  onToggleDark: () => void;
  onEnter: () => void;
  onLogin: () => void;
  onOpenCheckout: () => void;
  onSignOut: () => void;
}

export default function LandingPage({ isAuthed, owned, dark, onToggleDark, onEnter, onLogin, onOpenCheckout, onSignOut }: Props) {
  return (
    <div className={styles.lpage}>
      <nav className={styles.lnav}>
        <div className={styles.brand}>
          <span className={styles.dot} />
          Gradefruit
        </div>
        <div className={styles.lbtns}>
          <button
            className={styles.darkToggle}
            onClick={onToggleDark}
            title={dark ? 'Hellmodus' : 'Dunkelmodus'}
            aria-label={dark ? 'Hellmodus' : 'Dunkelmodus'}
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            )}
          </button>
          {isAuthed ? (
            <>
              <button className="btn light" onClick={onSignOut}>Abmelden</button>
              <button className="btn primary" onClick={onEnter}>Weiter lernen</button>
            </>
          ) : (
            <>
              <button className="btn light" onClick={onLogin}>Anmelden</button>
              <button className="btn primary" onClick={onOpenCheckout}>Vollzugang</button>
            </>
          )}
        </div>
      </nav>

      <div className={styles.hero}>
        <div className={styles.eyebrow}>Mathe-Abi Hessen 2027 · Grundkurs</div>
        <h1>Besteh dein<br /><span className={styles.grad}>Mathe-Abi.</span></h1>
        <p>Alle Themen, echte Abituraufgaben und Schritt-für-Schritt-Erklärungen — genau auf den hessischen Grundkurs zugeschnitten.</p>
        <div className={styles.cta}>
          {isAuthed ? (
            <>
              <button className="btn primary" onClick={onEnter}>Weiter lernen</button>
              {!owned && <button className="btn light" onClick={onOpenCheckout}>Vollzugang 79 €</button>}
            </>
          ) : (
            <>
              <button className="btn primary" onClick={onEnter}>Kostenlos starten</button>
              <button className="btn light" onClick={onOpenCheckout}>Vollzugang 79 €</button>
            </>
          )}
        </div>
        <p className={styles.microline}>
          {isAuthed
            ? 'Schön, dass du wieder da bist — mach da weiter, wo du aufgehört hast.'
            : 'Keine Anmeldung nötig · Sofort loslegen'}
        </p>
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
            <button className="btn light" style={{ marginTop: 'auto' }} onClick={onEnter}>{isAuthed ? 'Weiter lernen' : 'Jetzt starten'}</button>
          </div>
          <div className={`${styles.plan} ${styles.planHl}`}>
            <div className={styles.pt}>Empfohlen</div>
            <h3>Vollzugang</h3>
            <div className={styles.price}>79 €</div>
            <div className={styles.per}>einmalig · bis zur Prüfung</div>
            {owned ? (
              <button className="btn light" style={{ marginTop: 'auto' }} disabled>Dein Zugang ist aktiv ✓</button>
            ) : (
              <button className="btn primary" style={{ marginTop: 'auto' }} onClick={onOpenCheckout}>Jetzt freischalten</button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.closing}>
        <h2>Bereit für dein Mathe-Abi?</h2>
        <p>Starte kostenlos und ohne Anmeldung. Den Vollzugang schaltest du frei, wenn du bereit bist.</p>
        <button className="btn primary" onClick={onEnter}>{isAuthed ? 'Weiter lernen' : 'Kostenlos starten'}</button>
      </div>

      <footer className={styles.foot}>
        <div className={styles.footbrand}>
          <span className={styles.dot} />
          Gradefruit
        </div>
        <div className={styles.foottrust}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Sichere Bezahlung über Stripe · SSL-verschlüsselt
        </div>
        <div className={styles.footcopy}>© 2026 Gradefruit · Mathe-Abi Hessen 2027</div>
      </footer>
    </div>
  );
}
