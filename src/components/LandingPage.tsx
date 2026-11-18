'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandMark } from './BrandMark';
import SeitenKopf from './SeitenKopf';
import SeitenFuss from './SeitenFuss';
import ProduktBild from './ProduktBild';
import Bildband from './Bildband';
import { daysUntilExam } from '@/lib/exam';
import { useSprache } from '@/lib/sprache';
import { useKundenstand } from '@/lib/kundenstand';
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
  const { stand } = useKundenstand();

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
          <div className={styles.heroMitte}>
            <BrandMark className={styles.heroMarke} size={64} />

            {/* Die Startseite sagt jetzt in einem Satz, für wen das hier ist.
                Vorher stand nur der Markenname groß da, und für wen es
                gemacht ist, erfuhr man erst auf den Unterseiten. */}
            <h1 className={styles.heroTitel}>
              {t('start.titelAnfang')}{' '}
              <span className={styles.heroAkzent}>{t('start.titelAkzent')}</span>
            </h1>

            <p className={styles.heroUnterzeile}>{t('start.unterzeile')}</p>

            {/* Die vier Verkaufsargumente als kurze Punkte statt als Fließtext:
                So sieht man beim Überfliegen, was man bekommt. Jede Angabe ist
                nachgezählt — 137 Aufgaben, 14 Erklärvideos. */}
            <ul className={styles.nutzen}>
              {['nutzen1', 'nutzen2', 'nutzen3', 'nutzen4'].map(schluessel => (
                <li key={schluessel}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t(`start.${schluessel}` as Parameters<typeof t>[0])}
                </li>
              ))}
            </ul>

            <div className={styles.heroKnoepfe}>
              <button className={styles.heroKnopf} onClick={onEnter}>
                {isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
              </button>
              <Link className={styles.heroKnopf} href="/kurse">{t('start.kurse')}</Link>
            </div>
          </div>

        </header>

        <div className={styles.fakten} id="teaser">
          <div><strong>{t('start.faktenPruefung')}</strong><span>{t('start.faktenPruefungSub')}</span></div>
          <div><strong>{t('start.faktenKurse')}</strong><span>{t('start.faktenKurseSub')}</span></div>
          <div><strong>{tage === null ? '…' : `${tage} ${t('start.tage')}`}</strong><span>{t('start.faktenTageSub')}</span></div>
        </div>

        <section className={band.band}>
          <h2 className={band.titel}>{t('bandLernsystem.titel')}</h2>
          <p className={band.zeile}>{t('bandLernsystem.zeile')}</p>
          <div className={band.bild}>
            <ProduktBild
              name="uebersicht"
              alt="Die Übersicht in Gradefruit: Lernfortschritt pro Thema und der nächste Schritt."
              breite={2560}
              hoehe={1800}
              hinweis={isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
              onKlick={onEnter}
            />
          </div>
          <Link className={band.knopf} href="/lernsystem">{t('bandLernsystem.knopf')}</Link>
        </section>

        <Bildband
          datei="/bild-laptop.webp"
          alt="Ein aufgeklappter Laptop neben einem College-Block mit zwei Stiften."
        />

        <section className={`${band.band} ${band.bandTon}`}>
          {/* Preise interessieren nur, wer sie noch braucht. Wer beide Kurse
              hat, bekommt stattdessen die Bestätigung und den Weg hinein. */}
          <h2 className={band.titel}>
            {stand === 'alleKurse'
              ? t('bandKurse.titelAlle')
              : stand === 'einKurs'
                ? t('bandKurse.titelEinKurs')
                : t('bandKurse.titel')}
          </h2>
          <p className={band.zeile}>
            {stand === 'alleKurse'
              ? t('bandKurse.zeileAlle')
              : stand === 'einKurs'
                ? t('bandKurse.zeileEinKurs')
                : t('bandKurse.zeile', { gk: PREISE.gk.einmalig, lk: PREISE.lk.einmalig })}
          </p>
          {stand === 'alleKurse' ? (
            <button className={band.knopf} onClick={onEnter}>{t('bandKurse.knopfKurs')}</button>
          ) : (
            <Link className={band.knopf} href="/kurse">{t('bandKurse.knopf')}</Link>
          )}
        </section>

        <section className={band.band}>
          <h2 className={band.titel}>{t('bandUeberUns.titel')}</h2>
          <p className={band.zeile}>{t('bandUeberUns.zeile')}</p>
          <Link className={band.knopf} href="/ueber-uns">{t('bandUeberUns.knopf')}</Link>
        </section>

        <Bildband
          datei="/bild-karo.webp"
          alt="Eine Hand schreibt mit einem Stift auf kariertem Papier."
        />

        <section className={`${band.band} ${band.bandTon}`}>
          <h2 className={band.titel}>
            {isAuthed ? t('bandSchlussZustand.titelAngemeldet') : t('bandSchluss.titel')}
          </h2>
          <p className={band.zeile}>
            {stand === 'gast'
              ? t('bandSchluss.zeile')
              : stand === 'ohneKurs'
                ? t('bandSchlussZustand.zeileOhneKurs')
                : t('bandSchlussZustand.zeileMitKurs')}
          </p>
          <button className={band.knopf} onClick={isAuthed ? onEnter : onRegister}>
            {isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
          </button>
        </section>
      </main>

      <SeitenFuss />
    </div>
  );
}
