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

/**
 * Die Punkte im Vollbild-Menü. Bewusst kurz: Jeder Punkt führt zu etwas, das
 * es wirklich gibt. Noch sind es Sprungmarken auf derselben Seite — eigene
 * Seiten folgen, dann ändert sich hier nur das href.
 */
const MENUE_PUNKTE = [
  { label: 'Lernsystem', href: '#system' },
  { label: 'Reel-Modus', href: '#reel' },
  { label: 'Kurse', href: '#kurse' },
  { label: 'Über uns', href: '#ueber-uns' },
  { label: 'Fragen', href: '#fragen' },
] as const;

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
  // In der App darf es keinen Kaufweg geben — dann entfällt der Preisteil.
  const imApp = useImAppRahmen();
  const [menueOffen, setMenueOffen] = useState(false);
  /* Sobald man den Startbereich verlässt, bekommt die Kopfleiste eine Fläche. */
  const [gescrollt, setGescrollt] = useState(false);

  useEffect(() => {
    // Kein requestAnimationFrame: Im Hintergrund wird nicht gezeichnet, und der
    // Countdown bliebe leer, bis jemand den Tab in den Vordergrund holt.
    const daysTimer = window.setTimeout(() => setDays(daysUntilExam()), 0);
    return () => window.clearTimeout(daysTimer);
  }, []);

  useEffect(() => {
    // Woher der Scrollwert kommt, ist je nach Umgebung verschieden: im Browser
    // das Fenster, im Web-Bereich der App unter Umständen ein Element. Deshalb
    // wird beides abgefragt — genau dieser Unterschied hat die Leiste in der
    // App früher stehen lassen.
    const scrollWert = (ziel?: EventTarget | null) => {
      const vomFenster = window.scrollY;
      if (vomFenster > 0) return vomFenster;
      const vomDokument = document.scrollingElement?.scrollTop ?? 0;
      if (vomDokument > 0) return vomDokument;
      const element = ziel as HTMLElement | null;
      return element && typeof element.scrollTop === 'number' ? element.scrollTop : 0;
    };

    const onScroll = (event?: Event) => {
      setGescrollt(Math.max(0, scrollWert(event?.target)) > 40);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!menueOffen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenueOffen(false);
    };
    // Solange das Menü die ganze Fläche einnimmt, soll dahinter nichts scrollen.
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = vorher;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menueOffen]);

  // Logo-Klick: Die Startseite ist bereits die Home-Route — also ruhig an den
  // Seitenanfang, nie automatisch ins Produkt.
  const scrollToTop = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setMenueOffen(false);
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

      {/* Kopfleiste nach Yumi-Vorbild: über dem Startbereich unsichtbar, erst
          beim Scrollen legt sich eine Fläche darunter. Rechts ein Knopf und
          die drei Striche — links nur die Marke. Der frühere Aufbau hatte
          Menüpunkte in der Mitte, einen Dunkelmodus-Schalter, eine Leiste, die
          sich beim Scrollen wegschob, und zusätzlich einen schwebenden Knopf
          oben links. Vier Dinge für eine Aufgabe. */}
      <nav
        className={`${styles.kopf} ${gescrollt ? styles.kopfFest : ''}`}
        aria-label="Hauptnavigation"
      >
        <button type="button" className={styles.brand} onClick={scrollToTop} aria-label="Zur Gradefruit Startseite">
          <BrandMark size={26} />
          <span>Gradefruit</span>
        </button>

        <div className={styles.kopfRechts}>
          {isAuthed ? (
            <button className={styles.kopfKnopf} onClick={onEnter}>Weiterlernen</button>
          ) : (
            <button className={styles.kopfKnopf} onClick={onRegister}>Registrieren</button>
          )}
          <button
            aria-controls="hauptmenue"
            aria-expanded={menueOffen}
            aria-label={menueOffen ? 'Menü schließen' : 'Menü öffnen'}
            className={styles.striche}
            onClick={() => setMenueOffen(offen => !offen)}
            type="button"
          >
            <span aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
      </nav>

      {/* Vollflächiges Menü statt einer aufklappenden Leiste. */}
      {menueOffen && (
      <div className={styles.menue} id="hauptmenue">
        <div className={styles.menueInhalt}>
          {MENUE_PUNKTE.map(punkt => (
            <a key={punkt.label} className={styles.menuePunkt} href={punkt.href} onClick={() => setMenueOffen(false)}>
              {punkt.label}
            </a>
          ))}
          <div className={styles.menueFuss}>
            {isAuthed ? (
              <button className={styles.menueKlein} onClick={onSignOut}>Abmelden</button>
            ) : (
              <button className={styles.menueKlein} onClick={onLogin}>Anmelden</button>
            )}
            <button
              className={styles.menueKlein}
              onClick={onToggleDark}
              aria-label={dark ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {dark ? 'Heller Modus' : 'Dunkler Modus'}
            </button>
          </div>
        </div>
      </div>
      )}


      <main id="main-content">
        {/* Startbild über die volle Höhe, darüber nur Logo und zwei Knöpfe.
            Vorher standen hier Vorspann, dreizeilige Überschrift, drei
            Stichpunkte und zwei Knöpfe neben einem Foto — fünf Dinge, die
            gleichzeitig um Aufmerksamkeit baten. Wer auf einer Startseite
            ankommt, braucht genau zwei Auskünfte: wo bin ich, und was kann ich
            hier tun. */}
        {/* Kein Hintergrundbild. Fläche, Marke, zwei Knöpfe — sonst nichts. */}
        <header className={styles.hero}>
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

        <section className={`${styles.band} ${styles.bandTon}`} id="reel">
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

        <section className={`${styles.band} ${styles.bandTon}`} id="fragen">
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
