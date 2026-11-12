'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandMark } from './BrandMark';
import SeitenKopf from './SeitenKopf';
import SeitenFuss from './SeitenFuss';
import ProduktBild from './ProduktBild';
import { daysUntilExam } from '@/lib/exam';
import { useSprache } from '@/lib/sprache';
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
  const { t } = useSprache();

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
          <h1 className={styles.nurVorleser}>{t('start.titelVersteckt')}</h1>
          <div className={styles.heroMitte}>
            <BrandMark className={styles.heroMarke} size={92} />
            <p className={styles.heroName} id="kopf-schwelle">Gradefruit</p>
            {/* Drei Angaben, durch Punkte getrennt: was, welches Fach, welche
                Prüfung. Ohne Umgangssprache wie „fürs". */}
            <p className={styles.heroZeile}>{t('start.zeile')}</p>
            <div className={styles.heroKnoepfe}>
              <button className={styles.heroKnopf} onClick={onEnter}>
                {isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
              </button>
              <Link className={styles.heroKnopf} href="/kurse">{t('start.kurse')}</Link>
            </div>
          </div>

          {/* Zeigt, dass es weitergeht. Ohne diesen Hinweis wirkte der leere
              Startbereich wie das Ende der Seite. */}
          <a className={styles.weiter} href="#teaser" aria-label="Weiter nach unten">
            <span>{t('start.mehr')}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="6 13 12 19 18 13" />
            </svg>
          </a>
        </header>

        <div className={styles.fakten} id="teaser">
          <div><strong>{t('start.faktenPruefung')}</strong><span>{t('start.faktenPruefungSub')}</span></div>
          <div><strong>{t('start.faktenKurse')}</strong><span>{t('start.faktenKurseSub')}</span></div>
          <div><strong>{tage === null ? '…' : `${tage} ${t('start.tage')}`}</strong><span>{t('start.faktenTageSub')}</span></div>
        </div>

        <section className={band.band}>
          <p className={band.name}>{t('bandLernsystem.name')}</p>
          <h2 className={band.titel}>{t('bandLernsystem.titel')}</h2>
          <p className={band.zeile}>{t('bandLernsystem.zeile')}</p>
          <div className={band.bild}>
            <ProduktBild
              name="uebersicht"
              alt="Die Übersicht in Gradefruit: Lernfortschritt pro Thema und der nächste Schritt."
              breite={2560}
              hoehe={1800}
              hinweis={t('start.kostenlosTesten')}
            />
          </div>
          <Link className={band.knopf} href="/lernsystem">{t('bandLernsystem.knopf')}</Link>
        </section>

        <section className={`${band.band} ${band.bandTon}`}>
          <p className={band.name}>{t('bandKurse.name')}</p>
          <h2 className={band.titel}>{t('bandKurse.titel')}</h2>
          <p className={band.zeile}>
            {t('bandKurse.zeile', { gk: PREISE.gk.einmalig, lk: PREISE.lk.einmalig })}
          </p>
          <Link className={band.knopf} href="/kurse">{t('bandKurse.knopf')}</Link>
        </section>

        <section className={band.band}>
          <p className={band.name}>{t('bandUeberUns.name')}</p>
          <h2 className={band.titel}>{t('bandUeberUns.titel')}</h2>
          <p className={band.zeile}>{t('bandUeberUns.zeile')}</p>
          <Link className={band.knopf} href="/ueber-uns">{t('bandUeberUns.knopf')}</Link>
        </section>

        <section className={`${band.band} ${band.bandTon}`}>
          <h2 className={band.titel}>{t('bandSchluss.titel')}</h2>
          <p className={band.zeile}>{t('bandSchluss.zeile')}</p>
          <button className={band.knopf} onClick={isAuthed ? onEnter : onRegister}>
            {isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
          </button>
        </section>
      </main>

      <SeitenFuss />
    </div>
  );
}
