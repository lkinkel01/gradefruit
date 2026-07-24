'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './LandingPage.module.css';
import { BrandMark } from './BrandMark';
import { Logo } from './Logo';
import { daysUntilExam } from '@/lib/exam';

const Arrow = () => (
  <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const DocumentIcon = () => (
  <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3h7l4 4v14H7z" />
    <path d="M14 3v5h4M10 12h5M10 16h5" />
  </svg>
);

const LockIcon = () => (
  <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

const ShareIcon = () => (
  <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="m8.3 10.8 7.4-4.5M8.3 13.2l7.4 4.5" />
  </svg>
);

const SOCIALS: Array<{ label: string; href: string | null; icon: ReactNode }> = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/gradefruit.de/',
    icon: (
      <svg aria-hidden="true" focusable="false" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: null,
    icon: (
      <svg aria-hidden="true" focusable="false" width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3.1-2.5-.3-3.6-1v5.9a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v2.7a3 3 0 1 0 2.1 2.9V3h2.8Z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: null,
    icon: (
      <svg aria-hidden="true" focusable="false" width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 8.5V7c0-.8.2-1.2 1.3-1.2H17V3h-2.6C11.7 3 10.7 4.7 10.7 7v1.5H8.5V11h2.2v10h3.3V11h2.3l.4-2.5H14Z" />
      </svg>
    ),
  },
];

type LandingSectionId = 'kurse' | 'system' | 'ueber-uns';

const LANDING_NAV_ITEMS: ReadonlyArray<{
  href: string;
  id?: LandingSectionId;
  label: string;
}> = [
  { href: '#kurse', id: 'kurse', label: 'Kursangebot' },
  { href: '#system', id: 'system', label: 'Lernsystem' },
  { href: '#ueber-uns', id: 'ueber-uns', label: 'Über uns' },
  { href: '/impressum', label: 'Kontakt' },
];

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
    icon: 'path',
    title: 'Klarer Lernweg',
    desc: 'Zusammenfassungen, Übungen und Original-Abituraufgaben aus den letzten Jahren.',
  },
  {
    icon: 'help',
    title: 'KI und Tutorhilfe',
    desc: 'Fragen direkt im Lernkontext stellen.',
  },
  {
    icon: 'content',
    title: 'Eigene Inhalte',
    desc: 'Hochladen, integrieren und damit lernen.',
  },
  {
    icon: 'methods',
    title: 'Moderne Lernmethoden',
    desc: 'Active Recall, Spaced Repetition und Interleaving.',
  },
  {
    icon: 'reel',
    title: 'Reel-Modus',
    desc: 'Lerninhalte wiederholen, wie bei TikTok, Instagram und Co.',
  },
  {
    icon: 'community',
    title: 'Community-Wissen',
    desc: 'Unterlagen teilen und gemeinsam nutzen.',
  },
] satisfies Array<{
  icon: SystemIconName;
  title: string;
  desc: string;
}>;

type SystemIconName = 'path' | 'help' | 'content' | 'methods' | 'reel' | 'community';

function SystemIcon({ name }: { name: SystemIconName }) {
  return (
    <svg className={styles.systemIcon} aria-hidden="true" focusable="false" viewBox="0 0 40 40" fill="none">
      {name === 'path' && (
        <>
          <circle cx="11" cy="29" r="3" />
          <circle cx="29" cy="11" r="3" />
          <path d="M14 28c9 0 3-16 12-16" />
        </>
      )}
      {name === 'help' && (
        <>
          <path d="M8 10h24v17H18l-7 5v-5H8z" />
          <path d="M16.5 16a3.7 3.7 0 1 1 5.2 3.4c-1.4.7-1.7 1.5-1.7 2.6" />
          <path d="M20 25.8h.01" />
        </>
      )}
      {name === 'content' && (
        <>
          <path d="M11 6h13l6 6v22H11z" />
          <path d="M24 6v7h6M16 20h9M16 25h9M16 30h6" />
        </>
      )}
      {name === 'methods' && (
        <>
          <path d="M12 12a11 11 0 0 1 18 7" />
          <path d="m30 12 .3 7-7-.4" />
          <path d="M28 28a11 11 0 0 1-18-7" />
          <path d="m10 28-.3-7 7 .4" />
        </>
      )}
      {name === 'reel' && (
        <>
          <rect x="11" y="5" width="18" height="30" rx="5" />
          <path d="m18 15 7 5-7 5z" />
        </>
      )}
      {name === 'community' && (
        <>
          <circle cx="15" cy="15" r="5" />
          <circle cx="27" cy="17" r="4" />
          <path d="M6 33c.8-6 4-9 9-9s8.2 3 9 9M23 25c5.7-.4 9 2.2 10 7" />
        </>
      )}
    </svg>
  );
}

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
    answer: 'Aktuell kannst du deinen eigenen Lösungsweg als Foto oder PDF hochladen und mit dem Coach besprechen. Eine persönliche Bibliothek für weitere Lernunterlagen ist als nächste Ausbaustufe geplant.',
  },
  {
    question: 'Gibt es eine Community?',
    answer: 'Noch nicht. Freiwilliges Teilen, Likes, Kommentare und Follows sind als spätere Ebene geplant. Private Inhalte sollen dabei standardmäßig privat bleiben.',
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
  const [activeSection, setActiveSection] = useState<LandingSectionId | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  // Nach einem Klick auf den schwebenden Menü-Knopf bleibt die Leiste stehen,
  // bis wirklich neu gescrollt wird — sonst würde ein nachlaufendes
  // Scroll-Ereignis (Momentum) sie sofort wieder verstecken.
  const navPinnedAtY = useRef<number | null>(null);

  useEffect(() => {
    const daysRaf = requestAnimationFrame(() => setDays(daysUntilExam()));
    return () => cancelAnimationFrame(daysRaf);
  }, []);

  useEffect(() => {
    const sectionElements = LANDING_NAV_ITEMS
      .filter((item): item is typeof item & { id: LandingSectionId } => Boolean(item.id))
      .map(item => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const onScroll = () => {
      const nextY = Math.max(0, window.scrollY);
      if (navPinnedAtY.current !== null && Math.abs(nextY - navPinnedAtY.current) < 48) {
        // Leiste wurde gerade über den Menü-Knopf geöffnet: stehen lassen.
      } else {
        navPinnedAtY.current = null;
        setNavHidden(nextY > 12);
        if (nextY > 12 && mobileNavOpen) setMobileNavOpen(false);
      }
      if (nextY < 260) setActiveSection(null);
    };

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible && window.scrollY >= 260) {
          setActiveSection(visible.target.id as LandingSectionId);
        }
      },
      { rootMargin: '-14% 0px -68% 0px', threshold: [0, 0.2, 0.45] },
    );

    sectionElements.forEach(element => observer.observe(element));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };
    const desktopQuery = window.matchMedia('(min-width: 981px)');
    const onDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileNavOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    desktopQuery.addEventListener('change', onDesktop);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      desktopQuery.removeEventListener('change', onDesktop);
    };
  }, [mobileNavOpen]);

  const chooseSection = (id: LandingSectionId) => {
    setActiveSection(id);
    setMobileNavOpen(false);
  };

  // Logo-Klick: Die Startseite ist bereits die Home-Route — also ruhig an den
  // Seitenanfang, nie automatisch ins Produkt.
  const scrollToTop = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

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

      <nav
        className={`${styles.nav} ${navHidden ? styles.navHidden : ''}`}
        aria-label="Hauptnavigation"
      >
        <div className={styles.navBar}>
          <button type="button" className={styles.brand} onClick={scrollToTop} aria-label="Zur Gradefruit Startseite">
            <BrandMark size={28} />
            <span>Gradefruit</span>
          </button>

          <div className={styles.navCenter} aria-label="Bereiche der Startseite">
            {LANDING_NAV_ITEMS.map(item => (
              <a
                aria-current={activeSection === item.id ? 'location' : undefined}
                className={activeSection === item.id ? styles.navSectionActive : styles.navSection}
                href={item.href}
                key={item.label}
                onClick={item.id ? () => chooseSection(item.id as LandingSectionId) : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>

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
            <div className={styles.desktopAccount}>
              {isAuthed ? (
                <>
                  <button className={styles.navLink} onClick={onSignOut}>Abmelden</button>
                  <button className={`btn sm ${styles.continueButton}`} onClick={onEnter}>Weiterlernen</button>
                </>
              ) : (
                <>
                  <button className={styles.navLink} onClick={onLogin}>Anmelden</button>
                  <button className="btn primary sm" onClick={onRegister}>Registrieren</button>
                </>
              )}
            </div>
            <button
              aria-controls="mobile-landing-navigation"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Menü schließen' : 'Menü öffnen'}
              className={`${styles.iconBtn} ${styles.menuBtn}`}
              onClick={() => {
                setNavHidden(false);
                setMobileNavOpen(open => !open);
              }}
              type="button"
            >
              <span className={styles.menuIcon} aria-hidden="true"><i /><i /><i /></span>
            </button>
          </div>
        </div>

        <div className={styles.mobileNav} hidden={!mobileNavOpen} id="mobile-landing-navigation">
          <div className={styles.mobileAccount}>
            {isAuthed ? (
              <>
                <button className={styles.navLink} onClick={onSignOut}>Abmelden</button>
                <button className={`btn sm ${styles.continueButton}`} onClick={onEnter}>Weiterlernen</button>
              </>
            ) : (
              <>
                <button className={styles.navLink} onClick={onLogin}>Anmelden</button>
                <button className={`btn sm ${styles.continueButton}`} onClick={onEnter}>Kostenlos testen</button>
              </>
            )}
          </div>
          <div className={styles.mobileSections}>
            {LANDING_NAV_ITEMS.map(item => (
              <a
                aria-current={activeSection === item.id ? 'location' : undefined}
                href={item.href}
                key={item.label}
                onClick={item.id ? () => chooseSection(item.id as LandingSectionId) : undefined}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Beim Scrollen bleibt das Menü erreichbar: kleiner schwebender
          Knopf oben links (Desktop und mobil). */}
      <button
        type="button"
        className={`${styles.floatingMenu} ${navHidden && !mobileNavOpen ? styles.floatingMenuVisible : ''}`}
        aria-label="Menü anzeigen"
        onClick={() => {
          navPinnedAtY.current = window.scrollY;
          setNavHidden(false);
          if (window.matchMedia('(max-width: 980px)').matches) setMobileNavOpen(true);
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <main id="main-content">
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroContext}>Online-Intensivkurs für das Mathematik-Abitur in Hessen 2027</p>
            <h1 className={styles.headline}>
              <span>Deine gesamte </span>
              <span className={styles.headlineNoBreak}>Mathe-Abiturvorbereitung </span>
              <span>an einem Ort.</span>
            </h1>
            <ul className={styles.heroHighlights}>
              <li>24/7 KI-Tutor</li>
              <li>Originale Abituraufgaben</li>
              <li>Erklärvideos</li>
            </ul>
            <div className={styles.heroActions}>
              <div className={styles.heroPrimaryAction}>
                <button
                  className={`btn big ${styles.continueButton}`}
                  onClick={onEnter}
                >
                  {isAuthed ? 'Weiterlernen' : 'Kostenlos testen'}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroPhoto}>
              <img
                src="/hero-lernen.jpg"
                alt="Cleaner Lernplatz mit Laptop und aufgeschlagenem Heft – Vorbereitung aufs Mathe-Abitur."
                width={1300}
                height={867}
                loading="eager"
                draggable={false}
              />
            </div>
          </div>
        </header>

        <div className={styles.proofStrip} aria-label="Produktfokus">
          <div><strong>Schriftliche Abiturprüfung Mathematik 2027</strong><span>Abgestimmt auf Hessen</span></div>
          <div><strong>GK und LK</strong><span>Passend zu deinem Kurs</span></div>
          <div><strong>{days ?? '…'} Tage</strong><span>Bis zur schriftlichen Prüfung</span></div>
        </div>

        <section className={styles.section} id="system">
          <div className={styles.sectionIntro}>
            <h2>Mehr als ein Kurs. Ein vollständiges Lernsystem.</h2>
            <p>
              Active Recall, Spaced Repetition und Interleaving. KI-Tutor rund um
              die Uhr. Lernen im Swipe-Modus.
            </p>
          </div>
          <div className={styles.systemLayout}>
            <div
              className={styles.systemVisual}
              role="img"
              aria-label="Klarer Lernweg, KI und Tutorhilfe, eigene Inhalte, moderne Lernmethoden, Reel-Modus und Community-Wissen bilden das Gradefruit-Lernsystem."
            >
              <div className={styles.systemDiagram} aria-hidden="true">
                <div className={styles.systemCore}>
                  <Logo size={76} />
                  <strong>Gradefruit</strong>
                </div>
                <div className={styles.systemLabels}>
                  {SYSTEM_POINTS.map(point => (
                    <span key={point.title}>{point.title}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.systemPoints}>
              {SYSTEM_POINTS.map(point => (
                <article key={point.title} className={styles.systemPoint}>
                  <SystemIcon name={point.icon} />
                  <h3>{point.title}</h3>
                  <p>{point.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.coachSection}`} id="coach">
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
            </div>
          </div>
        </section>

        <section className={styles.section} id="lernweise">
          <div className={styles.sectionIntro}>
            <h2>Nicht nur lesen.<br />Wirklich lernen.</h2>
            <p>Jede Methode erfüllt einen klaren Zweck. Geplantes bleibt klar gekennzeichnet.</p>
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

        <section className={styles.section} id="bibliothek">
          <div className={styles.libraryIntro}>
            <div>
              <p className={styles.sectionName}>Ausblick · noch nicht verfügbar</p>
              <h2>Deine Lernbibliothek wächst mit dir.</h2>
            </div>
            <div className={styles.libraryPromise}>
              <p>
                Geplant ist ein Ort für deine Zusammenfassungen,
                Formelsammlungen, Aufgaben und Lösungen. Der Coach arbeitet mit
                deinen Unterlagen. Du entscheidest, was privat bleibt.
              </p>
              <a className="gf-arrow" href="#kurse">Gradefruit heute entdecken <Arrow /></a>
            </div>
          </div>

          <div className={styles.libraryStage} aria-label="Konzept für eine zukünftige private Lernbibliothek mit freiwillig geteilten Inhalten">
            <div className={styles.privateLibrary}>
              <div className={styles.libraryHeader}>
                <div>
                  <Logo size={30} />
                  <strong>Deine Bibliothek</strong>
                </div>
                <span><LockIcon /> Privat</span>
              </div>
              <div className={styles.libraryFiles}>
                <div><DocumentIcon /><span><strong>Analysis zusammengefasst</strong><small>Zusammenfassung</small></span><em>Nur du</em></div>
                <div><DocumentIcon /><span><strong>Formeln für die Prüfung</strong><small>Formelsammlung</small></span><em>Nur du</em></div>
                <div><DocumentIcon /><span><strong>Eigene Aufgaben und Lösungen</strong><small>Sammlung</small></span><em>Nur du</em></div>
              </div>
            </div>

            <div className={styles.libraryConnection} aria-hidden="true">
              <span />
              <div>
                <Logo size={38} />
                <strong>Mit dem Coach verstehen</strong>
                <small>auf Basis deiner Inhalte</small>
              </div>
              <span />
            </div>

            <div className={styles.communityLibrary}>
              <div className={styles.libraryHeader}>
                <div>
                  <ShareIcon />
                  <strong>Freiwillig geteilt</strong>
                </div>
                <span>Öffentlich</span>
              </div>
              <div className={styles.sharedMaterial}>
                <span>Stochastik · Zusammenfassung</span>
                <strong>Hypothesentests kompakt erklärt</strong>
                <p>Ein hilfreicher Inhalt aus der Community. Sichtbar, weil er bewusst geteilt wurde.</p>
              </div>
              <div className={styles.communitySignals} aria-label="Geplante Community-Funktionen">
                <span>Entdecken</span>
                <span>Gefällt mir</span>
                <span>Kommentieren</span>
                <span>Folgen</span>
              </div>
            </div>
          </div>

          <div className={styles.libraryPrinciples}>
            <div><strong>Privat als Standard</strong><span>Nichts wird ohne deine Freigabe öffentlich.</span></div>
            <div><strong>Teilen bleibt freiwillig</strong><span>Du wählst einzelne Inhalte, nie deine ganze Bibliothek.</span></div>
            <div><strong>Hilfreiches wird sichtbar</strong><span>Reaktionen und Kommentare sollen Orientierung geben.</span></div>
          </div>
        </section>

        <section className={styles.section} id="ueber-uns">
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
                <div><strong>Eigene Erfahrung</strong><span>entwickelt aus Abitur und Studium</span></div>
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
            <button className={`btn big ${styles.continueButton}`} onClick={onEnter}>
              {isAuthed ? 'Weiterlernen' : 'Kostenlos testen'}
            </button>
            <a className="gf-arrow" href="#kurse">Kurse ansehen <Arrow /></a>
          </div>
          <div className={styles.social}>
            <span className={styles.socialLabel}>Folge Gradefruit</span>
            <div className={styles.socialRow}>
              {SOCIALS.map(s => s.href ? (
                <a
                  key={s.label}
                  className={styles.socialLink}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Gradefruit auf ${s.label}`}
                >
                  {s.icon}
                </a>
              ) : (
                <span
                  key={s.label}
                  className={`${styles.socialLink} ${styles.socialLinkSoon}`}
                  aria-label={`Gradefruit auf ${s.label} – bald`}
                >
                  {s.icon}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
            <BrandMark size={23} />
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
