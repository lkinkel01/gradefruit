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

const PlanFeat = ({ text, highlight }: { text: string; highlight?: boolean }) => (
  <div className={styles.planFeat}>
    <svg className={highlight ? styles.featCkHL : styles.featCk} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {text}
  </div>
);

export default function LandingPage({ isAuthed, owned, dark, onToggleDark, onEnter, onLogin, onOpenCheckout, onSignOut }: Props) {
  return (
    <div className={styles.lpage}>
      <div className={styles.bgGlow} aria-hidden="true" />

      {/* Nav */}
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

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.eyebrow}>Mathe-Abitur Hessen 2027 · Grundkurs</div>
          <h1>
            Mathe-Abi 2027.<br />
            <span className={styles.grad}>Vorbereitung, die sitzt.</span>
          </h1>
          <p>
            Drei Prüfungsgebiete, vollständig vorbereitet — mit echten Abituraufgaben aus Hessen, vollständigen Musterlösungen und einem KI-Assistenten, der jeden Rechenschritt erklärt.
          </p>
          <div className={styles.cta}>
            {isAuthed ? (
              <>
                <button className="btn primary" onClick={onEnter}>Weiter lernen</button>
                {!owned && <button className="btn light" onClick={onOpenCheckout}>Vollzugang — 79 €</button>}
              </>
            ) : (
              <>
                <button className="btn primary" onClick={onEnter}>Kostenlos starten</button>
                <button className="btn light" onClick={onOpenCheckout}>Vollzugang — 79 €</button>
              </>
            )}
          </div>
          <p className={styles.microline}>
            {isAuthed
              ? 'Schön, dass du wieder da bist — mach da weiter, wo du aufgehört hast.'
              : 'Kein Account nötig · Sofort loslegen'}
          </p>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.mockCard}>
            <div className={styles.mockTop}>
              <span className={styles.mockBadge}>Analysis</span>
              <span className={styles.mockBadgeSub}>Kurvendiskussion</span>
            </div>
            <div className={styles.mockTaskBox}>
              <div className={styles.mockTaskLabel}>Aufgabe 3 b)</div>
              <div className={styles.mockTaskText}>
                Bestimme die Nullstellen von f und zeige rechnerisch, dass der Graph von f punktsymmetrisch zum Ursprung ist.
              </div>
            </div>
            <div className={styles.mockSep} />
            <div className={styles.mockAI}>
              <div className={styles.mockAIHeader}>
                <span className={styles.mockAIPulse} />
                <span className={styles.mockAILabel}>KI-Hilfe</span>
              </div>
              <div className={styles.mockAIBubble}>
                Setze f(x) = 0 und löse nach x auf. Für die Punktsymmetrie prüfst du, ob f(−x) = −f(x) gilt — dann ist der Ursprung der Symmetriepunkt.
              </div>
            </div>
            <div className={styles.mockProgress}>
              <div className={styles.mockProgRow}>
                <span>Kurvendiskussion</span>
                <span className={styles.mockProgVal}>3 / 7 Aufgaben</span>
              </div>
              <div className={styles.mockProgBar}>
                <div className={styles.mockProgFill} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topic chips */}
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

      {/* Subject overview */}
      <section className={styles.lsec}>
        <div className={styles.lh}>Was dich im Abi erwartet</div>
        <p className={styles.secIntro}>Drei Prüfungsgebiete, vollständig abgedeckt — priorisiert nach Häufigkeit im hessischen Abitur.</p>
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

      {/* How it works */}
      <section className={styles.lsec}>
        <div className={styles.lh}>So funktioniert es</div>
        <div className={styles.steps}>
          {[
            {
              num: '01',
              title: 'Thema wählen',
              desc: 'Wähle ein Thema aus Analysis, Linearer Algebra oder Stochastik — priorisiert nach Häufigkeit im hessischen Abitur.',
            },
            {
              num: '02',
              title: 'Durcharbeiten',
              desc: 'Erklärvideo oder Text — in deinem Tempo, so oft du willst. Kein Weiterklicken, wenn du noch nicht bereit bist.',
            },
            {
              num: '03',
              title: 'Üben & nachhaken',
              desc: 'Rechne echte Abituraufgaben nach — mit vollständigen Musterlösungen. Steckst du fest, erklärt dir der KI-Assistent Schritt für Schritt weiter.',
            },
          ].map(s => (
            <div key={s.num} className={styles.step}>
              <div className={styles.stepNum}>{s.num}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
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
              title: 'Abituraufgaben mit Musterlösungen',
              desc: 'Originalgetreue Aufgaben aus hessischen Abiturprüfungen — mit vollständigen Musterlösungen, die jeden Schritt zeigen.',
              color: '#F0524A',
            },
            {
              title: 'Erklärvideos',
              desc: 'Kurze, dichte Videos zu jedem Thema. Kein Füllstoff — nur was du für das Abi brauchst.',
              color: '#6C63FF',
            },
            {
              title: 'KI-Assistent',
              desc: 'Fragen auf Deutsch stellen. Die KI erklärt Schritt für Schritt — nicht nur das Ergebnis, sondern den Weg.',
              color: '#17B26A',
            },
            {
              title: '1:1 Nachhilfe',
              desc: 'Für Themen, die nicht sitzen: buchbare 1:1-Sessions mit erfahrenen Mathe-Tutor:innen.',
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
      <section className={styles.lsec}>
        <div className={styles.lh}>Dein Zugang</div>
        <div className={styles.plans}>
          <div className={styles.plan}>
            <div className={styles.pt}>Gratis</div>
            <h3>Einstieg</h3>
            <div className={styles.price}>0 €</div>
            <div className={styles.per}>dauerhaft kostenlos</div>
            <div className={styles.planFeats}>
              <PlanFeat text="Erste Themen in jedem Gebiet" />
              <PlanFeat text="Einführende Erklärungen je Gebiet" />
              <PlanFeat text="Erste Aufgaben pro Thema" />
            </div>
            <button className="btn light" style={{ marginTop: 'auto' }} onClick={onEnter}>
              {isAuthed ? 'Weiter lernen' : 'Kostenlos starten'}
            </button>
          </div>
          <div className={`${styles.plan} ${styles.planHl}`}>
            <div className={styles.pt}>Empfohlen</div>
            <h3>Vollzugang</h3>
            <div className={styles.price}>79 €</div>
            <div className={styles.per}>einmalig · kein Abo · bis zur Prüfung</div>
            <div className={styles.planFeats}>
              <PlanFeat text="Alle Themen & Aufgaben freigeschaltet" highlight />
              <PlanFeat text="Vollständige Musterlösungen" highlight />
              <PlanFeat text="Erklärvideos zu allen Themen" highlight />
              <PlanFeat text="KI-Assistent ohne Limit" highlight />
              <PlanFeat text="1:1 Nachhilfe mit echten Tutor:innen" highlight />
            </div>
            {owned ? (
              <button className="btn light" style={{ marginTop: 'auto' }} disabled>Dein Zugang ist aktiv</button>
            ) : (
              <button className="btn primary" style={{ marginTop: 'auto' }} onClick={onOpenCheckout}>Jetzt freischalten</button>
            )}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <div className={styles.closing}>
        <h2>Deine Vorbereitung beginnt hier.</h2>
        <p>Starte kostenlos — kein Account nötig. Den Vollzugang schaltest du frei, wenn du bereit bist.</p>
        <div className={styles.cta} style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={onEnter}>
            {isAuthed ? 'Weiter lernen' : 'Kostenlos starten'}
          </button>
          {!isAuthed && !owned && (
            <button className="btn light" onClick={onOpenCheckout}>Vollzugang — 79 €</button>
          )}
        </div>
        <p className={styles.microline}>Einmalige Zahlung · kein Abo · Zugang bis zur Prüfung</p>
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
          Sichere Zahlung über Stripe · SSL-verschlüsselt
        </div>
        <div className={styles.footlinks}>
          <a href="/impressum">Impressum</a>
          <a href="/datenschutz">Datenschutz</a>
        </div>
        <div className={styles.footcopy}>© 2026 Gradefruit · Mathe-Abitur Hessen 2027</div>
      </footer>
    </div>
  );
}
