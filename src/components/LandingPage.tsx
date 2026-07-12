'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './LandingPage.module.css';
import { Logo, GrapefruitProgress } from './Logo';
import { useReveal } from '@/lib/useReveal';
import { daysUntilExam } from '@/lib/exam';

// Editoriale Sektion, die beim Eintritt in den Viewport aufsteigt.
function Reveal({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useReveal<HTMLElement>();
  return <section ref={ref} className={className} id={id}>{children}</section>;
}

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// Was drin ist – als editoriale, nummerierte Liste (keine Icon-Karten).
const FEATURES = [
  { n: '01', title: 'Aufgaben im Abi-Stil', desc: 'Über 130 Übungsaufgaben, aufgebaut wie in der hessischen Prüfung — vom Einstieg bis zum vollen Schwierigkeitsgrad.' },
  { n: '02', title: 'Lösungen, die erklären', desc: 'Jede Lösung zeigt jeden Schritt. Bleibt etwas unklar, tippst du den Schritt an und der Coach erklärt ihn dir.' },
  { n: '03', title: 'Erklärvideos mit Stimme', desc: 'Kurze Videos zu zentralen Themen — eingebettet in die Aufgaben oder im Reel-Modus, dem Lernformat im TikTok-Takt.' },
  { n: '04', title: 'Dein KI-Coach', desc: 'Beantwortet Fragen zu jeder Aufgabe und prüft deine eigene Rechnung, wenn du sie als Foto oder PDF hochlädst.' },
];

const STRATS = [
  { k: 'Operatoren', title: 'Operatoren entschlüsseln', desc: '„Zeigen", „Begründen", „Bestimmen" verlangen unterschiedlich viel. Wer den Unterschied kennt, schreibt genau das hin, was Punkte bringt.' },
  { k: 'Handwerk', title: 'Punkte sichern', desc: 'Antwortsatz, Einheiten, sauber notierte Schritte — die Gewohnheiten, die in der Korrektur zählen, bei jeder Aufgabe mitgedacht.' },
  { k: 'System', title: 'Wiederholen mit System', desc: 'Du ordnest jeden Inhalt ein: verstanden, wiederholen oder noch unklar. Gradefruit hält fest, was du vor der Prüfung nochmal sehen solltest.' },
];

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
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY, 800);
        el.style.transform = `translate3d(0, ${y * -0.06}px, 0) rotate(${y * 0.01}deg)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
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
        <div className={styles.brand} onClick={onEnter}>
          <Logo size={26} />
          <span>Gradefruit</span>
        </div>
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
            Die Prüfung<br />kommt.<br />Du wirst bereit.
          </h1>
          <p className={styles.lead}>
            Prüfungsnahe Aufgaben, Lösungen, die jeden Schritt erklären,
            Erklärvideos und ein KI-Coach — abgestimmt auf die schriftliche
            Prüfung in Hessen.
          </p>
          <div className={styles.heroCta}>
            <button className="btn primary big" onClick={onEnter}>
              {isAuthed ? 'Weiter lernen' : 'Kostenlos testen'}
            </button>
            <a className="gf-arrow" href="#kurse">Kurse ansehen <Arrow /></a>
          </div>
          <p className={styles.reassure}>
            {isAuthed ? 'Mach genau da weiter, wo du aufgehört hast.' : 'Analysis ist komplett gratis. Ohne Account, ohne Zahlungsdaten.'}
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

      {/* Was drin ist – nummerierte editoriale Liste */}
      <Reveal className={styles.sec}>
        <div className={styles.secHead}>
          <p className="gf-meta">Was drin ist</p>
          <h2 className={styles.h2}>Alles für<br />genau deine Prüfung.</h2>
        </div>
        <div className={styles.list}>
          {FEATURES.map(f => (
            <div key={f.n} className={styles.row}>
              <span className={styles.rowIndex}>{f.n}</span>
              <h3 className={styles.rowTitle}>{f.title}</h3>
              <p className={styles.rowDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Der Unterschied – Strategien */}
      <Reveal className={styles.sec}>
        <div className={styles.secHead}>
          <p className="gf-meta">Der Unterschied</p>
          <h2 className={styles.h2}>Mehr als<br />Aufgaben rechnen.</h2>
          <p className={styles.secLead}>
            Aufgaben rechnen kannst du überall. Gradefruit gibt dir die Strategien
            aus Studium und echter Prüfungserfahrung dazu — kleine Dinge mit großer
            Wirkung in der Korrektur.
          </p>
        </div>
        <div className={styles.stratRow}>
          {STRATS.map(s => (
            <div key={s.title} className={styles.strat}>
              <p className="gf-meta">{s.k}</p>
              <h3 className={styles.stratTitle}>{s.title}</h3>
              <p className={styles.stratDesc}>{s.desc}</p>
            </div>
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
