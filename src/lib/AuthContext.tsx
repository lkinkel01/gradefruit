'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from './supabase';

/** Warum jemand abgemeldet wurde, ohne selbst auf „Abmelden" zu klicken. */
export type SignedOutReason = 'other-device' | 'idle';

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // Damit die Oberfläche erklären kann, was passiert ist, statt kommentarlos
  // in den abgemeldeten Zustand zu fallen.
  signedOutReason: SignedOutReason | null;
  clearSignedOutReason: () => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signedOutReason: null,
  clearSignedOutReason: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const claimOnNextUser = useRef(false);
  const [signedOutReason, setSignedOutReason] = useState<SignedOutReason | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Nur eine echte Anmeldung übernimmt das Gerät — ein Seitenaufruf mit
      // bestehender Sitzung (INITIAL_SESSION) darf das andere Gerät nicht
      // hinauswerfen.
      // Den Hinweis hier NICHT löschen: Supabase meldet auch das Wiederher-
      // stellen einer bestehenden Sitzung als SIGNED_IN, und das kam beim
      // Zeitablauf-Abmelden zufällig nach dem Setzen des Grunds an — der
      // Hinweis verschwand dadurch sofort wieder. Angezeigt wird er ohnehin
      // nur im abgemeldeten Zustand; gelöscht wird er beim bewussten Anmelden.
      if (event === 'SIGNED_IN') claimOnNextUser.current = true;
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Nur ein Gerät gleichzeitig: Jedes Gerät hat eine Kennung. Beim Anmelden
  // trägt es sie in `active_device` ein; alle anderen Geräte hören per
  // Realtime auf diese Zeile und melden sich sofort ab, sobald dort eine
  // fremde Kennung steht. Nötig, weil Supabase-Zugangstoken JWTs sind und
  // nach einem serverseitigen Widerruf noch bis zum Ablauf gültig blieben.
  useEffect(() => {
    if (!user) return;
    const KEY = 'gf-device-id';
    let deviceId = '';
    try {
      deviceId = localStorage.getItem(KEY) ?? '';
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(KEY, deviceId);
      }
    } catch { return; }

    let alive = true;
    const kick = () => {
      if (!alive) return;
      alive = false;
      setSignedOutReason('other-device');
      void supabase.auth.signOut();
    };

    const claim = async () => {
      await supabase.from('active_device')
        .upsert({ user_id: user.id, device_id: deviceId, updated_at: new Date().toISOString() },
                { onConflict: 'user_id' });
    };

    const verify = async () => {
      const { data } = await supabase.from('active_device')
        .select('device_id').eq('user_id', user.id).maybeSingle();
      if (!data) { void claim(); return; }
      if (data.device_id !== deviceId) kick();
    };

    // Frische Anmeldung übernimmt das Gerät; ein bloßer Seitenaufruf prüft nur.
    if (claimOnNextUser.current) {
      claimOnNextUser.current = false;
      void claim();
    } else {
      void verify();
    }

    const channel = supabase
      .channel(`active-device-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'active_device', filter: `user_id=eq.${user.id}` },
        payload => {
          const next = (payload.new as { device_id?: string } | null)?.device_id;
          if (next && next !== deviceId) kick();
        })
      .subscribe();

    // Zusätzliche Absicherung, falls die Realtime-Verbindung abreißt.
    const poll = window.setInterval(() => { void verify(); }, 20_000);

    return () => {
      alive = false;
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  // Sicherheitshalber automatisch abmelden, wenn zwei Stunden lang nichts
  // passiert. Jede Eingabe setzt die Frist zurück; die letzte Aktivität liegt
  // im Speicher, damit auch ein geschlossener und wieder geöffneter Tab zählt.
  useEffect(() => {
    if (!user) return;
    const LIMIT = 2 * 60 * 60 * 1000;
    const KEY = 'gf-last-activity';
    const touch = () => {
      try { localStorage.setItem(KEY, String(Date.now())); } catch { /* Speicher gesperrt */ }
    };
    const expired = () => {
      try {
        const raw = localStorage.getItem(KEY);
        return !!raw && Date.now() - Number(raw) > LIMIT;
      } catch { return false; }
    };
    const check = () => {
      if (!expired()) return;
      try { localStorage.removeItem(KEY); } catch { /* Speicher gesperrt */ }
      setSignedOutReason('idle');
      void supabase.auth.signOut();
    };

    // Zuerst prüfen, dann erst die Frist neu setzen. Andersherum (touch vor
    // check) überschrieb der Seitenaufruf selbst die letzte Aktivität — wer den
    // Tab drei Stunden geschlossen hatte, blieb dadurch angemeldet.
    if (expired()) {
      check();
      return;
    }
    touch();
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll', 'focus'];
    events.forEach(e => window.addEventListener(e, touch, { passive: true }));
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(check, 60_000);

    return () => {
      events.forEach(e => window.removeEventListener(e, touch));
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [supabase, user]);

  const signOut = async () => {
    setSignedOutReason(null);
    await supabase.auth.signOut();
  };

  const clearSignedOutReason = () => setSignedOutReason(null);

  return (
    <Ctx.Provider value={{ user, session, loading, signOut, signedOutReason, clearSignedOutReason }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
