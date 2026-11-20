'use client';

import Link from 'next/link';
import { BrandMark } from './BrandMark';
import SeitenKopf from './SeitenKopf';
import SeitenFuss from './SeitenFuss';
import ProduktBild, { BILD_VERSION } from './ProduktBild';
import ProduktGalerie from './ProduktGalerie';
import LernSchritte from './LernSchritte';
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
  const { t } = useSprache();
  const { stand } = useKundenstand();

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
          <div className={styles.heroRaster}>
          <div className={styles.heroMitte}>
            <BrandMark className={styles.heroMarke} size={64} />

            {/* Die Startseite sagt jetzt in einem Satz, für wen das hier ist.
                Vorher stand nur der Markenname groß da, und für wen es
                gemacht ist, erfuhr man erst auf den Unterseiten. */}
            <h1 className={styles.heroTitel}>
              {t('start.titelAnfang')}{' '}
              <span className={styles.heroAkzent}>{t('start.titelAkzent')}</span>
            </h1>

            <p className={styles.heroZusatz}>{t('start.titelZusatz')}</p>


            {/* Hier stand eine Liste mit fünf Punkten. Sie ist nach unten zu
                den Preisen gewandert, wo sie hingehört: Wer gerade die Zahl
                liest, will wissen, was dafür drin ist. Oben kostete sie nur
                Platz und schob die beiden Knöpfe nach unten — auf dem Handy
                aus dem ersten Bildschirm heraus. */}
            <div className={styles.heroKnoepfe}>
              <button className={styles.heroKnopf} onClick={onEnter}>
                {isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
              </button>
              <Link className={styles.heroKnopf} href="/kurse">{t('start.kurse')}</Link>
            </div>
          </div>

          {/* Rechts im Startbereich steht das Produkt selbst. Kein Symbolfoto
              und keine Grafik: Die Aufnahme zeigt, was man nach dem Kauf
              wirklich vor sich hat. Das ist der stärkste Beleg, den die Seite
              hat, und er gehört nach ganz oben. */}
          <div className={styles.heroBild}>
            <ProduktBild
              name="uebersicht"
              alt="Die Übersicht in Gradefruit: Lernfortschritt pro Thema und der nächste Schritt."
              breite={2560}
              hoehe={1800}
              hinweis={isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
              onKlick={onEnter}
            />
          </div>
          </div>
        </header>

        {/* Der Weg durch ein Thema über die volle Breite — fünf Schritte von
            links nach rechts. Als Satz musste man die Reihenfolge lesen und
            sich merken; nebeneinander sieht man sie. Darunter die Aufnahme des
            Lösungswegs, weil das der Schritt ist, den man sich am schwersten
            vorstellt. */}
        <section className={`${band.band} ${band.bandTon}`}>
          <h2 className={band.titel}>{t('bandLernsystem.titel')}</h2>
          <p className={band.zeile}>{t('bandLernsystem.zeile')}</p>
          <LernSchritte />
          <div className={band.bild}>
            <ProduktGalerie
              version={BILD_VERSION}
              breite={2560}
              hoehe={1800}
              bilder={[
                { name: 'zusammenfassung', titel: t('galerie.zusammenfassung'), alt: 'Eine Zusammenfassung in Gradefruit, nach Abschnitten aufgeklappt.' },
                { name: 'loesungsweg', titel: t('galerie.loesungsweg'), alt: 'Ein Lösungsweg in Gradefruit, Schritt für Schritt aufgeklappt.' },
                { name: 'videos', titel: t('galerie.videos'), alt: 'Die Erklärvideos in Gradefruit.' },
                { name: 'wiederholen', titel: t('galerie.wiederholen'), alt: 'Die Wiederholen-Ansicht in Gradefruit.' },
              ]}
            />
          </div>
          <Link className={band.knopf} href="/lernsystem">{t('bandLernsystem.knopf')}</Link>
        </section>

        {/* Das einzige Foto der Seite, und es steht neben dem Text statt über
            die volle Breite zu laufen. Vollbreit blieb von der Person darauf
            nur ein Streifen übrig. */}
        <section className={`${band.band} ${band.bandZwei}`}>
          <div className={band.spalte}>
            <h2 className={band.titel}>
              {t('bandUeberUns.titelAnfang')}{' '}
              <span className={band.akzent}>{t('bandUeberUns.titelAkzent')}</span>{' '}
              {t('bandUeberUns.titelEnde')}
            </h2>
            <p className={band.zeile}>{t('bandUeberUns.zeile')}</p>
            {/* Stichpunkte statt Fließtext. Derselbe Inhalt stand vorher als
                vierzeiliger Absatz da und wurde überflogen statt gelesen. */}
            <ul className={styles.punkte}>
              {['punkt1', 'punkt2', 'punkt3'].map(k => (
                <li key={k}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t(`bandUeberUns.${k}` as Parameters<typeof t>[0])}
                </li>
              ))}
            </ul>
            <Link className={band.knopf} href="/ueber-uns">{t('bandUeberUns.knopf')}</Link>
          </div>
          <div className={band.beleg}>
            <img
              className={band.foto}
              src="/bild-lernen.webp"
              alt="Eine Schülerin lernt an ihrem Laptop."
              width={2400}
              height={1350}
              loading="lazy"
              draggable={false}
            />
          </div>
        </section>

        {/* Die Preise stehen rechts als zwei Karten, nicht in einem Satz.
            Wer scrollt, soll beide Zahlen sehen, ohne sie aus einer Zeile
            herauszulesen. Wer schon alles hat, braucht keine Preise mehr —
            dann steht dort der Weg hinein. */}
        <section className={`${band.band} ${band.bandZwei}`}>
          <div className={band.spalte}>
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
                  : t('bandKurse.zeileKurz')}
            </p>
            {/* Was im Kurs steckt, steht direkt neben dem Preis. Oben im
                Startbereich war dieselbe Liste nur Beiwerk; hier beantwortet
                sie die Frage, die man sich beim Blick auf die Zahl stellt. */}
            <ul className={styles.punkte}>
              {['nutzen1', 'nutzen2', 'nutzen3', 'nutzen4', 'nutzen5'].map(k => (
                <li key={k}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t(`start.${k}` as Parameters<typeof t>[0])}
                </li>
              ))}
            </ul>
            {stand === 'alleKurse' ? (
              <button className={band.knopf} onClick={onEnter}>{t('bandKurse.knopfKurs')}</button>
            ) : (
              <Link className={band.knopf} href="/kurse">{t('bandKurse.knopf')}</Link>
            )}
          </div>
          <div className={band.beleg}>
            {stand === 'alleKurse' ? (
              <ProduktBild
                name="themen"
                alt="Die Themenübersicht in Gradefruit."
                breite={2560}
                hoehe={1800}
                hinweis={t('bandKurse.knopfKurs')}
                onKlick={onEnter}
              />
            ) : (
              <div className={styles.preiskarten}>
                <article className={styles.preiskarte}>
                  <h3>{t('bandKurse.gk')}</h3>
                  <strong>{PREISE.gk.einmalig}</strong>
                  <span>{t('bandKurse.einmalig')}</span>
                </article>
                <article className={styles.preiskarte}>
                  <h3>{t('bandKurse.lk')}</h3>
                  <strong>{PREISE.lk.einmalig}</strong>
                  <span>{t('bandKurse.einmalig')}</span>
                </article>
              </div>
            )}
          </div>
        </section>

        {/* Der Abschluss nimmt die volle Spaltenbreite ein: Text links, Knopf
            rechts. Als schmaler Textblock mit leerer rechter Hälfte sah das
            Ende der Seite aus, als wäre sie abgeschnitten. */}
        <section className={`${band.band} ${band.bandTon}`}>
          <div className={styles.schluss}>
            <div>
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
            </div>
            <button className={styles.schlussKnopf} onClick={isAuthed ? onEnter : onRegister}>
              {isAuthed ? t('kopf.weiterlernen') : t('start.kostenlosTesten')}
            </button>
          </div>
        </section>
      </main>

      <SeitenFuss />
    </div>
  );
}
