'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useImAppRahmen } from '@/lib/nativeApp';
import styles from './LandingPage.module.css';
import { BrandMark } from './BrandMark';
import { daysUntilExam } from '@/lib/exam';
import { PREISE, STEUERHINWEIS } from '@/lib/preise';

/**
 * Eine echte Aufnahme aus dem Produkt, in hell und dunkel übereinandergelegt.
 * Getauscht wird per CSS über `body.dark` — ohne JavaScript, damit beim
 * Themenwechsel nichts flackert. Die Bilder liegen unter /public/produkt und
 * entstehen mit `scripts/produktbilder.mjs`.
 */
function ProduktBild({ name, alt, breite, hoehe }: { name: string; alt: string; breite: number; hoehe: number }) {
  return (
    <div className={styles.shot}>
      <img src={`/produkt/${name}-hell.webp`} alt={alt} width={breite} height={hoehe} loading="lazy" draggable={false} />
      <img src={`/produkt/${name}-dunkel.webp`} alt="" aria-hidden="true" width={breite} height={hoehe} loading="lazy" draggable={false} />
    </div>
  );
}

const Arrow = () => (
  <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
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

/**
 * Was Gradefruit heute kann — und nur das.
 *
 * Vorher standen hier zwei Listen nebeneinander (sechs „Systempunkte" und fünf
 * „Lernmethoden"), die sich überschnitten. Drei der Methoden waren im Code als
 * `available: false` markiert und wurden auf der Seite trotzdem als vorhanden
 * beworben. Was es nicht gibt, steht hier nicht mehr.
 */
const MERKMALE = [
  {
    icon: 'path',
    title: 'Ein klarer Weg durch den Stoff',
    desc: 'Zusammenfassungen, Übungen und prüfungsnahe Aufgaben im Stil der hessischen Abiturprüfung — nach Themen sortiert, nicht als Katalog.',
  },
  {
    icon: 'help',
    title: 'Ein Coach, der die Stelle kennt',
    desc: 'Frag direkt an der Aufgabe nach, vor der du sitzt. Du musst nichts noch einmal erklären, und „kapier ich nicht“ reicht völlig.',
  },
  {
    icon: 'methods',
    title: 'Erst selbst rechnen, dann vergleichen',
    desc: 'Jede Aufgabe hat einen Lösungsweg Schritt für Schritt — und dazu die zwei Fehler, die man an genau dieser Stelle typischerweise macht.',
  },
  {
    icon: 'content',
    title: 'Deine eigenen Unterlagen',
    desc: 'Lade deinen Rechenweg als Foto oder PDF hoch und geh ihn gemeinsam mit dem Coach durch.',
  },
  {
    icon: 'reel',
    title: 'Wiederholen im Swipe-Format',
    desc: 'Der Reel-Modus zeigt dir Aufgaben und Formeln im Hochformat — so, wie du es von TikTok und Instagram kennst.',
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
  // In der App darf es keinen Kaufweg geben — dann entfällt der Preisteil.
  const imApp = useImAppRahmen();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  // Nach einem Klick auf den schwebenden Menü-Knopf bleibt die Leiste stehen,
  // bis wirklich neu gescrollt wird — sonst würde ein nachlaufendes
  // Scroll-Ereignis (Momentum) sie sofort wieder verstecken.
  const navPinnedAtY = useRef<number | null>(null);

  useEffect(() => {
    // Kein requestAnimationFrame: Im Hintergrund wird nicht gezeichnet, und der
    // Countdown bliebe leer, bis jemand den Tab in den Vordergrund holt.
    const daysTimer = window.setTimeout(() => setDays(daysUntilExam()), 0);
    return () => window.clearTimeout(daysTimer);
  }, []);

  useEffect(() => {
    const sectionElements = LANDING_NAV_ITEMS
      .filter((item): item is typeof item & { id: LandingSectionId } => Boolean(item.id))
      .map(item => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    // Woher der Scrollwert kommt, ist je nach Umgebung verschieden: im Browser
    // das Fenster, im Web-Bereich der App unter Umständen ein Element. Deshalb
    // wird beides abgefragt, statt sich auf window.scrollY zu verlassen — genau
    // dieser Unterschied hat die Leiste in der App stehen lassen.
    const scrollWert = (ziel?: EventTarget | null) => {
      const vomFenster = window.scrollY;
      if (vomFenster > 0) return vomFenster;
      const vomDokument = document.scrollingElement?.scrollTop ?? 0;
      if (vomDokument > 0) return vomDokument;
      const element = ziel as HTMLElement | null;
      return element && typeof element.scrollTop === 'number' ? element.scrollTop : 0;
    };

    const onScroll = (event?: Event) => {
      const nextY = Math.max(0, scrollWert(event?.target));
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
    // Zusätzlich in der Erfassungsphase am Dokument: Scroll-Ereignisse aus
    // einzelnen Elementen steigen nicht auf und kämen am Fenster nie an.
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true });
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
      <p className={styles.planAlternative}>Keine Folgekosten, keine Kündigung nötig.</p>
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
                <button className={`btn sm ${styles.continueButton}`} onClick={onRegister}>Registrieren</button>
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
        {/* Startbild über die volle Höhe, darüber nur Logo und zwei Knöpfe.
            Vorher standen hier Vorspann, dreizeilige Überschrift, drei
            Stichpunkte und zwei Knöpfe neben einem Foto — fünf Dinge, die
            gleichzeitig um Aufmerksamkeit baten. Wer auf einer Startseite
            ankommt, braucht genau zwei Auskünfte: wo bin ich, und was kann ich
            hier tun. */}
        <header className={styles.hero}>
          <img
            className={styles.heroBild}
            src="/startbild.webp"
            alt=""
            aria-hidden="true"
            width={2560}
            height={1440}
            loading="eager"
            draggable={false}
          />
          <h1 className={styles.nurVorleser}>
            Gradefruit — Online-Intensivkurs für das Mathematik-Abitur in Hessen 2027
          </h1>
          <div className={styles.heroMitte}>
            <BrandMark className={styles.heroMarke} size={96} />
            <p className={styles.heroName}>Gradefruit</p>
            <p className={styles.heroZeile}>Mathe-Abitur Hessen 2027</p>
            <div className={styles.heroKnoepfe}>
              <button className={styles.heroKnopf} onClick={onEnter}>
                {isAuthed ? 'Weiterlernen' : 'Kostenlos testen'}
              </button>
              <a className={styles.heroKnopf} href="#kurse">Kurse</a>
            </div>
          </div>
        </header>

        <div className={styles.proofStrip} aria-label="Produktfokus">
          <div><strong>Schriftliche Abiturprüfung Mathematik 2027</strong><span>Abgestimmt auf Hessen</span></div>
          <div><strong>GK und LK</strong><span>Passend zu deinem Kurs</span></div>
          <div><strong>{days ?? '…'} Tage</strong><span>Bis zur schriftlichen Prüfung</span></div>
        </div>

        {/* Ab hier folgt jeder Abschnitt demselben Takt: eine gesperrte
            Bezeichnung, eine kurze Überschrift, eine Zeile, dann der Beleg.
            Zwei Bänder sind dunkel — der Wechsel gliedert die Seite, ohne dass
            es Trennlinien oder Kästen braucht. */}
        <section className={`${styles.band}`} id="system">
          <p className={styles.bandName}>Lernsystem</p>
          <h2 className={styles.bandTitel}>So lernst du damit.</h2>
          <p className={styles.bandZeile}>
            Zusammenfassungen, Aufgaben mit vollständigem Lösungsweg und ein
            Coach, der die Stelle kennt, vor der du sitzt.
          </p>
          <ul className={styles.merkmalListe}>
            {MERKMALE.map(m => (
              <li key={m.title}>
                <SystemIcon name={m.icon} />
                <span>{m.title}</span>
              </li>
            ))}
          </ul>
          <div className={styles.bandBild}>
            <ProduktBild
              name="uebersicht"
              alt="Die Übersicht in Gradefruit: Lernfortschritt pro Thema, offene Aufgaben und der nächste Schritt."
              breite={2560}
              hoehe={1800}
            />
          </div>
        </section>

        <section className={`${styles.band} ${styles.bandDunkel}`}>
          <p className={styles.bandName}>Reel-Modus</p>
          <h2 className={styles.bandTitel}>Swipen. Und dabei lernen.</h2>
          <p className={styles.bandZeile}>
            Aufgaben und Formeln im Hochformat — wie bei TikTok, nur mit dem,
            was bei dir gerade dran ist.
          </p>
          <div className={styles.bandHochkant}>
            <ProduktBild
              name="reel"
              alt="Der Reel-Modus auf dem Handy: eine Funktion mit ihrem Graphen, darunter verstanden, wiederholen oder nicht verstanden."
              breite={860}
              hoehe={1760}
            />
          </div>
        </section>

        <section className={styles.band} id="ueber-uns">
          <p className={styles.bandName}>Über uns</p>
          <h2 className={styles.bandTitel}>Nur deine Prüfung.</h2>
          <p className={styles.bandZeile}>
            Kein allgemeiner Lernkatalog. Nur das schriftliche Mathe-Abitur in
            Hessen 2027 — Grundkurs und Leistungskurs getrennt.
          </p>
          <ul className={styles.themenListe}>
            {SUBJECTS.map(subject => (
              <li key={subject.label}>
                <strong>{subject.label}</strong>
                <span>{subject.topics}</span>
              </li>
            ))}
          </ul>
        </section>

        {!imApp && (
        <section className={styles.band} id="kurse">
          <p className={styles.bandName}>Kurse</p>
          <h2 className={styles.bandTitel}>Ein Zugang. Bis zur Prüfung.</h2>
          <p className={styles.bandZeile}>
            Einmal zahlen, kein Abo. Analysis kannst du vorher kostenlos
            ausprobieren.
          </p>
          <div className={styles.plans}>
            {plan(PREISE.gk.label, PREISE.gk.einmalig, 'gk', 'analysis', owned)}
            {plan(PREISE.lk.label, PREISE.lk.einmalig, 'lk', 'linalg', ownedLk)}
          </div>
          <p className={styles.planNote}>
            {STEUERHINWEIS} Bezahlung über Stripe. Der Zugang gilt bis zum Ende
            des Prüfungszeitraums.
          </p>
        </section>
        )}

        <section className={`${styles.band} ${styles.bandDunkel}`}>
          <p className={styles.bandName}>Fragen</p>
          <h2 className={styles.bandTitel}>Kurz erklärt.</h2>
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
            {!imApp && <a className="gf-arrow" href="#kurse">Kurse ansehen <Arrow /></a>}
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
                  aria-label={`Gradefruit auf ${s.label}, bald verfügbar`}
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
