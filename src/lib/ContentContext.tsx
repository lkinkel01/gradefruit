'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { ContentLevel, ContentTopic } from './contentIndex';
import { ladeOffline, loescheOffline, speichereOffline } from './offlineContent';
import { tonspurenLaden, tonspurenVorhanden, alleTonspuren } from './offlineAudio';

// ===========================================================================
// Kursinhalte im Browser — geladen, nicht mitgeliefert.
//
// Die Aufgaben und Zusammenfassungen stecken nicht mehr im ausgelieferten
// JavaScript, sondern kommen einzeln über /api/content. Dieser Kontext holt
// sie bei Bedarf, merkt sie sich für die Sitzung und räumt sie beim Abmelden
// wieder weg — damit auf einem geteilten Rechner nichts zurückbleibt.
// ===========================================================================

export interface ContentTask {
  id: string;
  tag: string;
  src: string;
  q: string;
  steps: { label: string; math: string }[];
  result: string;
  mistakes: string[];
  locked: boolean;
  videoId?: string;
}

export interface ContentSummarySection {
  title: string;
  text: string;
  formulas: string[];
}

export interface ContentSummary {
  /** Abschnitte in Lern-Reihenfolge; der erste heißt „Einleitung". */
  sections: ContentSummarySection[];
}

/** 'locked' heißt: angemeldet, aber ohne Kauf für diese Kursstufe. */
export type ContentState = 'loading' | 'ready' | 'locked' | 'signin' | 'error';

export interface TopicContent {
  state: ContentState;
  tasks: ContentTask[];
  summary: ContentSummary | null;
  message: string | null;
  reload: () => void;
}

interface Entry {
  state: ContentState;
  tasks: ContentTask[];
  summary: ContentSummary | null;
  message: string | null;
}

interface ContentCtx {
  get: (topic: ContentTopic, level: ContentLevel) => Entry | undefined;
  request: (topic: ContentTopic, level: ContentLevel, force?: boolean) => void;
}

const Ctx = createContext<ContentCtx>({ get: () => undefined, request: () => {} });

const keyOf = (topic: ContentTopic, level: ContentLevel) => `${topic}:${level}`;

const EMPTY: Entry = { state: 'loading', tasks: [], summary: null, message: null };

export function ContentProvider({ children }: { children: ReactNode }) {
  const { session, user, loading: authLoading } = useAuth();
  const [cache, setCache] = useState<Record<string, Entry>>({});
  // Läuft eine Anfrage bereits, wird sie nicht doppelt gestellt.
  const inFlight = useRef<Set<string>>(new Set());
  const token = session?.access_token ?? null;
  const userId = user?.id ?? null;
  // In einer Ref, damit die laufende Anfrage die aktuelle Kennung sieht, ohne
  // dass `request` bei jedem Nutzerwechsel neu erzeugt wird.
  const userIdRef = useRef<string | null>(userId);
  userIdRef.current = userId;

  // Nutzerwechsel oder Abmelden: alles Geladene verwerfen. Sonst sähe der
  // nächste Nutzer am selben Gerät die Inhalte des vorigen.
  const lastUser = useRef<string | null>(null);
  useEffect(() => {
    if (lastUser.current !== userId) {
      const vorher = lastUser.current;
      lastUser.current = userId;
      inFlight.current.clear();
      setCache({});
      // Nutzerwechsel: nichts vom Vorgänger auf dem Gerät zurücklassen.
      if (vorher !== null) void loescheOffline();
    }
  }, [userId]);

  // Nach dem Anmelden noch einmal versuchen: was vorher als „nicht angemeldet"
  // abgelegt wurde, ist jetzt abrufbar.
  const lastToken = useRef<string | null>(null);
  useEffect(() => {
    const had = lastToken.current;
    lastToken.current = token;
    if (!had && token) setCache({});
  }, [token]);

  const request = useCallback((topic: ContentTopic, level: ContentLevel, force = false) => {
    const key = keyOf(topic, level);
    if (inFlight.current.has(key)) return;

    // Nicht vorab abbrechen, wenn kein Token da ist: Der Server entscheidet,
    // was ohne Konto sichtbar ist (Analysis als kostenlose Probe). Solange die
    // Anmeldung noch geprüft wird, warten wir aber.
    if (authLoading) return;

    setCache(prev => {
      if (!force && prev[key] && prev[key].state !== 'signin') return prev;
      return { ...prev, [key]: EMPTY };
    });
    inFlight.current.add(key);

    (async () => {
      try {
        const res = await fetch(`/api/content?topic=${topic}&level=${level}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: 'no-store',
        });
        const body = await res.json().catch(() => null) as
          | { tasks?: ContentTask[]; summary?: ContentSummary; message?: string }
          | null;

        if (res.ok && body?.tasks && body.summary) {
          setCache(prev => ({
            ...prev,
            [key]: { state: 'ready', tasks: body.tasks!, summary: body.summary!, message: null },
          }));
          // Für den Offline-Zugriff verschlüsselt ablegen — nur für angemeldete
          // Nutzer, denn die Ablage gehört immer genau einem Konto.
          if (userIdRef.current) {
            void speichereOffline(userIdRef.current, topic, level,
              { tasks: body.tasks, summary: body.summary });
          }
        } else {
          const state: ContentState = res.status === 403 ? 'locked' : res.status === 401 ? 'signin' : 'error';
          setCache(prev => ({
            ...prev,
            [key]: { state, tasks: [], summary: null, message: body?.message ?? null },
          }));
        }
      } catch {
        // Kein Netz: auf die Ablage auf dem Gerät zurückfallen.
        const offline = userIdRef.current
          ? await ladeOffline<{ tasks: ContentTask[]; summary: ContentSummary }>(
              userIdRef.current, topic, level)
          : null;

        setCache(prev => ({
          ...prev,
          [key]: offline
            ? {
                state: 'ready',
                tasks: offline.tasks,
                summary: offline.summary,
                message: 'Offline. Zuletzt geladener Stand.',
              }
            : {
                state: 'error',
                tasks: [],
                summary: null,
                message: 'Die Inhalte konnten nicht geladen werden. Prüfe deine Verbindung.',
              },
        }));
      } finally {
        inFlight.current.delete(key);
      }
    })();
  }, [token, authLoading]);

  // Alles auf Vorrat holen, sobald einmal Netz da ist.
  //
  // Vorher lag offline nur bereit, was man vorher zufällig geöffnet hatte —
  // und dass etwas fehlt, merkt man erst dort, wo man es nicht mehr nachholen
  // kann. Läuft im Hintergrund, ohne Anzeige: Wer gerade liest, merkt nichts
  // davon; was diesmal nicht klappt, klappt beim nächsten Start.
  useEffect(() => {
    if (authLoading || !userId) return;
    const abbruch = new AbortController();
    // Erst dem laufen lassen, was der Nutzer gerade sehen will.
    const start = window.setTimeout(() => {
      const themen: ContentTopic[] = ['analysis', 'linalg', 'stochastik'];
      const stufen: ContentLevel[] = ['gk', 'lk'];
      themen.forEach((thema, i) => {
        stufen.forEach((stufe, j) => {
          window.setTimeout(() => request(thema, stufe), (i * 2 + j) * 400);
        });
      });

      // Die Tonspuren dazu — rund 11 MB.
      //
      // Sie kommen IMMER, auch im Datensparmodus. Ein Video ohne Ton ist kein
      // Video, und wer den Ton nicht hat, kann ihn genau dort nicht nachholen,
      // wo er ihn braucht. Der Sparmodus ändert nicht OB, sondern WIE: mit
      // einer halben Sekunde Pause zwischen den Dateien läuft es nebenher statt
      // die Leitung zu belegen. Was schon da ist, wird übersprungen.
      void (async () => {
        if ((await tonspurenVorhanden()) >= alleTonspuren().length) return;
        const netz = (navigator as Navigator & {
          connection?: { saveData?: boolean };
        }).connection;
        await tonspurenLaden(() => {}, {
          nurFehlende: true,
          pause: netz?.saveData ? 600 : 80,
          signal: abbruch.signal,
        });
      })();
    }, 2500);
    return () => {
      window.clearTimeout(start);
      abbruch.abort();
    };
  }, [authLoading, userId, request]);

  const get = useCallback(
    (topic: ContentTopic, level: ContentLevel) => cache[keyOf(topic, level)],
    [cache],
  );

  return <Ctx.Provider value={{ get, request }}>{children}</Ctx.Provider>;
}

/**
 * Zugriff auf das Nachladen, ohne einen bestimmten Inhalt zu abonnieren.
 *
 * Gedacht für das Vorladen im Hintergrund: Es will alle Themen aufs Gerät
 * holen, aber keines davon anzeigen.
 */
export function useContentLaden() {
  const { request } = useContext(Ctx);
  return request;
}

/**
 * Inhalte eines Themas in der gewählten Stufe. Lädt beim ersten Aufruf
 * selbstständig nach und liefert solange `state: 'loading'`.
 */
export function useTopicContent(topic: ContentTopic, level: ContentLevel): TopicContent {
  const { get, request } = useContext(Ctx);
  const entry = get(topic, level);

  useEffect(() => {
    if (!entry) request(topic, level);
  }, [entry, request, topic, level]);

  const reload = useCallback(() => request(topic, level, true), [request, topic, level]);

  return {
    state: entry?.state ?? 'loading',
    tasks: entry?.tasks ?? [],
    summary: entry?.summary ?? null,
    message: entry?.message ?? null,
    reload,
  };
}
