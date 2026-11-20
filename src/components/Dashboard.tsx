'use client';
import { useState, useEffect } from 'react';
import { View, TOPICS, LernStatus } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { EXAM_DATE, EXAM_DATE_IS_PRELIMINARY, daysUntilExam } from '@/lib/exam';
import { GrapefruitProgress } from './Logo';
import { ArrowRightIcon, CalendarIcon } from './UiIcons';
import { useImAppRahmen } from '@/lib/nativeApp';
import styles from './Dashboard.module.css';

interface Props {
  onNavigate: (v: View) => void;
  /** Öffnet die Registrierung — nur für Gäste gebraucht. */
  onRegistrieren: () => void;
  /** Kursstufe, die gerade gelernt wird — alle Zähler hängen daran. */
  level: 'gk' | 'lk';
}

export default function Dashboard({ onNavigate, onRegistrieren, level }: Props) {
  const { user, anzeigeName } = useAuth();
  // In der App trägt der Bildschirm nur diese eine Seite — dort darf der
  // Countdown die Fläche nehmen, die ihm laut DESIGN.md zusteht (Zahl als
  // Motiv, Haarlinien statt Karten). Im Browser bleibt alles wie bisher.
  const imApp = useImAppRahmen();
  const { totalDone, totalLessons, topicDone, topicTotal, statusCounts } = useProgress();
  const gesamt = totalLessons(level);
  const pct = gesamt > 0 ? Math.round((totalDone(level) / gesamt) * 100) : 0;
  const zaehler = statusCounts(level);

  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    // setTimeout statt requestAnimationFrame: Ein Bild wird nur gezeichnet, wenn
    // der Tab sichtbar ist. Lag er im Hintergrund, blieb hier dauerhaft „…"
    // stehen — ausgerechnet bei der Zahl, für die man die Übersicht öffnet.
    const frame = window.setTimeout(() => setDaysLeft(daysUntilExam()), 0);
    return () => window.clearTimeout(frame);
  }, []);

  /* Nur der erste Bestandteil: „Leon Kinkel" wird zu „Leon". Aus einer
     E-Mail einen Vornamen zu raten trifft oft daneben, deshalb lieber gar
     nichts.

     Ohne Konto stand hier ein Platzhaltername. Das war für die Werbebilder
     gedacht, traf aber jeden, der „Kostenlos testen" drückt: Man wird mit
     einem fremden Namen begrüßt, den man nie angegeben hat. Das wirkt nicht
     einladend, sondern als hätte sich jemand vertan. Gäste bekommen deshalb
     eine Begrüßung ohne Namen. Die Werbebilder sind davon nicht betroffen,
     sie entstehen mit einem angemeldeten Konto. */
  const anrede = anzeigeName?.trim().split(/\s+/)[0];

  const openReview = (status: Exclude<LernStatus, 'none'>) => {
    try { localStorage.setItem('gf-review-status', status); } catch { /* Speicher gesperrt */ }
    onNavigate('review');
  };

  /* Das Thema, an dem es weitergeht: das erste, das noch nicht fertig ist.
     Für ein frisches Konto ist das Analysis — und Analysis ist das Thema,
     dessen Anfang ohne Kauf offensteht. Der Einstieg zeigt also auf etwas,
     das wirklich offen ist. */
  const naechstes = TOPICS.find(t => {
    const ges = topicTotal(t.id, level);
    return ges === 0 || topicDone(t.id, level) < ges;
  }) ?? TOPICS[0];
  const hatFortschritt = zaehler.verstanden + zaehler.wiederholen + zaehler.unklar > 0;

  const statusTiles: { status: Exclude<LernStatus, 'none'>; label: string; num: number }[] = [
    { status: 'verstanden', label: 'Verstanden', num: zaehler.verstanden },
    { status: 'wiederholen', label: 'Wiederholen', num: zaehler.wiederholen },
    { status: 'unklar', label: 'Nicht verstanden', num: zaehler.unklar },
  ];

  return (
    <div className={`${styles.page} ${imApp ? styles.app : ''} gf-stagger`}>
      {/* Kopf: nur die Begrüßung. Die Kursstufe wird in der Navigation
          umgeschaltet, nicht mehr hier. */}
      <div className={styles.head}>
        <h1 className={styles.greet}>
          {user ? `Guten Tag${anrede ? `, ${anrede}` : ''}.` : 'Schau dich um.'}
        </h1>
      </div>

      {/* Ohne Konto lässt sich nichts speichern. Das steht hier, bevor jemand
          eine Stunde lang Aufgaben abhakt und es danach weg ist. */}
      {!user && (
        <div className={styles.konto}>
          <div>
            <p className={styles.kontoTitel}>Du siehst den kostenlosen Anfang.</p>
            <p className={styles.kontoText}>
              Lernstand, Wiederholungen und der Coach brauchen ein Konto. Das ist
              kostenlos und dauert eine Minute.
            </p>
          </div>
          <button type="button" className={styles.kontoKnopf} onClick={onRegistrieren}>
            Konto erstellen
          </button>
        </div>
      )}

      {/* Der nächste Schritt, bevor irgendeine Zahl kommt.

          Vorher stand hier als Erstes der Countdown und darunter drei Nullen.
          Wer sich neu anmeldet, sah also zuerst, wie wenig er geschafft hat
          und wie wenig Zeit bleibt — und nirgends, wo man anfängt. Jetzt
          steht oben genau ein Satz und ein Knopf. */}
      <button type="button" className={styles.weiter} onClick={() => onNavigate(naechstes.id)}>
        <span className={styles.weiterText}>
          <span className={styles.weiterLabel}>
            {hatFortschritt ? 'Weiter geht es mit' : 'Fang an mit'}
          </span>
          <span className={styles.weiterThema}>{naechstes.label}</span>
        </span>
        <span className={styles.weiterGo} aria-hidden="true"><ArrowRightIcon size={18} /></span>
      </button>

      {/* Fortschritt und Lernstand — eine zusammengehörige, klickbare Einheit.
          Der Kopf öffnet die Wiederholen-Seite (die bestehende Detailansicht
          des Lernstands); die drei Stufen springen mit vorgewähltem Filter. */}
      <section className={styles.statusSec} aria-label="Fortschritt und Lernstand">
        {/* Eine Kachel, zwei Hälften: links der Countdown, rechts der Lernstand. */}
        <div className={styles.overviewCard}>
          <div className={styles.cdCol}>
            <span className={styles.cdIcon} aria-hidden="true"><CalendarIcon size={18} /></span>
            <span className={styles.cdDays}>{daysLeft ?? '…'}</span>
            <span className={styles.cdLabel}>Tage bis zur Prüfung</span>
            <span className={styles.cdDate}>
              <CalendarIcon size={14} />
              {EXAM_DATE.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
              {EXAM_DATE_IS_PRELIMINARY && ' · voraussichtlich'}
            </span>
          </div>
          <button type="button" className={styles.progressCol} onClick={() => onNavigate('review')}>
            <GrapefruitProgress pct={pct} size={72} />
            <span className={styles.progressBody}>
              <span className={styles.progressTitle}>Fortschritt und Lernstand</span>
              <span className={styles.progressPct}>
                <span className={styles.pctNum}>{pct}</span>
                <span className={styles.pctUnit}>%</span>
              </span>
            </span>
            <span className={styles.progressGo} aria-hidden="true"><ArrowRightIcon size={16} /></span>
          </button>
        </div>
        {/* Drei Nullen nebeneinander sagen nichts und wirken wie ein Vorwurf.
            Die Zeile erscheint erst, wenn der erste Lernstand gesetzt ist. */}
        {hatFortschritt && (
        <div className={styles.statRow}>
          {statusTiles.map(t => (
            <button key={t.status} type="button" className={styles.stat} onClick={() => openReview(t.status)}>
              <span className={styles.statNum}>{t.num}</span>
              <span className={styles.statLabel}>{t.label}</span>
              <span className={styles.statGo}><ArrowRightIcon size={14} /></span>
            </button>
          ))}
        </div>
        )}
      </section>

      {/* Themen — editoriale Liste */}
      <p className={`gf-meta ${styles.secLabel}`}>Themen</p>
      <div className={styles.list}>
        {TOPICS.map(t => {
          const themaGesamt = topicTotal(t.id, level);
          const tp = themaGesamt > 0 ? Math.round((topicDone(t.id, level) / themaGesamt) * 100) : 0;
          return (
            <button key={t.id} className={styles.topicRow} onClick={() => onNavigate(t.id)}>
              <GrapefruitProgress pct={tp} size={40} />
              <span className={styles.topicName}>{t.label}</span>
              {/* Prozent statt „x von y": Ein Thema besteht nicht nur aus
                  Übungsaufgaben, sondern auch aus Zusammenfassung und Videos.
                  Eine Zahl, die nur die Aufgaben zählt, behauptet mehr, als sie
                  weiß — der Anteil sagt dasselbe, ohne die Behauptung. */}
              <span className={styles.topicCount}>{tp} %</span>
              <span className={styles.topicGo}><ArrowRightIcon size={16} /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
