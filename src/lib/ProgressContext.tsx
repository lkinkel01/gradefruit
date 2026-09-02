'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from './supabase';
import { useAuth } from './AuthContext';
import { LernStatus } from './types';
import { CONTENT_INDEX, type ContentLevel, type ContentTopic } from './contentIndex';

const COURSE_SLUG = 'mathe-gk';
const COURSE_SLUG_LK = 'mathe-lk';

interface ProgressState {
  understood: boolean;
  saved: boolean;
}

// Drei Lernstufen auf den zwei bestehenden Bool-Spalten kodiert –
// bewusst OHNE Datenbank-Änderung. Die vier Kombinationen bilden die
// vier Zustände eindeutig ab:
//   verstanden  = understood, nicht saved
//   wiederholen = saved, nicht understood   (entspricht dem alten „Gemerkt")
//   unklar      = beide gesetzt
//   none        = beide leer
function toStatus(s: ProgressState | undefined): LernStatus {
  if (!s) return 'none';
  if (s.understood && s.saved) return 'unklar';
  if (s.understood) return 'verstanden';
  if (s.saved) return 'wiederholen';
  return 'none';
}
function fromStatus(status: LernStatus): ProgressState {
  return {
    understood: status === 'verstanden' || status === 'unklar',
    saved: status === 'wiederholen' || status === 'unklar',
  };
}

export interface StatusCounts {
  verstanden: number;
  wiederholen: number;
  unklar: number;
}

interface ProgressCtx {
  ready: boolean;
  owned: boolean;     // Grundkurs aktiv?
  ownedLk: boolean;   // Leistungskurs aktiv?
  plan: string | null;     // Grundkurs-Tarif
  planLk: string | null;   // Leistungskurs-Tarif
  refresh: () => Promise<void>;
  statusOf: (topicSlug: string, lessonSlug: string) => LernStatus;
  /** Liefert false, wenn zur Aufgabe keine Lektion existiert — dann wurde nichts gespeichert. */
  setStatus: (topicSlug: string, lessonSlug: string, status: LernStatus) => Promise<boolean>;
  // Alle Zähler brauchen die Kursstufe. Warum, steht bei `aufgabenDerStufe`.
  topicDone: (topicSlug: string, level: ContentLevel) => number;
  topicTotal: (topicSlug: string, level: ContentLevel) => number;
  statusCounts: (level: ContentLevel) => StatusCounts; // über alle Themen
  totalDone: (level: ContentLevel) => number;
  totalLessons: (level: ContentLevel) => number;
}

const Ctx = createContext<ProgressCtx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { user } = useAuth();

  // Map "topicSlug/lessonSlug" -> lessonId  (aus der DB geladen)
  const [lessonId, setLessonId] = useState<Record<string, string>>({});
  // Map lessonId -> Fortschritt
  const [progress, setProgress] = useState<Record<string, ProgressState>>({});
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courseIdLk, setCourseIdLk] = useState<string | null>(null);
  const [owned, setOwned] = useState(false);
  const [ownedLk, setOwnedLk] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [planLk, setPlanLk] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setReady(false);

      // 1) Lektionen + zugehörige Themen laden (für alle lesbar)
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, slug, topics(slug)');

      // Scheitert das, zeigt die App „0 von 0 Aufgaben" und wirkt schlicht
      // leer — ohne Hinweis, dass etwas schiefging. Der häufigste Grund ist ein
      // abgelaufener Ausweis; dagegen prüft AuthContext die Sitzung beim Start.
      if (lessonsError) {
        console.warn('Gradefruit: Lektionen konnten nicht geladen werden:', lessonsError.message);
      }

      const idMap: Record<string, string> = {};
      (lessons ?? []).forEach((row: { id: string; slug: string; topics: { slug: string } | { slug: string }[] | null }) => {
        const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;
        if (!topic) return;
        idMap[`${topic.slug}/${row.slug}`] = row.id;
      });

      // 2) Nur eingeloggt: Kauf-Status (GK + LK) + Fortschritt laden
      let cId: string | null = null;
      let cIdLk: string | null = null;
      let isOwned = false;
      let isOwnedLk = false;
      let planVal: string | null = null;
      let planValLk: string | null = null;
      const prog: Record<string, ProgressState> = {};

      if (user) {
        const { data: courses } = await supabase
          .from('courses').select('id, slug').in('slug', [COURSE_SLUG, COURSE_SLUG_LK]);
        (courses ?? []).forEach((c: { id: string; slug: string }) => {
          if (c.slug === COURSE_SLUG) cId = c.id;
          if (c.slug === COURSE_SLUG_LK) cIdLk = c.id;
        });

        // RLS sorgt dafür, dass nur eigene Käufe zurückkommen
        const { data: purchases } = await supabase
          .from('purchases').select('course_id, status, plan');
        (purchases ?? []).forEach((p: { course_id: string; status: string; plan: string | null }) => {
          if (p.course_id === cId) { isOwned = p.status === 'active'; planVal = p.plan ?? null; }
          if (p.course_id === cIdLk) { isOwnedLk = p.status === 'active'; planValLk = p.plan ?? null; }
        });

        // RLS sorgt dafür, dass nur eigene Zeilen zurückkommen
        const { data: rows } = await supabase
          .from('progress').select('lesson_id, understood, saved');
        (rows ?? []).forEach((r: { lesson_id: string; understood: boolean; saved: boolean }) => {
          prog[r.lesson_id] = { understood: r.understood, saved: r.saved };
        });
      }

      if (cancelled) return;
      setLessonId(idMap);
      setCourseId(cId);
      setCourseIdLk(cIdLk);
      setOwned(isOwned);
      setOwnedLk(isOwnedLk);
      setPlan(planVal);
      setPlanLk(planValLk);
      setProgress(prog);
      setReady(true);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const writeProgress = useCallback(
    async (topicSlug: string, lessonSlug: string, next: ProgressState): Promise<boolean> => {
      if (!user) return false;
      const id = lessonId[`${topicSlug}/${lessonSlug}`];
      if (!id) {
        // Fehlt zu einer Aufgabe die Lektion, lässt sich ihr Status nicht
        // speichern — und der Tipp bliebe wortlos wirkungslos. Genau so gingen
        // 54 Aufgaben lange unter. Die Daten sind repariert; neue Inhalte
        // brauchen `node --env-file=.env.local scripts/seed-lessons.mjs`.
        console.warn(`Gradefruit: Keine Lektion für ${topicSlug}/${lessonSlug} — Lernstatus wird nicht gespeichert.`);
        return false;
      }

      const current = progress[id] ?? { understood: false, saved: false };

      // Optimistisch sofort aktualisieren
      setProgress(p => ({ ...p, [id]: next }));

      const { error } = await supabase.from('progress').upsert(
        {
          user_id: user.id,
          lesson_id: id,
          understood: next.understood,
          saved: next.saved,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' },
      );
      if (error) {
        console.error('Fortschritt speichern fehlgeschlagen:', error.message);
        // Bei Fehler zurückrollen
        setProgress(p => ({ ...p, [id]: current }));
        return false;
      }
      return true;
    },
    [user, lessonId, progress, supabase],
  );

  const getState = (topicSlug: string, lessonSlug: string): ProgressState => {
    const id = lessonId[`${topicSlug}/${lessonSlug}`];
    return (id && progress[id]) || { understood: false, saved: false };
  };

  // Kauf-Status neu vom Server holen – z. B. nach der Rückkehr von Stripe.
  // Den Zugang schaltet ausschließlich der Stripe-Webhook frei; hier wird
  // nur gelesen, damit die App den frisch freigeschalteten Zugang sieht.
  const refresh = useCallback(async () => {
    if (!user) { setOwned(false); setOwnedLk(false); setPlan(null); setPlanLk(null); return; }
    let gkId = courseId;
    let lkId = courseIdLk;
    if (!gkId || !lkId) {
      const { data: courses } = await supabase
        .from('courses').select('id, slug').in('slug', [COURSE_SLUG, COURSE_SLUG_LK]);
      (courses ?? []).forEach((c: { id: string; slug: string }) => {
        if (c.slug === COURSE_SLUG) gkId = c.id;
        if (c.slug === COURSE_SLUG_LK) lkId = c.id;
      });
      if (gkId) setCourseId(gkId);
      if (lkId) setCourseIdLk(lkId);
    }
    const { data: purchases } = await supabase
      .from('purchases').select('course_id, status, plan');
    const gkP = (purchases ?? []).find(
      (p: { course_id: string; status: string; plan: string | null }) => p.course_id === gkId,
    );
    const lkP = (purchases ?? []).find(
      (p: { course_id: string; status: string; plan: string | null }) => p.course_id === lkId,
    );
    setOwned(gkP?.status === 'active');
    setPlan(gkP?.plan ?? null);
    setOwnedLk(lkP?.status === 'active');
    setPlanLk(lkP?.plan ?? null);
  }, [user?.id, courseId, courseIdLk]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Die Aufgaben-IDs eines Themas in EINER Kursstufe.
   *
   * Früher kam diese Zahl aus der Lektionstabelle. Dort liegen aber Grundkurs
   * und Leistungskurs unter demselben Thema: Analysis hat 45 Lektionen, 23 aus
   * dem GK und 22 aus dem LK. Wer dort zählte, teilte durch die Aufgaben beider
   * Stufen — ein Grundkursschüler, der jede einzelne Aufgabe verstanden hat,
   * sah deshalb ungefähr 50 %. Der Ring konnte sich nie füllen.
   *
   * Das Inhaltsverzeichnis kennt Thema UND Stufe. Der Nenner kommt deshalb von
   * dort; die Lektionstabelle bleibt, was sie ist — der Ort, an dem der
   * Fortschritt gespeichert wird.
   */
  const aufgabenDerStufe = (topicSlug: string, level: ContentLevel): string[] =>
    CONTENT_INDEX[topicSlug as ContentTopic]?.[level]?.tasks.map(t => t.id) ?? [];

  const alleThemen = Object.keys(CONTENT_INDEX) as ContentTopic[];

  const zaehleStufe = (level: ContentLevel): StatusCounts => {
    const counts: StatusCounts = { verstanden: 0, wiederholen: 0, unklar: 0 };
    alleThemen.forEach(topic => {
      aufgabenDerStufe(topic, level).forEach(taskId => {
        const st = toStatus(getState(topic, taskId));
        if (st !== 'none') counts[st]++;
      });
    });
    return counts;
  };

  const value: ProgressCtx = {
    ready,
    owned,
    ownedLk,
    plan,
    planLk,
    refresh,
    statusOf: (t, l) => toStatus(getState(t, l)),
    setStatus: (t, l, status) => writeProgress(t, l, fromStatus(status)),
    topicTotal: (t, level) => aufgabenDerStufe(t, level).length,
    topicDone: (t, level) =>
      aufgabenDerStufe(t, level).filter(id => toStatus(getState(t, id)) === 'verstanden').length,
    statusCounts: zaehleStufe,
    totalLessons: level =>
      alleThemen.reduce((summe, topic) => summe + aufgabenDerStufe(topic, level).length, 0),
    totalDone: level => zaehleStufe(level).verstanden,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress muss innerhalb von <ProgressProvider> stehen');
  return ctx;
}
