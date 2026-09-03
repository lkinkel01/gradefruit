'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { entferneThemaOffline, hatOffline, speichereOffline } from '@/lib/offlineContent';
import styles from './OfflineToggle.module.css';

type Zustand = 'unbekannt' | 'nicht-gespeichert' | 'speichert' | 'gespeichert' | 'fehler';

/**
 * „Für offline speichern" je Thema.
 *
 * Bisher landete nur auf dem Gerät, was man ohnehin schon geöffnet hatte. Damit
 * war Offline-Lernen Zufall: Wer im Zug eine Aufgabe aufschlagen wollte, die er
 * vorher nie angesehen hatte, stand vor einer Fehlermeldung. Hiermit lädt man
 * ein Thema bewusst vor.
 */
export default function OfflineToggle({ topic, level }: { topic: string; level: 'gk' | 'lk' }) {
  const { session, user } = useAuth();
  const userId = user?.id ?? null;
  const schluessel = userId ? `${userId}:${topic}:${level}` : '';
  const [abfrage, setAbfrage] = useState<{ schluessel: string; zustand: Zustand }>({
    schluessel: '',
    zustand: 'unbekannt',
  });
  const zustand = abfrage.schluessel === schluessel ? abfrage.zustand : 'unbekannt';
  const setZustand = useCallback((naechster: Zustand) => {
    setAbfrage({ schluessel, zustand: naechster });
  }, [schluessel]);

  useEffect(() => {
    let aktiv = true;
    if (!userId) return;
    void hatOffline(userId, topic, level).then(da => {
      if (aktiv) setAbfrage({
        schluessel: `${userId}:${topic}:${level}`,
        zustand: da ? 'gespeichert' : 'nicht-gespeichert',
      });
    });
    return () => { aktiv = false; };
  }, [userId, topic, level]);

  const umschalten = useCallback(async () => {
    if (!userId) return;

    if (zustand === 'gespeichert') {
      await entferneThemaOffline(userId, topic, level);
      setZustand('nicht-gespeichert');
      return;
    }

    setZustand('speichert');
    try {
      const res = await fetch(`/api/content?topic=${topic}&level=${level}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        cache: 'no-store',
      });
      if (!res.ok) { setZustand('fehler'); return; }
      const body = await res.json();
      if (!body?.tasks || !body?.summary) { setZustand('fehler'); return; }
      await speichereOffline(userId, topic, level, { tasks: body.tasks, summary: body.summary });
      setZustand('gespeichert');
    } catch {
      setZustand('fehler');
    }
  }, [userId, topic, level, zustand, session, setZustand]);

  // Ohne Konto gibt es keine Ablage — dann auch keinen Knopf.
  if (!userId || zustand === 'unbekannt') return null;

  const text = zustand === 'speichert' ? 'Wird gespeichert …'
    : zustand === 'gespeichert' ? 'Offline verfügbar'
    : zustand === 'fehler' ? 'Hat nicht geklappt, erneut versuchen'
    : 'Für offline speichern';

  return (
    <button
      type="button"
      className={`${styles.toggle} ${zustand === 'gespeichert' ? styles.on : ''}`}
      onClick={() => void umschalten()}
      disabled={zustand === 'speichert'}
      title={zustand === 'gespeichert'
        ? 'Dieses Thema liegt auf dem Gerät. Nochmal antippen, um es zu entfernen.'
        : 'Dieses Thema aufs Gerät laden, damit es ohne Internet lesbar ist.'}
    >
      <span className={styles.dot} aria-hidden="true" />
      {text}
    </button>
  );
}
