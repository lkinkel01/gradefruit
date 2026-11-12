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

  // Kurz halten. „Offline verfügbar" stand vorher als voller Knopf mitten
  // unter den Karten und wirkte wie ein Hauptangebot, obwohl es eine
  // Zusatzfunktion ist.
  const text = zustand === 'speichert' ? 'Wird geladen …'
    : zustand === 'gespeichert' ? 'Offline gespeichert'
    : zustand === 'fehler' ? 'Hat nicht geklappt'
    : 'Offline speichern';

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
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {zustand === 'gespeichert' ? (
          <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </>
        ) : (
          <>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </>
        )}
      </svg>
      {text}
    </button>
  );
}
