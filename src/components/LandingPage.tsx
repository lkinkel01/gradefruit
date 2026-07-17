'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LandingPage.module.css';
import { Logo } from './Logo';
import { daysUntilExam } from '@/lib/exam';

const Arrow = () => (
  <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
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

const SYSTEM_POINTS = [
  {
    title: 'Dein Stand bleibt sichtbar.',
    desc: 'Du siehst, was verstanden, zu wiederholen oder noch unklar ist.',
  },
  {
    title: 'Unsicheres kommt zurück.',
    desc: 'Du entscheidest selbst, welche Aufgaben du noch einmal brauchst.',
  },
  {
    title: 'Hilfe bleibt im Kontext.',
    desc: 'Der Coach kennt die Formel, Aufgabe oder Lösung vor dir.',
  },
  {
    title: 'Alles passt zu deiner Prüfung.',
    desc: 'Mathe-Abitur Hessen 2027. Getrennt für Grundkurs und Leistungskurs.',
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
    desc: 'Den falschen Schritt finden und direkt klären.',
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
    desc: 'Gemischte Themen trainieren die Wahl des richtigen Ansatzes.',
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
  {
    label: 'Analysis',
    tone: 'analysis',
    topics: 'Differenzial- und Integralrechnung, Kurvendiskussion, Exponentialfunktionen, Optimierung',
  },
  {
    label: 'Lineare Algebra und Geometrie',
    tone: 'linalg',
    topics: 'Vektoren, Geraden, Ebenen, lineare Gleichungssysteme, Abstände und Schnitte',
  },
  {
    label: 'Stochastik',
    tone: 'stochastik',
    topics: 'Wahrscheinlichkeit, Binomialverteilung, Erwartungswert, Varianz und Hypothesentests',
  },
];

const PLAN_FEATURES = [
  'Alle Themen und Aufgaben deiner Kursart',
  'Schritt-für-Schritt-Lösungen',
  'Erklärvideos und Reel-Modus',
  'Gradefruit-Coach inklusive',
];

const FAQS = [
  {
    question: 'Für wen ist Gradefruit?',
    answer: 'Für Schüler:innen im Grundkurs oder Leistungskurs, die 2027 ihr schriftliches Mathe-Abitur in Hessen schreiben.',
  },
  {
    question: 'Was unterscheidet Gradefruit von anderen Lernplattformen?',
    answer: 'Gradefruit ist nicht für jedes Fach und jede Prüfung gebaut. Lernstand, Wiederholung, Aufgaben, Lösungen und Coach greifen für genau ein Ziel ineinander.',
  },
  {
    question: 'Wie funktioniert der Gradefruit-Coach?',
    answer: 'Der Coach kennt die Aufgabe, Formel oder Lösung, die du gerade ansiehst. So kannst du genau an der Stelle fragen, an der du nicht weiterkommst.',
  },
  {
    question: 'Welche Inhalte gibt es?',
    answer: 'Prüfungsnahe Aufgaben, Schritt-für-Schritt-Lösungen, Formelsammlungen und Erklärvideos für Analysis, lineare Algebra und Stochastik.',
  },
  {
    question: 'Kann ich eigene Unterlagen nutzen?',
    answer: 'Du kannst deinen eigenen Lösungsweg als Foto oder PDF hochladen und mit dem Coach besprechen. Eine allgemeine Bibliothek für eigene Lernunterlagen gibt es derzeit nicht.',
  },
  {
    question: 'Gibt es eine Community?',
    answer: 'Nein. Gradefruit konzentriert sich bewusst auf deinen eigenen Lernweg und deine Prüfung. Öffentliche Feeds, Kommentare oder Follower gibt es nicht.',
  },
  {
    question: 'Welche Bundesländer werden unterstützt?',
    answer: 'Aktuell konzentriert sich Gradefruit vollständig auf Hessen und den Abiturjahrgang 2027.',
  },
];

export default function LandingPage({
  isAuthed,
  owned,
  ownedLk,
  dark,
  onToggleDark,
  onEnter,
  onLogin,
  onRegister,
  onOpenCheckout,
  onSignOut,
}: Props) {
  const [days, setDays] = useState<number | null>(null);
  const fruitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const daysRaf = requestAnimationFrame(() => setDays(daysUntilExam()));
    const el = fruitRef.current;
    if (!el) return () => cancelAnimationFrame(daysRaf);

    const canParallax = window.matchMedia?.('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
    if (!canParallax?.matches) return () => cancelAnimationFrame(daysRaf);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(window.scrollY, 760);
        el.style.transform = `translate3d(0, calc(-50% - ${y * 0.025}px), 0) rotate(${y * 0.003}deg)`;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(daysRaf);
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, []);

  const plan = (
    label: string,
    price: string,
    recurringPrice: string,
    course: 'gk' | 'lk',
    tone: 'analysis' | 'linalg',
    hasAccess: boolean,
  ) => (
    <article className={styles.plan}>
      <div className={styles.planHeading}>
        <span className={`${styles.planMarker} ${styles[tone]}`} aria-hidden="true" />
        <h3>{label}</h3>
      </div>
      <div className={styles.planPrice}>
        <strong>{price}</strong>
        <span>einmalig</span>
      </div>
      <p className={styles.planAlternative}>oder {recurringPrice} pro Monat</p>
      <ul className={styles.planFeatures}>
        {PLAN_FEATURES.map(feature => <li key={feature}>{feature}</li>)}
      </ul>
      {hasAccess ? (
        <button className="btn light" disabled>Dein Zugang ist aktiv</button>
      ) : (
        <button className="btn primary" onClick={() => onOpenCheckout(course)}>{label} freischalten</button>
      )}
    </article>
  );

  return (
    <div className={styles.lpage}>
      <a className={styles.skipLink} href="#main-content">Zum Inhalt</a>

      <nav className={styles.nav} aria-label="Hauptnavigation">
        <button type="button" className={styles.brand} onClick={onEnter}>
          <Logo size={26} />
          <span>Gradefruit</span>
        </button>
        <div className={styles.navRight}>
          <button className={styles.iconBtn} onClick={onToggleDark} aria-label={dark ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}>
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
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

      <main id="main-content">
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroContext}>Mathe-Abitur Hessen 2027</p>
            <h1 className={styles.headline}>
              <span>Alles für dein</span>
              <span>Mathe-Abitur.</span>
              <span>Ein System.</span>
            </h1>
            <p className={styles.lead}>
              Kurse, Lernstand, Wiederholung und der KI-gestützte Gradefruit-Coach
              arbeiten zusammen. Für Grundkurs und Leistungskurs.
            </p>
            <div className={styles.heroActions}>
              <button className="btn primary big" onClick={onEnter}>
                {isAuthed ? 'Weiter lernen' : 'Kostenlos testen'}
              </button>
              <a className="gf-arrow" href="#system">Gradefruit entdecken <Arrow /></a>
            </div>
            <p className={styles.reassurance}>
              {isAuthed ? 'Mach genau da weiter, wo du aufgehört hast.' : 'Analysis kostenlos. Ohne Account. Ohne Zahlungsdaten.'}
            </p>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <span className={`${styles.orbitLabel} ${styles.orbitTop}`}>Lernstand</span>
            <span className={`${styles.orbitLabel} ${styles.orbitRight}`}>Coach</span>
            <span className={`${styles.orbitLabel} ${styles.orbitBottom}`}>Wiederholen</span>
            <div className={styles.heroOrbit} />
            <div className={styles.heroFruit} ref={fruitRef}>
              <Logo size={520} filled={1} />
            </div>
          </div>
        </header>

        <div className={styles.proofStrip} aria-label="Produktfokus">
          <div><strong>Hessen 2027</strong><span>prüfungsspezifisch</span></div>
          <div><strong>GK und LK</strong><span>getrennte Kursinhalte</span></div>
          <div><strong>{days ?? '—'} Tage</strong><span>voraussichtlich bis zur Prüfung</span></div>
        </div>

        <section className={styles.section} id="system">
          <div className={styles.sectionIntro}>
            <h2>Nicht mehr suchen.<br />Weiterlernen.</h2>
            <p>
              Gradefruit verbindet die Teile deiner Vorbereitung zu einem klaren
              Lernweg. Du behältst die Kontrolle. Das System hält den Zusammenhang.
            </p>
          </div>
          <div className={styles.systemLayout}>
            <div className={styles.systemVisual} role="img" aria-label="Lernen, einordnen, verstehen und wiederholen greifen ineinander.">
              <div className={styles.systemRing} aria-hidden="true">
                <span className={styles.systemTop}>Lernen</span>
                <span className={styles.systemRight}>Verstehen</span>
                <span className={styles.systemBottom}>Einordnen</span>
                <span className={styles.systemLeft}>Wiederholen</span>
                <Logo size={88} />
              </div>
            </div>
            <div className={styles.systemPoints}>
              {SYSTEM_POINTS.map(point => (
                <article key={point.title} className={styles.systemPoint}>
                  <h3>{point.title}</h3>
                  <p>{point.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.coachSection}`}>
          <div className={styles.coachCopy}>
            <p className={styles.sectionName}>KI-Unterstützung im richtigen Moment</p>
            <h2>Frag dort,<br />wo es hakt.</h2>
            <p className={styles.sectionLead}>
              Der Coach kennt die Aufgabe, Formel oder Lösung vor dir. Du musst
              den Zusammenhang nicht jedes Mal neu erklären.
            </p>
            <ul className={styles.capabilityList}>
              <li><strong>Schritte verstehen</strong><span>Direkt an einer Formel oder einem Rechenschritt nachfragen.</span></li>
              <li><strong>Fehler klären</strong><span>Sehen, an welcher Stelle dein Ansatz falsch abgebogen ist.</span></li>
              <li><strong>Eigene Lösung prüfen</strong><span>Deinen Rechenweg als Foto oder PDF besprechen.</span></li>
            </ul>
          </div>
          <div className={styles.coachStage} aria-label="Beispiel für eine Frage an den Gradefruit-Coach">
            <div className={styles.coachShell}>
              <div className={styles.coachContext}>
                <span>Analysis · Extremstellen</span>
                <strong>f′(x) = 3x² − 3</strong>
              </div>
              <p className={styles.coachQuestion}>Warum setze ich die Ableitung gleich null?</p>
              <div className={styles.coachAnswer}>
                <Logo size={28} />
                <p>Weil du Stellen suchst, an denen die Steigung null ist. Danach prüfst du, ob dort wirklich ein Hoch- oder Tiefpunkt liegt.</p>
              </div>
              <span className={styles.coachHint}>Die Antwort bleibt bei deiner Aufgabe.</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionIntro}>
            <h2>Nicht nur lesen.<br />Wirklich lernen.</h2>
            <p>Die Methoden sind kurz erklärt. Was noch nicht fertig ist, wird auch nicht als fertig verkauft.</p>
          </div>
          <div className={styles.methodList}>
            {LEARNING_METHODS.map(method => (
              <article key={method.title} className={method.available ? styles.methodRow : `${styles.methodRow} ${styles.methodPlanned}`}>
                <MethodIcon name={method.icon} />
                <h3>{method.title}</h3>
                <p>{method.desc}</p>
                <span className={method.available ? styles.methodLive : styles.methodSoon}>
                  {method.available ? 'Im Produkt' : 'In Vorbereitung'}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.visualSection}`}>
          <div className={styles.visualCopy}>
            <p className={styles.sectionName}>Visuelles Lernen</p>
            <h2>Mathe wird sichtbar.</h2>
            <p className={styles.sectionLead}>
              Erklärvideos verbinden Stimme, Animation und Rechenweg. Danach
              gehst du direkt in die passende Aufgabe.
            </p>
            <p className={styles.visualNote}>Klassisch ansehen oder im Reel-Modus weiterlernen.</p>
          </div>
          <div className={styles.visualStage} aria-label="Visualisierung einer Funktionsanalyse">
            <svg className={styles.graph} viewBox="0 0 520 320" role="img" aria-label="Kurve mit markiertem Tiefpunkt und Tangente">
              <path className={styles.graphGrid} d="M40 56H492M40 112H492M40 168H492M40 224H492M40 280H492M96 32V292M176 32V292M256 32V292M336 32V292M416 32V292" />
              <path className={styles.graphAxis} d="M40 168H492M256 32V292" />
              <path className={styles.graphCurve} d="M48 76C108 86 138 140 180 198C217 249 253 252 290 197C333 132 370 77 482 73" />
              <path className={styles.graphTangent} d="M150 226H342" />
              <circle className={styles.graphPoint} cx="256" cy="224" r="7" />
            </svg>
            <div className={styles.graphCaption}>
              <span>Schritt 3</span>
              <strong>Tiefpunkt prüfen</strong>
              <p>Die Steigung ist null. Jetzt entscheidet das Vorzeichen von f″(x).</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.focusLayout}>
            <div className={styles.focusIntro}>
              <h2>Nur deine Prüfung.<br />Nichts drum herum.</h2>
              <p>
                Kein allgemeiner Lernkatalog. Gradefruit konzentriert sich auf
                das schriftliche Mathe-Abitur in Hessen 2027.
              </p>
            </div>
            <div className={styles.trustBlock}>
              <h3>Aus Erfahrung entwickelt.</h3>
              <p>Aus eigener Abitur- und Studienerfahrung. Mit Blick auf die Stellen, an denen Vorbereitung oft unklar wird.</p>
              <div className={styles.trustFacts}>
                <div><strong>Hessen</strong><span>passend zu den Prüfungsanforderungen</span></div>
                <div><strong>Grundkurs und Leistungskurs</strong><span>getrennte Inhalte und Zugänge</span></div>
                <div><strong>Echte Stimmen, sobald sie da sind</strong><span>keine erfundenen Bewertungen oder Sterne</span></div>
              </div>
            </div>
          </div>
          <div className={styles.subjectList}>
            {SUBJECTS.map(subject => (
              <article key={subject.label} className={styles.subjectRow}>
                <span className={`${styles.subjectMarker} ${styles[subject.tone]}`} aria-hidden="true" />
                <h3>{subject.label}</h3>
                <p>{subject.topics}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="kurse">
          <div className={styles.sectionIntro}>
            <h2>Ein Zugang.<br />Bis zur Prüfung.</h2>
            <p>Einmal zahlen oder monatlich kündbar. Analysis kannst du vorher kostenlos ausprobieren.</p>
          </div>
          <div className={styles.plans}>
            {plan('Grundkurs', '79 €', '14,90 €', 'gk', 'analysis', owned)}
            {plan('Leistungskurs', '99 €', '17,90 €', 'lk', 'linalg', ownedLk)}
          </div>
          <p className={styles.planNote}>
            Alle Preise inkl. gesetzlicher Umsatzsteuer. Sichere Bezahlung über Stripe.
            Ob Einmalzahlung oder Abo, entscheidest du im nächsten Schritt.
          </p>
        </section>

        <section className={`${styles.section} ${styles.faqSection}`}>
          <div className={styles.faqIntro}>
            <h2>Kurz erklärt.</h2>
            <p>Die wichtigsten Antworten, bevor du anfängst.</p>
          </div>
          <div className={styles.faqList}>
            {FAQS.map(item => (
              <details key={item.question} className={styles.faqItem}>
                <summary>
                  <span>{item.question}</span>
                  <span className={styles.faqPlus} aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.closing}>
          <h2>Fang an.<br />Der Rest wird klarer.</h2>
          <div className={styles.closingActions}>
            <button className="btn primary big" onClick={onEnter}>
              {isAuthed ? 'Weiter lernen' : 'Kostenlos testen'}
            </button>
            <a className="gf-arrow" href="#kurse">Kurse ansehen <Arrow /></a>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <Logo size={22} />
          <span>Gradefruit</span>
          <small>Sichere Zahlung über Stripe · SSL-verschlüsselt</small>
        </div>
        <div className={styles.footerLinks}>
          <a href="/impressum">Impressum</a>
          <a href="/datenschutz">Datenschutz</a>
          <a href="/agb">AGB</a>
          <a href="/widerruf">Widerruf</a>
        </div>
        <p>© 2026 Gradefruit · Mathe-Abitur Hessen 2027</p>
      </footer>
    </div>
  );
}
