'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from './BrandMark';
import styles from './SeitenKopf.module.css';

/**
 * Die Menüpunkte. Reihenfolge nach der Frage, die ein Besucher zuerst hat:
 * Was ist das — was kostet es — wer steckt dahinter — was ist noch offen.
 * Jeder Punkt führt auf eine eigene Seite, nicht auf eine Sprungmarke.
 */
export const MENUE_PUNKTE = [
  { label: 'Lernsystem', href: '/lernsystem' },
  { label: 'Kurse', href: '/kurse' },
  { label: 'Über uns', href: '/ueber-uns' },
  { label: 'Fragen', href: '/fragen' },
] as const;

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
     * Schriftzug „Gradefruit". Erst wenn er verschwindet, braucht die Leiste
     * eine Fläche — vorher steht sie über leerem Raum und darf transparent
     * bleiben. Seiten ohne Schwelle fallen auf einen festen Wert zurück.
     */
    const schwelleErreicht = () => {
      const marke = document.getElementById('kopf-schwelle');
      if (!marke) return Math.max(0, scrollWert()) > 40;
      const leistenHoehe = 72;
      return marke.getBoundingClientRect().bottom <= leistenHoehe;
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

  return (
    <>
      <nav className={`${styles.kopf} ${gescrollt ? styles.kopfFest : ''}`} aria-label="Hauptnavigation">
        <Link className={styles.marke} href="/" onClick={schliessen} aria-label="Zur Startseite">
          <BrandMark size={26} />
          <span>Gradefruit</span>
        </Link>

        <div className={styles.rechts}>
          {isAuthed ? (
            <>
              <button className={styles.textLink} onClick={onSignOut}>Abmelden</button>
              <button className={styles.knopf} onClick={onEnter}>Weiterlernen</button>
            </>
          ) : (
            <>
              {/* Anmelden gehört sichtbar in die Leiste: Wer schon ein Konto
                  hat, darf nicht erst ein Menü suchen müssen. */}
              <button className={styles.textLink} onClick={onLogin}>Anmelden</button>
              <button className={styles.knopf} onClick={onRegister}>Registrieren</button>
            </>
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
                  <span>{punkt.label}</span>
                  {/* Der Pfeil macht sichtbar, dass hier etwas anklickbar ist
                      und wohin es geht — reine Großbuchstaben sahen aus wie
                      Überschriften. */}
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.fuss}>
            <Link className={styles.klein} href="/einstellungen" onClick={schliessen}>
              <Zahnrad />
              Einstellungen
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
