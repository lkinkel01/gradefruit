'use client';

import { PREISE, STEUERHINWEIS } from '@/lib/preise';
import { useImAppRahmen } from '@/lib/nativeApp';
import { CheckIcon } from './UiIcons';
import styles from './KurseView.module.css';

/**
 * Alle angebotenen Kurse auf einer Seite.
 *
 * Vorher standen die nicht gekauften Kurse als graue „inaktiv"-Zeilen in der
 * Seitenleiste — eine Preisliste an einer Stelle, an der man sich eigentlich
 * zurechtfinden will. Wer einen Kurs hat, sieht dort jetzt nur seinen eigenen;
 * alles Weitere liegt hier.
 *
 * In der App gibt es bewusst keinen Kaufknopf: Apple verlangt für Käufe in der
 * App den eigenen In-App-Kauf. Deshalb steht dort nur, was es gibt.
 */
export default function KurseView({
  owned,
  ownedLk,
  onOpenCheckout,
}: {
  owned: boolean;
  ownedLk: boolean;
  onOpenCheckout: (course: 'gk' | 'lk') => void;
}) {
  const imApp = useImAppRahmen();

  const kurse = [
    {
      id: 'gk' as const,
      titel: 'Grundkurs',
      beschreibung:
        'Alle Themen des Grundkurses: Analysis, lineare Algebra und Stochastik — mit prüfungsnahen Aufgaben, Schritt-für-Schritt-Lösungen und Erklärvideos.',
      hat: owned,
    },
    {
      id: 'lk' as const,
      titel: 'Leistungskurs',
      beschreibung:
        'Der volle Umfang des Leistungskurses: e- und ln-Funktionen, Integrationstechniken, Ebenen und Abstände, Hypothesentests — jeweils auf LK-Niveau.',
      hat: ownedLk,
    },
  ];

  return (
    <div className={styles.seite}>
      <header className={styles.kopf}>
        <h1>Kurse</h1>
        <p>
          Beide Kurse bereiten auf das schriftliche Mathe-Abitur in Hessen 2027 vor.
          Analysis kannst du in beiden kostenlos ausprobieren.
        </p>
      </header>

      <ul className={styles.liste}>
        {kurse.map(kurs => (
          <li key={kurs.id} className={styles.karte}>
            <h2 className={styles.titel}>{kurs.titel}</h2>
            <div className={styles.preis}>
              <strong>{PREISE[kurs.id].einmalig}</strong>
              <span>einmalig</span>
            </div>
            <p className={styles.text}>{kurs.beschreibung}</p>

            {kurs.hat ? (
              <p className={styles.aktiv}>
                <CheckIcon size={13} />
                Dein Zugang ist aktiv
              </p>
            ) : imApp ? (
              <p className={styles.appHinweis}>Auf gradefruit.de freischaltbar.</p>
            ) : (
              <button className="btn primary" onClick={() => onOpenCheckout(kurs.id)}>
                {kurs.titel} freischalten
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className={styles.fussnote}>
        Einmalzahlung, keine Folgekosten, kein Abo. Der Zugang gilt bis zum Ende des
        Prüfungszeitraums. {STEUERHINWEIS}
      </p>
    </div>
  );
}
