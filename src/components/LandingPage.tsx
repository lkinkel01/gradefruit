'use client';
import styles from './LandingPage.module.css';
import LandingDemo from './LandingDemo';

interface Props {
  isAuthed: boolean;
  owned: boolean;
  ownedLk: boolean;
  dark: boolean;
  onToggleDark: () => void;
  onEnter: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onOpenCheckout: (course: 'gk' | 'lk') => void;
  onSignOut: () => void;
}

// Gradefruit-Logo: Grapefruit im Querschnitt. Ein Segment ist herausgezogen,
// wie ein Stück aus einem Tortendiagramm – Frucht und Mathematik in einem
// Zeichen. Als flaches SVG scharf in jeder Größe, funktioniert auf hellem und
// dunklem Grund und taugt auch als App-Icon.
const Logo = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <defs>
      <linearGradient id="gfLogoG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FF8A73" />
        <stop offset="1" stopColor="#E2382C" />
      </linearGradient>
    </defs>
    {/* Frucht */}
    <circle cx="24" cy="24" r="21" fill="url(#gfLogoG)" />
    {/* Fünf Segmente */}
    {[0, 60, 120, 180, 240].map(a => (
      <path
        key={a}
        d="M24 24 L18.55 9.8 A15.2 15.2 0 0 1 29.45 9.8 Z"
        fill="#fff"
        opacity="0.94"
        transform={`rotate(${a} 24 24)`}
      />
    ))}
    {/* Das herausgezogene Segment: das Stück, das du dir holst */}
    <path
      d="M24 24 L18.55 9.8 A15.2 15.2 0 0 1 29.45 9.8 Z"
      fill="#fff"
      transform="translate(-3 -1.8) rotate(300 24 24)"
    />
    {/* Blatt */}
    <path
      d="M30.8 5.9 C31.5 2.5 34.6 0.3 38 0.9 C37.6 4.4 35 7 31.6 7 C31.1 7 30.9 6.6 30.8 5.9 Z"
      fill="#22B368"
    />
  </svg>
);

const PlanFeat = ({ text }: { text: string }) => (
  <div className={styles.planFeat}>
    <svg className={styles.featCk} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {text}
  </div>
);

const USPS = [
  'Über 130 Aufgaben im Stil des Hessen-Abis',
  'Jede Lösung Schritt für Schritt erklärt',
  'Kurze Erklärvideos',
  'KI beantwortet deine Fragen',
  'Grundkurs und Leistungskurs',
];

export default function LandingPage({ isAuthed, owned, ownedLk, dark, onToggleDark, onEnter, onLogin, onRegister, onOpenCheckout, onSignOut }: Props) {
  return (
    <div className={styles.lpage}>
      <div className={styles.bgGlow} aria-hidden="true" />

      {/* Nav */}
      <nav className={styles.lnav}>
        <div className={styles.brand}>
          <Logo />
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
              <button className="btn primary" onClick={onRegister}>Registrieren</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>Mathe-Abi Hessen 2027 · Grundkurs und Leistungskurs</div>
          <h1>
            Dein ganzes Mathe-Abi.<br />
            <span className={styles.grad}>An einem Ort.</span>
          </h1>
          <p>
            Schluss mit zehn offenen Tabs und ewig langen Videos. Du übst mit Aufgaben
            im Stil der hessischen Prüfung, siehst in jeder Lösung jeden einzelnen
            Schritt und fragst die KI, sobald du irgendwo hängst.
          </p>
          <div className={styles.cta}>
            {isAuthed ? (
              <button className="btn primary" onClick={onEnter}>Weiter lernen</button>
            ) : (
              <button className="btn primary" onClick={onEnter}>Kostenlos ausprobieren</button>
            )}
            <a className="btn light" href="#preise">Preise ansehen</a>
          </div>
          <p className={styles.microline}>
            {isAuthed
              ? 'Schön, dass du wieder da bist. Mach genau da weiter, wo du aufgehört hast.'
              : 'Analysis ist gratis. Kein Account und keine Zahlungsdaten nötig.'}
          </p>
        </div>

        <div className={styles.heroVisual}>
          <LandingDemo onRegister={onRegister} />
        </div>
      </section>

      {/* USP-Leiste */}
      <div className={styles.usps}>
        {USPS.map(t => (
          <span key={t} className={styles.usp}>
            <svg className={styles.uspCk} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {t}
          </span>
        ))}
        <span className={styles.usp}>
          <svg className={styles.uspSoon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
          </svg>
          Persönlicher Tutor bald verfügbar
        </span>
      </div>

      {/* Subject overview */}
      <section className={styles.lsec}>
        <div className={styles.lh}>Was dich im Abi erwartet</div>
        <p className={styles.secIntro}>
          Drei Prüfungsgebiete, aufgebaut nach dem hessischen Lehrplan.
        </p>
        <div className={styles.subjectGrid}>
          {[
            {
              label: 'Analysis',
              color: '#F0524A',
              topics: ['Differenzial- & Integralrechnung', 'Kurvendiskussion', 'Exponentialfunktionen', 'Optimierungsaufgaben'],
            },
            {
              label: 'Lineare Algebra & Geometrie',
              color: '#6C63FF',
              topics: ['Vektoren & Geraden', 'Ebenengleichungen', 'Lineare Gleichungssysteme', 'Abstands- & Schnittberechnungen'],
            },
            {
              label: 'Stochastik',
              color: '#17B26A',
              topics: ['Wahrscheinlichkeitsrechnung', 'Binomialverteilung', 'Erwartungswert & Varianz', 'Konfidenzintervalle & Hypothesentests'],
            },
          ].map(s => (
            <div key={s.label} className={styles.subjectCard}>
              <div className={styles.scAccent} style={{ background: s.color }} />
              <div className={styles.scBody}>
                <h3 className={styles.scName}>{s.label}</h3>
                <ul className={styles.scTopics}>
                  {s.topics.map(t => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.lsec} id="preise">
        <div className={styles.lh}>Preise</div>
        <p className={styles.secIntro}>
          Wähle deinen Kurs. Beides gibt es als Einmalzahlung oder als Monatsabo,
          jederzeit kündbar. Analysis testest du vorher gratis.
        </p>
        <div className={styles.plans}>
          <div className={styles.plan}>
            <div className={styles.planAccent} style={{ background: '#F0524A' }} />
            <h3>Grundkurs</h3>
            <div className={styles.price}>79 €</div>
            <div className={styles.per}>einmalig, Zugang bis zur Prüfung</div>
            <div className={styles.altPrice}>oder 14,90 € pro Monat, monatlich kündbar</div>
            <div className={styles.planFeats}>
              <PlanFeat text="Alle Grundkurs-Themen und Aufgaben" />
              <PlanFeat text="Schritt-für-Schritt-Lösungen zu jeder Aufgabe" />
              <PlanFeat text="Erklärvideos zu zentralen Themen" />
              <PlanFeat text="KI-Hilfe inklusive" />
            </div>
            {owned ? (
              <button className="btn light" style={{ marginTop: 'auto' }} disabled>Dein Zugang ist aktiv</button>
            ) : (
              <button className="btn primary" style={{ marginTop: 'auto' }} onClick={() => onOpenCheckout('gk')}>
                Grundkurs freischalten
              </button>
            )}
          </div>
          <div className={styles.plan}>
            <div className={styles.planAccent} style={{ background: '#6C63FF' }} />
            <h3>Leistungskurs</h3>
            <div className={styles.price}>99 €</div>
            <div className={styles.per}>einmalig, Zugang bis zur Prüfung</div>
            <div className={styles.altPrice}>oder 17,90 € pro Monat, monatlich kündbar</div>
            <div className={styles.planFeats}>
              <PlanFeat text="Alle Leistungskurs-Themen und Aufgaben" />
              <PlanFeat text="Schritt-für-Schritt-Lösungen zu jeder Aufgabe" />
              <PlanFeat text="Erklärvideos zu zentralen Themen" />
              <PlanFeat text="KI-Hilfe inklusive" />
            </div>
            {ownedLk ? (
              <button className="btn light" style={{ marginTop: 'auto' }} disabled>Dein Zugang ist aktiv</button>
            ) : (
              <button className="btn primary" style={{ marginTop: 'auto' }} onClick={() => onOpenCheckout('lk')}>
                Leistungskurs freischalten
              </button>
            )}
          </div>
        </div>
        <p className={styles.planNote}>
          Sichere Bezahlung über Stripe. Die Wahl zwischen Einmalzahlung und Abo triffst
          du im nächsten Schritt.
        </p>
      </section>

      {/* Closing CTA */}
      <div className={styles.closing}>
        <h2>Bereit für dein Mathe-Abi?</h2>
        <p>Starte kostenlos mit Analysis. Den Vollzugang holst du dir, wenn du so weit bist.</p>
        <div className={styles.cta} style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={onEnter}>
            {isAuthed ? 'Weiter lernen' : 'Kostenlos starten'}
          </button>
          <a className="btn light" href="#preise">Preise ansehen</a>
        </div>
        <p className={styles.microline}>Einmalzahlung oder Monatsabo · sichere Bezahlung über Stripe</p>
      </div>

      <footer className={styles.foot}>
        <div className={styles.footbrand}>
          <Logo size={22} />
          Gradefruit
        </div>
        <div className={styles.foottrust}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Sichere Zahlung über Stripe · SSL-verschlüsselt
        </div>
        <div className={styles.footlinks}>
          <a href="/impressum">Impressum</a>
          <a href="/datenschutz">Datenschutz</a>
        </div>
        <div className={styles.footcopy}>© 2026 Gradefruit · Mathe-Abi Hessen 2027</div>
      </footer>
    </div>
  );
}
