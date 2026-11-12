'use client';

import MarketingSeite, { useAuthDialog } from '@/components/MarketingSeite';
import { PREISE, STEUERHINWEIS } from '@/lib/preise';
import { useAuth } from '@/lib/AuthContext';
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
  const { user } = useAuth();
  const router = useRouter();

  return (
    <>
      <section className={band.band}>
        <p className={band.name}>Kurse</p>
        <h1 className={band.titel}>Ein Zugang. Bis zur Prüfung.</h1>
        <p className={band.zeile}>
          Einmal zahlen, kein Abo. Analysis kannst du vorher kostenlos
          ausprobieren.
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
              {/* Kaufen setzt ein Konto voraus — der Zugang wird ausschließlich
                  über den Stripe-Webhook freigeschaltet. Deshalb führt der Weg
                  hier bewusst erst zum Konto und nicht direkt zur Kasse. */}
              <button
                className={band.knopf}
                onClick={() => (user ? router.push('/?view=kurse') : registrieren())}
              >
                {user ? 'Zum Kurs' : 'Kostenlos starten'}
              </button>
            </article>
          ))}
        </div>

        <p className={styles.hinweis}>
          {STEUERHINWEIS} Bezahlung über Stripe. Der Zugang gilt bis zum Ende des
          Prüfungszeitraums.
        </p>
        {!user && (
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
