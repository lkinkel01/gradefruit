import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingSeite from '@/components/MarketingSeite';
import ZurueckPfeil from '@/components/ZurueckPfeil';
import band from '@/components/SeitenBand.module.css';
import styles from './ueber-uns.module.css';

export const metadata: Metadata = {
  title: 'Über uns | Gradefruit',
  description: 'In der Schule schlecht in Mathe, im Studium gut. Warum das nicht an Begabung lag und warum es Gradefruit gibt.',
};

/**
 * Die Geschichte hinter Gradefruit.
 *
 * Zwei Fassungen lagen davor daneben, beide aus demselben Grund:
 *
 * 1. Zuerst stand hier dieselbe Produktbeschreibung wie auf der Startseite.
 *    Eine Seite, die „Über uns" heißt und nichts über jemanden sagt, ist der
 *    sicherste Weg, austauschbar zu wirken.
 * 2. Dann stand hier „Ich war in Mathe nie gut." mit einer Karte daneben, die
 *    Studium und Abschluss auflistete. Das war ein Lebenslauf mit einem
 *    schlechten Aufmacher: Wer das liest, hat keinen Grund, ausgerechnet von
 *    dieser Person einen Mathekurs zu kaufen.
 *
 * Worauf es ankommt, ist die Entwicklung, nicht der Anfangszustand. Schlecht
 * in der Schule, gut im mathelastigen Studium, und der Unterschied lag nicht
 * an Begabung, sondern daran, wie es erklärt wurde. Genau das ist das
 * Versprechen des Produkts, und hier steht, woher es kommt.
 *
 * Alle Angaben stammen von Leon selbst. Nichts ist ausgeschmückt: Auf einer
 * Seite mit echtem Namen wäre das keine Werbung, sondern falsch.
 */
export default function UeberUns() {
  return (
    <MarketingSeite>
      <section className={band.band}>
        <ZurueckPfeil />

        <h1 className={band.titel}>
          In der Schule schlecht in Mathe.{' '}
          <span className={band.akzent}>Im Studium gut.</span>
        </h1>

        <div className={styles.text}>
          <p>
            Ich bin Leon. In der Schule war Mathe mein schlechtestes Fach. Ich
            hielt mich für jemanden, der das eben nicht kann.
          </p>
          <p>
            Dann habe ich Wirtschaftswissenschaften studiert, in Mainz an der
            Johannes Gutenberg-Universität. Dort ist Mathe kein Nebenfach,
            sondern zieht sich durch alles. Ich musste es mir selbst
            beibringen, und es lief besser als alles, was ich in der Schule
            geschafft hatte. Meine Mathe-Module habe ich gut abgeschlossen.
          </p>
          <p>
            Nicht, weil ich plötzlich begabt war. Sondern weil ich zum ersten
            Mal in meinem eigenen Tempo gelernt habe: nachlesen, wo etwas
            fehlte, und so lange an einer Sache bleiben, bis sie saß. Vieles,
            woran ich in der Schule gescheitert bin, war nicht schwer. Es war
            nur nie so erklärt worden, dass man es versteht.
          </p>
          <p>
            Heute mache ich meinen Master in Management, ebenfalls in Mainz.
            Gradefruit ist das, was ich mir damals gewünscht hätte.
          </p>
        </div>
      </section>

      <section className={`${band.band} ${band.bandTon}`}>
        <h2 className={band.titel}>Du musst nicht verzweifeln.</h2>
        <p className={band.zeile}>
          Die meisten, die in Mathe hängen, sind nicht zu dumm dafür. Ihnen
          fehlt eine Grundlage von vor zwei Jahren, und niemand merkt es.
        </p>
        <ul className={styles.gruende}>
          <li>
            <strong>Du bestimmst das Tempo</strong>
            <span>Noch mal lesen, noch mal ansehen, noch mal rechnen. So oft du willst.</span>
          </li>
          <li>
            <strong>Alles an einem Ort</strong>
            <span>Zusammenfassung, Aufgaben, Lösungswege und Videos. Kein Suchen zwischen Heft, Buch und Video.</span>
          </li>
          <li>
            <strong>Fragen, ohne sich zu melden</strong>
            <span>Der Coach kennt die Stelle, bei der du hängst, und wird nie ungeduldig.</span>
          </li>
        </ul>
        <Link className={band.knopf} href="/kurse">Zu den Kursen</Link>
      </section>
    </MarketingSeite>
  );
}
