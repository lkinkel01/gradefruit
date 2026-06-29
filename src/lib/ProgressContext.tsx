'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from './supabase';
import { useAuth } from './AuthContext';

const COURSE_SLUG = 'mathe-gk';

interface ProgressState {
  understood: boolean;
  saved: boolean;
}

interface ProgressCtx {
  ready: boolean;
  owned: boolean;
  plan: string | null;
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
  const [owned, setOwned] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
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

      // 2) Nur eingeloggt: Kauf-Status + Fortschritt laden
      let cId: string | null = null;
      let isOwned = false;
      let planVal: string | null = null;
      const prog: Record<string, ProgressState> = {};

      if (user) {
        const { data: course } = await supabase
          .from('courses').select('id').eq('slug', COURSE_SLUG).maybeSingle();
        cId = course?.id ?? null;

        if (cId) {
          const { data: purchase } = await supabase
            .from('purchases').select('status, plan').eq('course_id', cId).maybeSingle();
          isOwned = purchase?.status === 'active';
          planVal = (purchase?.plan as string | null) ?? null;
        }

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
      setOwned(isOwned);
      setPlan(planVal);
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
    if (!user) { setOwned(false); setPlan(null); return; }
    let cId = courseId;
    if (!cId) {
      const { data: course } = await supabase
        .from('courses').select('id').eq('slug', COURSE_SLUG).maybeSingle();
      cId = course?.id ?? null;
      if (cId) setCourseId(cId);
    }
    if (!cId) { setOwned(false); setPlan(null); return; }
    const { data: purchase } = await supabase
      .from('purchases').select('status, plan').eq('course_id', cId).maybeSingle();
    setOwned(purchase?.status === 'active');
    setPlan((purchase?.plan as string | null) ?? null);
  }, [user?.id, courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const value: ProgressCtx = {
    ready,
    owned,
    plan,
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
