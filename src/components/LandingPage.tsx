'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './LandingPage.module.css';
import { Logo, GrapefruitProgress } from './Logo';
import { useReveal } from '@/lib/useReveal';
import { daysUntilExam } from '@/lib/exam';

// Sektion mit inhaltsspezifischer Reveal-Choreografie aus dem CSS-Modul.
function Reveal({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useReveal<HTMLElement>();
  const classes = className ? `${styles.reveal} ${className}` : styles.reveal;
  return <section ref={ref} className={classes} id={id}>{children}</section>;
}

const Arrow = () => (
  <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

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

const WHY_POINTS = [
  {
    title: 'Du weißt, wo du stehst.',
    desc: 'Dein Lernstatus zeigt, was sitzt und was du noch einmal sehen solltest.',
  },
  {
    title: 'Du bleibst nicht an Fragen hängen.',
    desc: 'Der Coach kennt die Aufgabe, Formel oder Lösung, an der du gerade arbeitest.',
  },
  {
    title: 'Unsicheres kommt zurück.',
    desc: 'Du ordnest selbst ein, was verstanden, zu wiederholen oder noch unklar ist.',
  },
  {
    title: 'Dein eigener Rechenweg zählt.',
    desc: 'Lade deine Lösung als Foto oder PDF hoch und kläre genau deinen Ansatz.',
  },
  {
    title: 'Alles zielt auf dieselbe Prüfung.',
    desc: 'Grundkurs oder Leistungskurs. Mathe-Abitur Hessen 2027.',
  },
];

type MethodIconName = 'recall' | 'spacing' | 'errors' | 'adaptive' | 'interleaving';

const LEARNING_METHODS: Array<{
  icon: MethodIconName;
  title: string;
  desc: string;
  available: boolean;
}> = [
  {
    icon: 'recall',
    title: 'Active Recall',
    desc: 'Erst selbst lösen. Dann prüfen, was wirklich sitzt.',
    available: true,
  },
  {
    icon: 'errors',
    title: 'Fehleranalyse',
    desc: 'Den falschen Schritt finden und direkt mit dem KI-Coach klären.',
    available: true,
  },
  {
    icon: 'spacing',
    title: 'Spaced Repetition',
    desc: 'Wiederholen, bevor Wissen verloren geht.',
    available: false,
  },
  {
    icon: 'adaptive',
    title: 'Adaptive Aufgaben',
    desc: 'Aufgaben sollen sich an deinem Lernstand orientieren.',
    available: false,
  },
  {
    icon: 'interleaving',
    title: 'Interleaving',
    desc: 'Gemischte Themen trainieren, den richtigen Ansatz selbst zu erkennen.',
    available: false,
  },
];

function MethodIcon({ name }: { name: MethodIconName }) {
  return (
    <svg className={styles.methodIcon} aria-hidden="true" focusable="false" viewBox="0 0 40 40" fill="none">
      {name === 'recall' && (
        <>
          <path d="M12 12a12 12 0 1 1-2.4 13.8" />
          <path d="M12 6v6h6" />
        </>
      )}
      {name === 'spacing' && (
        <>
          <path d="M7 20h26" />
          <circle cx="8" cy="20" r="3" />
          <circle cx="19" cy="20" r="3" />
          <circle cx="32" cy="20" r="3" />
        </>
      )}
      {name === 'errors' && (
        <>
          <circle cx="20" cy="20" r="13" />
          <path d="m15 15 10 10m0-10L15 25" />
        </>
      )}
      {name === 'adaptive' && (
        <>
          <path d="M7 20h7c7 0 7-9 14-9h5" />
          <path d="M14 20c7 0 7 9 14 9h5" />
          <path d="m30 8 3 3-3 3m0 12 3 3-3 3" />
        </>
      )}
      {name === 'interleaving' && (
        <>
          <path d="M7 11h5c11 0 5 18 16 18h5" />
          <path d="M7 29h5c11 0 5-18 16-18h5" />
          <path d="m30 8 3 3-3 3m0 12 3 3-3 3" />
        </>
      )}
    </svg>
  );
}

const SUBJECTS = [
  { n: '01', label: 'Analysis', color: '#DE5D43', topics: 'Differenzial- & Integralrechnung · Kurvendiskussion · Exponentialfunktionen · Optimierung' },
  { n: '02', label: 'Lineare Algebra & Geometrie', color: '#5D6BC9', topics: 'Vektoren & Geraden · Ebenengleichungen · Lineare Gleichungssysteme · Abstände & Schnitte' },
  { n: '03', label: 'Stochastik', color: '#2F9E68', topics: 'Wahrscheinlichkeit · Binomialverteilung · Erwartungswert & Varianz · Hypothesentests' },
];

const PLAN_FEATS = [
  'Alle Themen und Aufgaben deiner Stufe',
  'Schritt-für-Schritt-Lösungen zu jeder Aufgabe',
  'Erklärvideos zu zentralen Themen',
  'KI-Coach inklusive',
];

export default function LandingPage({ isAuthed, owned, ownedLk, dark, onToggleDark, onEnter, onLogin, onRegister, onOpenCheckout, onSignOut }: Props) {
  const [days, setDays] = useState<number | null>(null);
  const fruitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDays(daysUntilExam());
    const el = fruitRef.current;
    if (!el) return;
    const canParallax = window.matchMedia?.('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
    if (!canParallax?.matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY, 800);
        el.style.transform = `translate3d(0, calc(-50% - ${y * 0.035}px), 0) rotate(${y * 0.004}deg)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, []);

  const plan = (label: string, price: string, per: string, course: 'gk' | 'lk', color: string, hasIt: boolean) => (
    <div className={styles.plan}>
      <div className={styles.planTop}>
        <span className={styles.planDot} style={{ background: color }} />
        <span className="gf-meta">{label}</span>
      </div>
      <div className={styles.planPrice}>
        <span className="gf-index">{price}</span>
        <span className={styles.planPer}>{per}</span>
      </div>
      <ul className={styles.planFeats}>
        {PLAN_FEATS.map(t => <li key={t}>{t}</li>)}
      </ul>
      {hasIt ? (
        <button className="btn light" disabled>Dein Zugang ist aktiv</button>
      ) : (
        <button className="btn primary" onClick={() => onOpenCheckout(course)}>{label} freischalten</button>
      )}
    </div>
  );

  return (
    <div className={styles.lpage}>
      {/* Nav */}
      <nav className={styles.nav}>
        <button type="button" className={styles.brand} onClick={onEnter}>
          <Logo size={26} />
          <span>Gradefruit</span>
        </button>
        <div className={styles.navRight}>
          <button className={styles.iconBtn} onClick={onToggleDark} aria-label={dark ? 'Hellmodus' : 'Dunkelmodus'}>
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
              <button className={styles.navLink} onClick={onSignOut}>Abmelden</button>
              <button className="btn primary sm" onClick={onEnter}>Weiter lernen</button>
            </>
          ) : (
            <>
              <button className={styles.navLink} onClick={onLogin}>Anmelden</button>
              <button className="btn primary sm" onClick={onRegister}>Registrieren</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO – asymmetrisch, Typo links, Grapefruit als angeschnittenes Grafikelement rechts */}
      <header className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className="gf-meta">Mathe-Abitur · Hessen · 2027</p>
          <h1 className={styles.headline}>
            <span>Ein System</span>
            <span>für genau deine</span>
            <span>Prüfung.</span>
          </h1>
          <p className={styles.lead}>
            Strukturierte Kurse, dein persönlicher Lernstand, gezielte Wiederholung
            und der KI-Coach greifen an einem Ort ineinander. Für das Mathe-Abitur
            Hessen 2027.
          </p>
          <div className={styles.heroCta}>
            <button className="btn primary big" onClick={onEnter}>
              {isAuthed ? 'Weiter lernen' : 'Kostenlos testen'}
            </button>
            <a className="gf-arrow" href="#entdecken">Gradefruit entdecken <Arrow /></a>
          </div>
          <p className={styles.reassure}>
            {isAuthed ? 'Mach genau da weiter, wo du aufgehört hast.' : 'Analysis kostenlos. Ohne Account. Ohne Zahlungsdaten.'}
          </p>
        </div>
        <div className={styles.heroRight} aria-hidden="true">
          <div className={styles.heroFruit} ref={fruitRef}>
            <GrapefruitProgress pct={100} size={540} showLeaf={false} animate={false} />
          </div>
        </div>
      </header>

      {/* Zahlen-Reihe – editoriale Kennzahlen, angeführt vom Countdown */}
      <div className={styles.stats}>
        <div className={`${styles.statItem} ${styles.statLead}`}>
          <span className="gf-index">{days ?? '—'}</span>
          <span className="gf-meta">Tage bis zur Prüfung</span>
        </div>
        {[
          { v: '130+', l: 'Aufgaben im Abi-Stil' },
          { v: '3', l: 'Prüfungsgebiete, komplett' },
          { v: '∞', l: 'Fragen an den KI-Coach' },
        ].map(s => (
          <div key={s.l} className={styles.statItem}>
            <span className="gf-index">{s.v}</span>
            <span className="gf-meta">{s.l}</span>
          </div>
        ))}
      </div>

      {/* Warum Gradefruit – das zusammenhängende System statt einzelner Features */}
      <Reveal className={styles.sec} id="entdecken">
        <div className={styles.secHead}>
          <p className="gf-meta">Warum Gradefruit?</p>
          <h2 className={styles.h2}>Mehr als Inhalte.<br />Ein System, das zusammenhängt.</h2>
          <p className={styles.secLead}>
            Gradefruit hält deinen Lernstand, offene Fragen und Wiederholungen
            an einem Ort zusammen.
          </p>
        </div>
        <div className={styles.whyFrame}>
          <div
            className={styles.whyVisual}
            role="img"
            aria-label="Lernen, verstehen, einordnen und wiederholen greifen in Gradefruit ineinander."
          >
            <div className={styles.systemLoop} aria-hidden="true">
              <svg className={styles.systemOrbit} viewBox="0 0 320 320" fill="none">
                <circle cx="160" cy="160" r="112" />
                <path d="m258 103 14 2-4 13" />
              </svg>
              <span className={`${styles.systemWord} ${styles.systemWordTop}`}>Lernen</span>
              <span className={`${styles.systemWord} ${styles.systemWordRight}`}>Verstehen</span>
              <span className={`${styles.systemWord} ${styles.systemWordBottom}`}>Einordnen</span>
              <span className={`${styles.systemWord} ${styles.systemWordLeft}`}>Wiederholen</span>
              <div className={styles.systemCenter}>
                <Logo size={72} />
                <span>Ein System</span>
              </div>
            </div>
          </div>
          <div className={styles.whyPoints}>
            {WHY_POINTS.map(point => (
              <article key={point.title} className={styles.whyPoint}>
                <h3>{point.title}</h3>
                <p>{point.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Lernmethoden – vorhandene und kommende Funktionen klar getrennt */}
      <Reveal className={styles.sec}>
        <div className={styles.secHead}>
          <p className="gf-meta">Lernmethoden</p>
          <h2 className={styles.h2}>Üben. Verstehen.<br />Gezielt zurückkommen.</h2>
          <p className={styles.secLead}>
            Gradefruit verbindet aktives Lösen, deinen Lernstatus und direkte Hilfe.
          </p>
        </div>
        <div className={styles.methodList}>
          {LEARNING_METHODS.map(method => (
            <article
              key={method.title}
              className={method.available ? styles.methodRow : `${styles.methodRow} ${styles.methodPlanned}`}
            >
              <MethodIcon name={method.icon} />
              <h3 className={styles.methodTitle}>{method.title}</h3>
              <p className={styles.methodDesc}>{method.desc}</p>
              <span className={`${styles.methodStatus} ${method.available ? styles.methodStatusLive : styles.methodStatusPlanned}`}>
                {method.available ? 'Im Produkt' : 'In Vorbereitung'}
              </span>
            </article>
          ))}
        </div>
      </Reveal>

      {/* Der Stoff – Themen als editoriale Liste */}
      <Reveal className={styles.sec}>
        <div className={styles.secHead}>
          <p className="gf-meta">Der Stoff</p>
          <h2 className={styles.h2}>Was dich in<br />der Prüfung erwartet.</h2>
        </div>
        <div className={styles.list}>
          {SUBJECTS.map(s => (
            <div key={s.label} className={styles.subjectRow}>
              <span className={styles.rowIndex} style={{ color: s.color }}>{s.n}</span>
              <h3 className={styles.rowTitle}>{s.label}</h3>
              <p className={styles.rowDesc}>{s.topics}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Kurse */}
      <Reveal className={styles.sec} id="kurse">
        <div className={styles.secHead}>
          <p className="gf-meta">Zugang</p>
          <h2 className={styles.h2}>Einmal zahlen.<br />Bis zur Prüfung lernen.</h2>
          <p className={styles.secLead}>
            Oder monatlich und jederzeit kündbar. Analysis kannst du vorher in Ruhe
            kostenlos ausprobieren.
          </p>
        </div>
        <div className={styles.plans}>
          {plan('Grundkurs', '79 €', 'einmalig · oder 14,90 €/Monat', 'gk', '#DE5D43', owned)}
          {plan('Leistungskurs', '99 €', 'einmalig · oder 17,90 €/Monat', 'lk', '#5D6BC9', ownedLk)}
        </div>
        <p className={styles.planNote}>
          Alle Preise inkl. gesetzlicher Umsatzsteuer. Sichere Bezahlung über Stripe —
          ob Einmalzahlung oder Abo, entscheidest du im nächsten Schritt.
        </p>
      </Reveal>

      {/* Closing */}
      <div className={styles.closing}>
        <h2 className={styles.closingH}>Fang<br />einfach an.</h2>
        <div className={styles.closingCta}>
          <button className="btn primary big" onClick={onEnter}>
            {isAuthed ? 'Weiter lernen' : 'Kostenlos testen'}
          </button>
          <a className="gf-arrow" href="#kurse">Kurse ansehen <Arrow /></a>
        </div>
      </div>

      <footer className={styles.foot}>
        <hr className="gf-rule" />
        <div className={styles.footInner}>
          <div className={styles.footBrand}>
            <Logo size={22} />
            <span>Gradefruit</span>
            <span className={styles.footTrust}>Sichere Zahlung über Stripe · SSL-verschlüsselt</span>
          </div>
          <div className={styles.footLinks}>
            <a href="/impressum">Impressum</a>
            <a href="/datenschutz">Datenschutz</a>
            <a href="/agb">AGB</a>
            <a href="/widerruf">Widerruf</a>
          </div>
        </div>
        <div className={styles.footCopy}>© 2026 Gradefruit · Mathe-Abitur Hessen 2027</div>
      </footer>
    </div>
  );
}
