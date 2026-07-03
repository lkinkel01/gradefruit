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

// Gradefruit-Logo: Frucht mit Blatt und Haken. Als SVG gestochen scharf
// in jeder Größe und automatisch passend zu Hell- und Dunkelmodus.
const Logo = ({ size = 30 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <defs>
      <linearGradient id="gfLogoGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FF8A7A" />
        <stop offset="1" stopColor="#D93A30" />
      </linearGradient>
    </defs>
    <circle cx="15.4" cy="18" r="12.6" fill="url(#gfLogoGrad)" />
    <path
      d="M17.6 6.4 C18.8 3.4 21.8 1.9 25 2.4 C24.6 5.6 22 8 18.6 7.9 C18.2 7.9 17.8 7.4 17.6 6.4 Z"
      fill="#17B26A"
    />
    <polyline
      points="9.6 18.6 13.8 22.8 21.6 13.6"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
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
            Prüfungsnahe Aufgaben, verständliche Schritt-für-Schritt-Lösungen, kurze
            Erklärvideos und eine KI, die dir jeden Rechenschritt erklärt. Du hörst auf
            zu suchen und fängst an zu verstehen.
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

      {/* Subject overview */}
      <section className={styles.lsec}>
        <div className={styles.lh}>Was dich im Abi erwartet</div>
        <p className={styles.secIntro}>
          Drei Prüfungsgebiete, aufgebaut nach dem hessischen Lehrplan. Jedes Thema gibt
          es für Grundkurs und Leistungskurs.
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

      {/* Features */}
      <section className={styles.lsec}>
        <div className={styles.lh}>Was du bekommst</div>
        <div className={styles.incl}>
          {[
            {
              title: 'Über 130 Aufgaben mit Musterlösungen',
              desc: 'Originale Übungsaufgaben im Stil der hessischen Abiturprüfung. Jede Lösung zeigt dir jeden einzelnen Schritt.',
              color: '#F0524A',
            },
            {
              title: 'Erklärvideos',
              desc: 'Kurze, dichte Videos zu zentralen Themen. Kein Füllstoff, nur was du fürs Abi brauchst.',
              color: '#6C63FF',
            },
            {
              title: 'KI-Hilfe',
              desc: 'Stell deine Frage auf Deutsch. Die KI erklärt dir den Weg Schritt für Schritt, nicht nur das Ergebnis.',
              color: '#17B26A',
            },
            {
              title: '1:1 Nachhilfe (bald)',
              desc: 'Buchbare Einzelstunden mit Tutor:innen sind in Vorbereitung. Bis dahin beantwortet dir die KI jede Frage sofort.',
              color: '#F5A623',
            },
          ].map(item => (
            <div key={item.title} className={styles.irow}>
              <div className={styles.ck} style={{ background: item.color }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <div className={styles.pt} style={{ color: '#F0524A' }}>Grundkurs</div>
            <h3>GK-Vollzugang</h3>
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
            <div className={styles.pt} style={{ color: '#6C63FF' }}>Leistungskurs</div>
            <h3>LK-Vollzugang</h3>
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
