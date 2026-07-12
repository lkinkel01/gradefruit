'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import styles from './LandingPage.module.css';
import { Logo, GrapefruitProgress } from './Logo';
import { useReveal } from '@/lib/useReveal';

// Sektion, die beim Eintritt in den Viewport sanft aufsteigt (Scroll-Reveal).
function Reveal({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useReveal<HTMLElement>();
  return <section ref={ref} className={className} id={id}>{children}</section>;
}

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

const PlanFeat = ({ text }: { text: string }) => (
  <div className={styles.planFeat}>
    <svg className={styles.featCk} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
    {text}
  </div>
);

// Die wichtigsten Funktionen, ruhig erklärt (ersetzt die frühere Demo).
const FEATURES = [
  {
    title: 'Aufgaben im Abi-Stil',
    desc: 'Über 130 Übungsaufgaben, aufgebaut wie in der hessischen Prüfung. Vom Einstieg bis zum vollen Schwierigkeitsgrad.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
      </svg>
    ),
  },
  {
    title: 'Lösungen, die erklären',
    desc: 'Jede Lösung zeigt jeden einzelnen Schritt. Wenn etwas unklar bleibt, tippst du auf den Schritt und bekommst ihn erklärt.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    title: 'Erklärvideos mit Stimme',
    desc: 'Kurze Videos zu zentralen Themen, eingebettet in die Aufgaben – oder im Reel-Modus, einem Lernformat wie bei TikTok.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="3" /><polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Dein KI-Coach',
    desc: 'Beantwortet Fragen zu jeder Aufgabe und prüft deine eigene Rechnung, wenn du sie als Foto oder PDF hochlädst.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5" />
        <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
      </svg>
    ),
  },
];

export default function LandingPage({ isAuthed, owned, ownedLk, dark, onToggleDark, onEnter, onLogin, onRegister, onOpenCheckout, onSignOut }: Props) {
  // Dezente Parallax auf dem Grapefruit-Motiv hinter dem Hero: die Frucht
  // treibt beim Scrollen minimal langsamer als die Seite. Nur transform,
  // rAF-gedrosselt, bei reduced-motion komplett aus.
  const artRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = artRef.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY, 700);
        el.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className={styles.lpage}>
      <div className={styles.bgGlow} aria-hidden="true" />
      {/* Grapefruit-Motiv: großes, ruhiges Markenzeichen hinter dem Hero */}
      <div className={styles.heroArt} ref={artRef} aria-hidden="true">
        <GrapefruitProgress pct={58} size={360} rind="var(--line)" flesh="var(--surface-2)" gap="var(--canvas)" showLeaf={false} animate={false} />
      </div>

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

      {/* Hero: zentriert, ruhig, eine klare Aussage */}
      <section className={styles.hero}>
        <p className={styles.kicker}>Mathe-Abitur Hessen 2027</p>
        <h1>
          Die Prüfung kommt.<br />
          <span className={styles.grad}>Du wirst bereit sein.</span>
        </h1>
        <p className={styles.sub}>
          Prüfungsnahe Aufgaben, Lösungen, die jeden Schritt erklären,
          Erklärvideos und ein KI-Coach – abgestimmt auf die schriftliche
          Prüfung in Hessen. Für Grundkurs und Leistungskurs.
        </p>
        <div className={styles.cta}>
          {isAuthed ? (
            <button className="btn primary" onClick={onEnter}>Weiter lernen</button>
          ) : (
            <button className="btn primary" onClick={onEnter}>Kostenlos testen</button>
          )}
          <a className="btn light" href="#kurse">Kurse ansehen</a>
        </div>
        <p className={styles.microline}>
          {isAuthed
            ? 'Schön, dass du wieder da bist. Mach genau da weiter, wo du aufgehört hast.'
            : 'Analysis ist komplett gratis. Ohne Account, ohne Zahlungsdaten.'}
        </p>
      </section>

      {/* Funktionen */}
      <Reveal className={styles.lsec}>
        <div className={styles.features}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.feature}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Strategien: was den Unterschied macht */}
      <Reveal className={styles.lsec}>
        <p className={styles.eyebrow}>Der Unterschied</p>
        <h2 className={styles.h2}>Mehr als Aufgaben</h2>
        <p className={styles.secIntro}>
          Aufgaben rechnen kannst du überall. Gradefruit gibt dir dazu Strategien
          aus dem Studium und aus echter Prüfungserfahrung, die im Unterricht oft
          zu kurz kommen – kleine Dinge mit großer Wirkung in der Korrektur.
        </p>
        <div className={styles.stratGrid}>
          <div className={styles.strat}>
            <h3 className={styles.stratTitle}>Operatoren entschlüsseln</h3>
            <p className={styles.stratDesc}>
              „Zeigen", „Begründen", „Bestimmen" verlangen unterschiedlich viel.
              Wer den Unterschied kennt, schreibt genau das hin, was Punkte bringt.
            </p>
          </div>
          <div className={styles.strat}>
            <h3 className={styles.stratTitle}>Punkte sichern</h3>
            <p className={styles.stratDesc}>
              Antwortsatz, Einheiten, sauber notierte Schritte: die Gewohnheiten,
              die in der Korrektur zählen – bei jeder Aufgabe mitgedacht.
            </p>
          </div>
          <div className={styles.strat}>
            <h3 className={styles.stratTitle}>Wiederholen mit System</h3>
            <p className={styles.stratDesc}>
              Du ordnest jeden Inhalt ein: verstanden, wiederholen oder noch unklar.
              Gradefruit hält fest, was du vor der Prüfung noch einmal sehen solltest.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Themen */}
      <Reveal className={styles.lsec}>
        <p className={styles.eyebrow}>Der Stoff</p>
        <h2 className={styles.h2}>Was dich in der Prüfung erwartet</h2>
        <p className={styles.secIntro}>
          Alle Inhalte der schriftlichen Mathe-Abiturprüfung Hessen 2027,
          vollständig abgedeckt und nach dem Lehrplan aufgebaut.
        </p>
        <div className={styles.subjectGrid}>
          {[
            {
              label: 'Analysis',
              color: '#DE5D43',
              topics: ['Differenzial- & Integralrechnung', 'Kurvendiskussion', 'Exponentialfunktionen', 'Optimierungsaufgaben'],
            },
            {
              label: 'Lineare Algebra & Geometrie',
              color: '#5D6BC9',
              topics: ['Vektoren & Geraden', 'Ebenengleichungen', 'Lineare Gleichungssysteme', 'Abstands- & Schnittberechnungen'],
            },
            {
              label: 'Stochastik',
              color: '#2F9E68',
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
      </Reveal>

      {/* Kurse */}
      <Reveal className={styles.lsec} id="kurse">
        <p className={styles.eyebrow}>Zugang</p>
        <h2 className={styles.h2}>Kurse</h2>
        <p className={styles.secIntro}>
          Einmal zahlen und bis zur Prüfung lernen, oder monatlich und jederzeit
          kündbar. Analysis kannst du vorher in Ruhe kostenlos ausprobieren.
        </p>
        <div className={styles.plans}>
          <div className={styles.plan}>
            <div className={styles.planAccent} style={{ background: '#DE5D43' }} />
            <h3>Grundkurs</h3>
            <div className={styles.price}>79 €</div>
            <div className={styles.per}>einmalig, Zugang bis zur Prüfung</div>
            <div className={styles.altPrice}>oder 14,90 € pro Monat, monatlich kündbar</div>
            <div className={styles.planFeats}>
              <PlanFeat text="Alle Grundkurs-Themen und Aufgaben" />
              <PlanFeat text="Schritt-für-Schritt-Lösungen zu jeder Aufgabe" />
              <PlanFeat text="Erklärvideos zu zentralen Themen" />
              <PlanFeat text="KI-Coach inklusive" />
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
            <div className={styles.planAccent} style={{ background: '#5D6BC9' }} />
            <h3>Leistungskurs</h3>
            <div className={styles.price}>99 €</div>
            <div className={styles.per}>einmalig, Zugang bis zur Prüfung</div>
            <div className={styles.altPrice}>oder 17,90 € pro Monat, monatlich kündbar</div>
            <div className={styles.planFeats}>
              <PlanFeat text="Alle Leistungskurs-Themen und Aufgaben" />
              <PlanFeat text="Schritt-für-Schritt-Lösungen zu jeder Aufgabe" />
              <PlanFeat text="Erklärvideos zu zentralen Themen" />
              <PlanFeat text="KI-Coach inklusive" />
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
          Alle Preise inkl. gesetzlicher Umsatzsteuer. Sichere Bezahlung über Stripe;
          ob Einmalzahlung oder Abo, entscheidest du im nächsten Schritt.
        </p>
      </Reveal>

      {/* Closing CTA */}
      <div className={styles.closing}>
        <h2>Fang einfach an.</h2>
        <p>Analysis ist komplett kostenlos. Den vollen Kurs holst du dir, wenn du so weit bist.</p>
        <div className={styles.cta} style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={onEnter}>
            {isAuthed ? 'Weiter lernen' : 'Kostenlos testen'}
          </button>
          <a className="btn light" href="#kurse">Kurse ansehen</a>
        </div>
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
          <a href="/agb">AGB</a>
          <a href="/widerruf">Widerruf</a>
        </div>
        <div className={styles.footcopy}>© 2026 Gradefruit · Mathe-Abitur Hessen 2027</div>
      </footer>
    </div>
  );
}
