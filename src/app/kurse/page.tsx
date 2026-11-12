'use client';

import MarketingSeite, { useAuthDialog } from '@/components/MarketingSeite';
import { PREISE, STEUERHINWEIS } from '@/lib/preise';
import { useKundenstand } from '@/lib/kundenstand';
import { useRouter } from 'next/navigation';
import band from '@/components/SeitenBand.module.css';
import styles from './kurse.module.css';

const KURSE = [
  {
    id: 'gk' as const,
    titel: 'Grundkurs',
    punkte: ['Alle Themen des Grundkurses', 'Aufgaben mit Lösungsweg', 'Coach und Erklärvideos'],
  },
  {
    id: 'lk' as const,
    titel: 'Leistungskurs',
    punkte: ['Voller LK-Umfang', 'e- und ln-Funktionen, Ebenen, Hypothesentests', 'Coach und Erklärvideos'],
  },
];

function Inhalt() {
  const { anmelden, registrieren } = useAuthDialog();
  const { stand, angemeldet, owned, ownedLk } = useKundenstand();
  const router = useRouter();
  const hat = { gk: owned, lk: ownedLk };

  return (
    <>
      <section className={band.band}>
        <p className={band.name}>Kurse</p>
        <h1 className={band.titel}>
          {stand === 'alleKurse' ? 'Alles freigeschaltet.' : 'Einmal zahlen, kein Abo.'}
        </h1>
        <p className={band.zeile}>
          {stand === 'alleKurse'
            ? 'Grundkurs und Leistungskurs liegen bereit. Keine weiteren Kosten.'
            : stand === 'einKurs'
              ? 'Einen Kurs hast du. Der zweite ist einzeln dazubuchbar.'
              : 'Einmal zahlen, kein Abo. Analysis kannst du vorher kostenlos ausprobieren.'}
        </p>

        <div className={styles.karten}>
          {KURSE.map(kurs => (
            <article key={kurs.id} className={styles.karte}>
              <h2>{kurs.titel}</h2>
              <p className={styles.preis}>
                <strong>{PREISE[kurs.id].einmalig}</strong>
                <span>einmalig</span>
              </p>
              <ul>
                {kurs.punkte.map(p => <li key={p}>{p}</li>)}
              </ul>
              {/* Kaufen setzt ein Konto voraus; der Zugang wird ausschließlich
                  über den Stripe-Webhook freigeschaltet. Deshalb führt der Weg
                  hier erst zum Konto und nicht direkt zur Kasse.
                  Wer den Kurs schon hat, bekommt keinen Kaufknopf mehr,
                  sondern den Weg hinein. */}
              {hat[kurs.id] ? (
                <button className={band.knopf} onClick={() => router.push('/?view=dashboard')}>
                  Zu deinem Kurs
                </button>
              ) : (
                <button
                  className={band.knopf}
                  onClick={() => (angemeldet ? router.push('/?view=kurse') : registrieren())}
                >
                  {angemeldet ? 'Freischalten' : 'Kostenlos starten'}
                </button>
              )}
            </article>
          ))}
        </div>

        <p className={styles.hinweis}>
          {STEUERHINWEIS} Bezahlung über Stripe. Der Zugang gilt bis zum Ende des
          Prüfungszeitraums.
        </p>
        {!angemeldet && (
          <p className={styles.hinweis}>
            Schon ein Konto? <button className={styles.textLink} onClick={anmelden}>Anmelden</button>
          </p>
        )}
      </section>
    </>
  );
}

export default function Kurse() {
  return (
    <MarketingSeite>
      <Inhalt />
    </MarketingSeite>
  );
}
