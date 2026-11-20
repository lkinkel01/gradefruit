import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingSeite from '@/components/MarketingSeite';
import band from '@/components/SeitenBand.module.css';
import styles from './ueber-uns.module.css';

export const metadata: Metadata = {
  title: 'Über uns | Gradefruit',
  description: 'Warum es Gradefruit gibt: Ich war in Mathe nie gut und habe es mir im Studium selbst beigebracht.',
};

/**
 * Die Geschichte hinter Gradefruit, in der ersten Person.
 *
 * Vorher stand hier dieselbe Produktbeschreibung wie auf der Startseite. Eine
 * Seite, die „Über uns" heißt und nichts über jemanden sagt, ist der
 * sicherste Weg, austauschbar zu wirken: Genau diesen Text könnte jeder
 * Anbieter haben. Eine Person, die sagt, warum sie etwas gebaut hat, kann
 * niemand kopieren.
 *
 * Alle Angaben stammen von Leon selbst. Nichts hier ist ausgeschmückt — auf
 * einer Seite mit echtem Namen wäre das keine Werbung mehr, sondern falsch.
 */
export default function UeberUns() {
  return (
    <MarketingSeite>
      <section className={`${band.band} ${band.bandZwei}`}>
        <div className={band.spalte}>
          <h1 className={band.titel}>Ich war in Mathe nie gut.</h1>
          <p className={band.zeile}>
            In der Schule habe ich Mathe nicht verstanden. Ich dachte lange,
            das liegt an mir.
          </p>
          <p className={band.zeile}>
            Im Studium kam Mathe zurück, und diesmal musste ich es mir selbst
            beibringen. Dabei ist mir etwas aufgefallen: Vieles war gar nicht
            schwer. Es war nur nie so erklärt worden, dass man es versteht.
          </p>
          <p className={band.zeile}>
            Gradefruit ist das, was ich mir damals gewünscht hätte. Alles an
            einem Ort, für genau eine Prüfung.
          </p>
        </div>

        {/* Rechts die nachprüfbaren Angaben. Wer wissen will, wer dahintersteht,
            findet es hier in vier Zeilen statt in einem Absatz. */}
        <div className={band.beleg}>
          <dl className={styles.karte}>
            <div>
              <dt>Wer</dt>
              <dd>Leon Kinkel</dd>
            </div>
            <div>
              <dt>Studium</dt>
              <dd>Wirtschaftswissenschaften, Johannes Gutenberg-Universität Mainz</dd>
            </div>
            <div>
              <dt>Zurzeit</dt>
              <dd>Master in Management, Mainz</dd>
            </div>
            <div>
              <dt>Gradefruit</dt>
              <dd>Gebaut für das schriftliche Mathe-Abitur in Hessen 2027</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={`${band.band} ${band.bandTon}`}>
        <h2 className={band.titel}>Darum nur eine Prüfung.</h2>
        <p className={band.zeile}>
          Die meisten Lernplattformen decken jedes Fach und jedes Bundesland ab.
          Dann passt überall ein bisschen und nirgends genau.
        </p>
        <ul className={styles.gruende}>
          <li>
            <strong>Ein Lehrplan</strong>
            <span>Alles folgt dem hessischen Kerncurriculum, nicht einem Durchschnitt aus sechzehn Ländern.</span>
          </li>
          <li>
            <strong>Ein Format</strong>
            <span>Die Aufgaben sind im Aufbau der Abiturprüfung gestellt, damit dir am Prüfungstag nichts fremd vorkommt.</span>
          </li>
          <li>
            <strong>Ein Termin</strong>
            <span>Dein Lernstand und die Wiederholungen rechnen auf das Datum zu, an dem du schreibst.</span>
          </li>
        </ul>
        <Link className={band.knopf} href="/kurse">Zu den Kursen</Link>
      </section>
    </MarketingSeite>
  );
}
