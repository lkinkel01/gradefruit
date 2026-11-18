'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSprache } from '@/lib/sprache';
import { useDunkelmodus } from '@/lib/dunkelmodus';
import { BrandMark } from './BrandMark';
import styles from './SeitenKopf.module.css';

/**
 * Die Menüpunkte. Reihenfolge nach der Frage, die ein Besucher zuerst hat:
 * Was ist das, was kostet es, wer steckt dahinter, was ist noch offen.
 * Jeder Punkt führt auf eine eigene Seite, nicht auf eine Sprungmarke.
 */
export const MENUE_PUNKTE = [
  { schluessel: 'menue.lernsystem', href: '/lernsystem' },
  { schluessel: 'menue.kurse', href: '/kurse' },
  { schluessel: 'menue.ueberUns', href: '/ueber-uns' },
  { schluessel: 'menue.fragen', href: '/fragen' },
] as const;

function Sonne() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function Mond() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function Zahnrad() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export default function SeitenKopf({
  isAuthed,
  onLogin,
  onRegister,
  onEnter,
  onSignOut,
}: {
  isAuthed: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onEnter: () => void;
  onSignOut: () => void;
}) {
  const [menueOffen, setMenueOffen] = useState(false);
  const [gescrollt, setGescrollt] = useState(false);
  const pfad = usePathname();
  const { t } = useSprache();
  const { dunkel, waehlen } = useDunkelmodus();

  useEffect(() => {
    // Woher der Scrollwert kommt, ist je nach Umgebung verschieden: im Browser
    // das Fenster, im Web-Bereich der App unter Umständen ein Element.
    const scrollWert = (ziel?: EventTarget | null) => {
      const vomFenster = window.scrollY;
      if (vomFenster > 0) return vomFenster;
      const vomDokument = document.scrollingElement?.scrollTop ?? 0;
      if (vomDokument > 0) return vomDokument;
      const element = ziel as HTMLElement | null;
      return element && typeof element.scrollTop === 'number' ? element.scrollTop : 0;
    };

    /**
     * Umgeschaltet wird nicht nach festen Pixeln, sondern wenn die
     * Markenschwelle unter die Leiste wandert: Auf der Startseite ist das der
     * Schriftzug „Gradefruit". Seiten ohne Schwelle fallen auf einen festen
     * Wert zurück.
     */
    const schwelleErreicht = () => {
      const marke = document.getElementById('kopf-schwelle');
      if (!marke) return Math.max(0, scrollWert()) > 40;
      return marke.getBoundingClientRect().bottom <= 86;
    };

    const onScroll = () => setGescrollt(schwelleErreicht());

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
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = vorher;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menueOffen]);

  const schliessen = () => setMenueOffen(false);

  /* Ein Schalter, zwei Zustände. Die Symbole sagen, wohin es geht: Sonne für
     hell, Mond für dunkel. Der aktive Zustand ist hinterlegt. */
  const Darstellung = (
    <div className={styles.modus} role="group" aria-label={t('einstellungen.darstellung')}>
      <button
        type="button"
        className={!dunkel ? styles.modusAn : styles.modusAus}
        onClick={() => waehlen(false)}
        aria-pressed={!dunkel}
        title="Light Mode"
      >
        <Sonne />
        <span className={styles.nurVorleser}>Light Mode</span>
      </button>
      <button
        type="button"
        className={dunkel ? styles.modusAn : styles.modusAus}
        onClick={() => waehlen(true)}
        aria-pressed={dunkel}
        title="Dark Mode"
      >
        <Mond />
        <span className={styles.nurVorleser}>Dark Mode</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Schwebende Pille statt durchgehender Leiste: Sie sitzt mit Abstand zu
          allen Rändern, der Inhalt läuft sichtbar daneben vorbei. Beim Scrollen
          wird ihre Fläche dichter, damit der Text darunter nicht durchscheint. */}
      <nav className={`${styles.kopf} ${gescrollt ? styles.kopfFest : ''}`} aria-label="Hauptnavigation">
        <div className={styles.links}>
          <Link className={styles.marke} href="/" onClick={schliessen} aria-label={t('kopf.zurStartseite')}>
            <BrandMark size={24} />
            <span>Gradefruit</span>
          </Link>

          <button className={styles.testen} onClick={onEnter}>
            {isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
          </button>
        </div>

        <div className={styles.linkleiste}>
          {MENUE_PUNKTE.map(punkt => (
            <Link
              key={punkt.href}
              className={styles.seitenLink}
              href={punkt.href}
              aria-current={pfad === punkt.href ? 'page' : undefined}
            >
              {t(punkt.schluessel)}
            </Link>
          ))}
        </div>

        <div className={styles.rechts}>
          {Darstellung}
          {isAuthed ? (
            <button className={styles.textLink} onClick={onSignOut}>{t('kopf.abmelden')}</button>
          ) : (
            <>
              <button className={styles.textLink} onClick={onLogin}>{t('kopf.anmelden')}</button>
              <button className={styles.knopf} onClick={onRegister}>{t('kopf.registrieren')}</button>
            </>
          )}
          <button
            aria-controls="hauptmenue"
            aria-expanded={menueOffen}
            aria-label={menueOffen ? t('kopf.menueSchliessen') : t('kopf.menueOeffnen')}
            className={styles.striche}
            onClick={() => setMenueOffen(offen => !offen)}
            type="button"
          >
            <span aria-hidden="true"><i /><i /><i /></span>
          </button>
        </div>
      </nav>

      {menueOffen && (
        <div className={styles.menue} id="hauptmenue">
          <ul className={styles.punkte}>
            {MENUE_PUNKTE.map(punkt => (
              <li key={punkt.href}>
                <Link
                  className={styles.punkt}
                  href={punkt.href}
                  onClick={schliessen}
                  aria-current={pfad === punkt.href ? 'page' : undefined}
                >
                  <span>{t(punkt.schluessel)}</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.fuss}>
            {!isAuthed && (
              <button className={styles.klein} onClick={() => { schliessen(); onRegister(); }}>
                {t('kopf.registrieren')}
              </button>
            )}
            <Link className={styles.klein} href="/einstellungen" onClick={schliessen}>
              <Zahnrad />
              {t('kopf.einstellungen')}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
