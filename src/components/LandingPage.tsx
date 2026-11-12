'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandMark } from './BrandMark';
import SeitenKopf from './SeitenKopf';
import SeitenFuss from './SeitenFuss';
import ProduktBild from './ProduktBild';
import { daysUntilExam } from '@/lib/exam';
import { PREISE } from '@/lib/preise';
import band from './SeitenBand.module.css';
import styles from './LandingPage.module.css';

interface Props {
  isAuthed: boolean;
  onEnter: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onSignOut: () => void;
}

/**
 * Startseite: Startbereich, drei kurze Teaser, Schluss.
 *
 * Alles Ausführliche liegt auf eigenen Seiten — /lernsystem, /kurse,
 * /ueber-uns, /fragen. Diese Seite beantwortet nur: was ist das, was kostet
 * es, wo geht es weiter. Vorher stand all das untereinander auf einer
 * einzigen Scrollstrecke.
 */
export default function LandingPage({ isAuthed, onEnter, onLogin, onRegister, onSignOut }: Props) {
  const [tage, setTage] = useState<number | null>(null);

  useEffect(() => {
    // Kein requestAnimationFrame: Im Hintergrund wird nicht gezeichnet, und der
    // Countdown bliebe leer, bis jemand den Tab in den Vordergrund holt.
    const t = window.setTimeout(() => setTage(daysUntilExam()), 0);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={styles.seite}>
      <a className={styles.skipLink} href="#inhalt">Zum Inhalt</a>

      <SeitenKopf
        isAuthed={isAuthed}
        onLogin={onLogin}
        onRegister={onRegister}
        onEnter={onEnter}
        onSignOut={onSignOut}
      />

      <main id="inhalt">
        <header className={styles.hero}>
          <h1 className={styles.nurVorleser}>
            Gradefruit: Vorbereitungskurse fürs Mathe-Abitur in Hessen 2027
          </h1>
          <div className={styles.heroMitte}>
            <BrandMark className={styles.heroMarke} size={92} />
            <p className={styles.heroName} id="kopf-schwelle">Gradefruit</p>
            {/* Sagt, was es ist. „Mathe-Abitur Hessen 2027" allein war eine
                Jahreszahl, kein Angebot. */}
            <p className={styles.heroZeile}>Vorbereitungskurse fürs Mathe-Abitur</p>
            <div className={styles.heroKnoepfe}>
              <button className={styles.heroKnopf} onClick={onEnter}>
                {isAuthed ? 'Weiterlernen' : 'Kostenlos testen'}
              </button>
              <Link className={styles.heroKnopf} href="/kurse">Kurse</Link>
            </div>
          </div>

          {/* Zeigt, dass es weitergeht. Ohne diesen Hinweis wirkte der leere
              Startbereich wie das Ende der Seite. */}
          <a className={styles.weiter} href="#teaser" aria-label="Weiter nach unten">
            <span>Mehr</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="6 13 12 19 18 13" />
            </svg>
          </a>
        </header>

        <div className={styles.fakten} id="teaser">
          <div><strong>Hessen 2027</strong><span>Schriftliche Abiturprüfung</span></div>
          <div><strong>GK und LK</strong><span>Getrennte Inhalte</span></div>
          <div><strong>{tage === null ? '—' : `${tage} Tage`}</strong><span>Bis zur Prüfung</span></div>
        </div>

        <section className={band.band}>
          <p className={band.name}>Lernsystem</p>
          <h2 className={band.titel}>Ein einfaches Lernsystem.</h2>
          <p className={band.zeile}>
            Aufgabe rechnen, Lösungsweg vergleichen, nachfragen, wiederholen.
            Mehr Schritte hat es nicht.
          </p>
          <div className={band.bild}>
            <ProduktBild
              name="uebersicht"
              alt="Die Übersicht in Gradefruit: Lernfortschritt pro Thema und der nächste Schritt."
              breite={2560}
              hoehe={1800}
            />
          </div>
          <Link className={band.knopf} href="/lernsystem">Zum Lernsystem</Link>
        </section>

        <section className={`${band.band} ${band.bandTon}`}>
          <p className={band.name}>Kurse</p>
          <h2 className={band.titel}>Einmal zahlen. Lernen bis zur Prüfung.</h2>
          <p className={band.zeile}>
            Grundkurs {PREISE.gk.einmalig}, Leistungskurs {PREISE.lk.einmalig}.
            Kein Abo, keine Verlängerung.
          </p>
          <Link className={band.knopf} href="/kurse">Zu den Kursen</Link>
        </section>

        <section className={band.band}>
          <p className={band.name}>Über uns</p>
          <h2 className={band.titel}>Gebaut für ein Abitur.</h2>
          <p className={band.zeile}>
            Mathe, Hessen, 2027. Kein Fach mehr, kein Bundesland mehr, kein
            Jahrgang mehr.
          </p>
          <Link className={band.knopf} href="/ueber-uns">Mehr über uns</Link>
        </section>

        <section className={`${band.band} ${band.bandTon}`}>
          <h2 className={band.titel}>Fang an.</h2>
          <p className={band.zeile}>Analysis ist kostenlos. Ohne Zahlungsdaten, ohne Frist.</p>
          <button className={band.knopf} onClick={isAuthed ? onEnter : onRegister}>
            {isAuthed ? 'Weiterlernen' : 'Kostenlos testen'}
          </button>
        </section>
      </main>

      <SeitenFuss />
    </div>
  );
}
