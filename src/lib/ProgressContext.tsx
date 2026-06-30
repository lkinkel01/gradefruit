'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from './supabase';
import { useAuth } from './AuthContext';

const COURSE_SLUG = 'mathe-gk';
const COURSE_SLUG_LK = 'mathe-lk';

interface ProgressState {
  understood: boolean;
  saved: boolean;
}

interface ProgressCtx {
  ready: boolean;
  owned: boolean;     // Grundkurs aktiv?
  ownedLk: boolean;   // Leistungskurs aktiv?
  plan: string | null;     // Grundkurs-Tarif
  planLk: string | null;   // Leistungskurs-Tarif
  refresh: () => Promise<void>;
  isUnderstood: (topicSlug: string, lessonSlug: string) => boolean;
  isSaved: (topicSlug: string, lessonSlug: string) => boolean;
  toggleUnderstood: (topicSlug: string, lessonSlug: string) => Promise<void>;
  toggleSaved: (topicSlug: string, lessonSlug: string) => Promise<void>;
  topicDone: (topicSlug: string) => number;
  topicTotal: (topicSlug: string) => number;
  totalDone: number;
  totalLessons: number;
}

const Ctx = createContext<ProgressCtx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { user } = useAuth();

  // Map "topicSlug/lessonSlug" -> lessonId  (aus der DB geladen)
  const [lessonId, setLessonId] = useState<Record<string, string>>({});
  // Map topicSlug -> lessonId[]  (für Zähler)
  const [lessonsByTopic, setLessonsByTopic] = useState<Record<string, string[]>>({});
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
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, slug, topics(slug)');

      const idMap: Record<string, string> = {};
      const byTopic: Record<string, string[]> = {};
      (lessons ?? []).forEach((row: { id: string; slug: string; topics: { slug: string } | { slug: string }[] | null }) => {
        const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;
        if (!topic) return;
        idMap[`${topic.slug}/${row.slug}`] = row.id;
        (byTopic[topic.slug] ??= []).push(row.id);
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
      setLessonsByTopic(byTopic);
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
    async (topicSlug: string, lessonSlug: string, patch: Partial<ProgressState>) => {
      if (!user) return;
      const id = lessonId[`${topicSlug}/${lessonSlug}`];
      if (!id) return;

      const current = progress[id] ?? { understood: false, saved: false };
      const next = { ...current, ...patch };

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
      }
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

  const value: ProgressCtx = {
    ready,
    owned,
    ownedLk,
    plan,
    planLk,
    refresh,
    isUnderstood: (t, l) => getState(t, l).understood,
    isSaved: (t, l) => getState(t, l).saved,
    toggleUnderstood: (t, l) => writeProgress(t, l, { understood: !getState(t, l).understood }),
    toggleSaved: (t, l) => writeProgress(t, l, { saved: !getState(t, l).saved }),
    topicTotal: (t) => (lessonsByTopic[t] ?? []).length,
    topicDone: (t) => (lessonsByTopic[t] ?? []).filter(id => progress[id]?.understood).length,
    totalLessons: Object.values(lessonsByTopic).reduce((a, ids) => a + ids.length, 0),
    totalDone: Object.values(progress).filter(p => p.understood).length,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress muss innerhalb von <ProgressProvider> stehen');
  return ctx;
}
