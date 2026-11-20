'use client';

import Link from 'next/link';
import { BrandMark } from './BrandMark';
import SeitenKopf from './SeitenKopf';
import SeitenFuss from './SeitenFuss';
import ProduktBild, { BILD_VERSION } from './ProduktBild';
import ProduktGalerie from './ProduktGalerie';
import KursWahl from './KursWahl';
import Gruende from './Gruende';
import { FRAGEN } from '@/lib/marketing';
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

            <h1 className={styles.heroTitel}>
              {t('start.titelAnfang')}{' '}
              <span className={styles.heroAkzent}>{t('start.titelAkzent')}</span>
            </h1>

            {/* Drei Stichpunkte statt eines erklärenden Satzes.

                Darüber stand eine Einordnungszeile und darunter ein Satz, der
                dasselbe noch einmal sagte. Zweimal dieselbe Auskunft liest
                niemand zweimal. Drei kurze Punkte beantworten in einem Blick,
                ob jemand hier richtig ist: Bundesland, Jahrgang, Kursstufe. */}
            <ul className={styles.heroFakten}>
              {['fakt1', 'fakt2', 'fakt3'].map(k => (
                <li key={k}>{t(`start.${k}` as Parameters<typeof t>[0])}</li>
              ))}
            </ul>

          </div>

          {/* Rechts steht die Kurswahl, nicht mehr eine Produktaufnahme.

              Das Bild zeigte das Dashboard mit „Guten Tag, Alex." Es war der
              größte Gegenstand auf dem ersten Bildschirm und zeigte
              ausgerechnet einen fremden Namen und einen Lernstand, der
              niemandem gehört. Was dort hingehört, ist die Entscheidung:
              Welchen Kurs schreibst du? Das Produkt sieht man eine
              Bildschirmhöhe weiter unten, in der Galerie, und dort
              beantwortet es auch eine Frage. */}
          <div className={styles.heroWahl}>
            <KursWahl />
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

        {/* Warum es so gebaut ist. Die Haken neben den Preisen sagen, WAS
            enthalten ist; hier steht der Grund dahinter. */}
        <section className={band.band}>
          <h2 className={band.titel}>{t('bandGruende.titel')}</h2>
          <p className={band.zeile}>{t('bandGruende.zeile')}</p>
          <Gruende />
        </section>

        {/* Das einzige Foto der Seite, und es steht neben dem Text statt über
            die volle Breite zu laufen. Vollbreit blieb von der Person darauf
            nur ein Streifen übrig. */}
        <section className={`${band.band} ${band.bandTon} ${band.bandZwei}`}>
          {/* Dieses Band hieß „Für dein Bundesland gebaut" und zählte dieselben
              drei Gründe auf, die im Abschnitt darüber schon stehen. Zweimal
              dasselbe auf einer Seite liest niemand zweimal, es fällt nur auf.

              Jetzt steht hier die andere Hälfte: nicht was das Produkt kann,
              sondern wen es meint. Wer in Mathe hängt, hält sich meistens für
              zu dumm dafür, und genau das stimmt fast nie. Der Knopf führt in
              die Geschichte dahinter. */}
          <div className={band.spalte}>
            <h2 className={band.titel}>{t('bandMut.titel')}</h2>
            <p className={band.zeile}>{t('bandMut.zeile')}</p>
            <Link className={band.knopf} href="/ueber-uns">{t('bandMut.knopf')}</Link>
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

        {/* Die häufigsten Fragen direkt auf der Startseite. Sie standen nur
            auf einer eigenen Seite, die man erst ansteuern musste — und wer
            eine offene Frage hat, klickt selten weiter, sondern geht weg. */}
        <section className={band.band}>
          <h2 className={band.titel}>{t('bandFragen.titel')}</h2>
          <div className={styles.fragen}>
            {FRAGEN.slice(0, 6).map(f => (
              <details key={f.frage} className={styles.frage}>
                <summary>
                  <span>{f.frage}</span>
                  <span className={styles.plus} aria-hidden="true" />
                </summary>
                <p>{f.antwort}</p>
              </details>
            ))}
          </div>
          <Link className={band.knopf} href="/fragen">{t('bandFragen.knopf')}</Link>
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
