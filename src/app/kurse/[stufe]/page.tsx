'use client';

import { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import MarketingSeite, { useAuthDialog } from '@/components/MarketingSeite';
import ZurueckPfeil from '@/components/ZurueckPfeil';
import { PREISE, STEUERHINWEIS } from '@/lib/preise';
import { useKundenstand } from '@/lib/kundenstand';
import { PROBE_ABSCHNITTE, PROBE_AUFGABEN } from '@/lib/probe';
import band from '@/components/SeitenBand.module.css';
import styles from './stufe.module.css';

/**
 * Eine Seite je Kurs.
 *
 * Vorher lagen beide Kurse als zwei Spalten auf einer Seite. Das beantwortet
 * die Frage „welchen nehme ich?", aber nicht die Frage, die danach kommt:
 * „und jetzt?" Hier stehen genau zwei Wege nebeneinander, kaufen oder
 * kostenlos anfangen, und beide sind gleich weit entfernt.
 *
 * Der Weg über diese Seite ist bewusst der einzige von der Startseite aus:
 * Wer dort einen Kurs wählt, landet hier und entscheidet sich, statt auf der
 * Startseite zwischen zwei gleich aussehenden Knöpfen zu raten.
 */
const KURSE = {
  grundkurs: {
    id: 'gk' as const,
    titel: 'Grundkurs',
    zeile: 'Alle Themen des Grundkurses, zugeschnitten auf das hessische Abitur 2027.',
  },
  leistungskurs: {
    id: 'lk' as const,
    titel: 'Leistungskurs',
    zeile: 'Alle Themen des Leistungskurses, zugeschnitten auf das hessische Abitur 2027.',
  },
} as const;

const ENTHALTEN = [
  'Zusammenfassungen zu jedem Thema',
  'Prüfungsnahe Aufgaben mit Lösungsweg Schritt für Schritt',
  'Detaillierte Erklärvideos',
  'KI-Coach rund um die Uhr',
  'Wiederholungssystem und Reel-Modus',
  'Zugang bis zum Ende des Prüfungszeitraums',
];

function Inhalt({ slug }: { slug: string }) {
  const kurs = KURSE[slug as keyof typeof KURSE];
  if (!kurs) notFound();

  const { registrieren } = useAuthDialog();
  const { angemeldet, owned, ownedLk } = useKundenstand();
  const router = useRouter();
  const hat = kurs.id === 'gk' ? owned : ownedLk;

  /* Kostenlos anfangen setzt ein Konto voraus.

     Nicht, um jemanden zu ärgern: Ohne Konto gibt es keinen Lernstand, keine
     Wiederholungen und keinen Coach, weil alles drei an einer Konto-ID
     hängt. Wer ohne Konto losliest, verliert nach einer Stunde alles. Also
     einmal E-Mail und Passwort, sonst nichts. */
  const testen = () => {
    if (angemeldet) router.push('/?view=dashboard');
    else registrieren();
  };

  /* Kaufen setzt ebenfalls ein Konto voraus, und zwar zwingend: Der Zugang
     wird ausschließlich über den Stripe-Webhook freigeschaltet, und der
     braucht eine Konto-ID, der er ihn zuschreiben kann. */
  const kaufen = () => {
    if (angemeldet) router.push('/?view=kurse');
    else registrieren();
  };

  return (
    <section className={band.band}>
      <ZurueckPfeil />

      <h1 className={band.titel}>{kurs.titel}</h1>
      <p className={band.zeile}>{kurs.zeile}</p>

      <div className={styles.wege}>
        {/* Weg 1: anfangen. Steht zuerst, weil es der Weg ohne Risiko ist. */}
        <article className={styles.weg}>
          <p className={styles.wegKopf}>Erst ansehen</p>
          <p className={styles.wegPreis}>Kostenlos</p>
          <p className={styles.wegText}>
            Von jedem Thema die ersten {PROBE_ABSCHNITTE} Abschnitte und{' '}
            {PROBE_AUFGABEN} Aufgaben. Ohne Zahlungsdaten, ohne Frist.
          </p>
          <button className={styles.wegKnopfZweit} onClick={testen}>
            Kostenlos testen
          </button>
          <p className={styles.wegFuss}>
            {angemeldet
              ? 'Du bist angemeldet, es geht direkt los.'
              : 'Einmal E-Mail und Passwort, mehr nicht.'}
          </p>
        </article>

        {/* Weg 2: kaufen. */}
        <article className={styles.wegHaupt}>
          <p className={styles.wegKopf}>Voller Zugang</p>
          <p className={styles.wegPreis}>
            {PREISE[kurs.id].einmalig} <span>einmalig</span>
          </p>
          <ul className={styles.enthalten}>
            {ENTHALTEN.map(e => (
              <li key={e}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {e}
              </li>
            ))}
          </ul>
          {hat ? (
            <button className={styles.wegKnopf} onClick={() => router.push('/?view=dashboard')}>
              Zu deinem Kurs
            </button>
          ) : (
            <button className={styles.wegKnopf} onClick={kaufen}>
              {kurs.titel} freischalten
            </button>
          )}
          <p className={styles.wegFuss}>Keine automatische Verlängerung.</p>
        </article>
      </div>

      <p className={styles.hinweis}>{STEUERHINWEIS} Bezahlung über Stripe.</p>
    </section>
  );
}

export default function KursSeite({ params }: { params: Promise<{ stufe: string }> }) {
  const { stufe } = use(params);
  return (
    <MarketingSeite>
      <Inhalt slug={stufe} />
    </MarketingSeite>
  );
}
