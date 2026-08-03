'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from './supabase';
import { imAppRahmen } from './nativeApp';
import { SCHUTZ_KEY, screenshotsFrei } from './schutz';

/** Warum jemand abgemeldet wurde, ohne selbst auf „Abmelden" zu klicken. */
export type SignedOutReason = 'other-device' | 'idle';

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Frei gewählter Benutzername (zweiter Anmeldeweg), oder null. */
  username: string | null;
  /**
   * Der Name, mit dem angesprochen wird — oder null.
   *
   * Reihenfolge: erst der selbst angegebene Name, dann der Benutzername. Ist
   * beides leer, wird bewusst NICHT angesprochen („Guten Tag." statt „Guten
   * Tag, gradefruit.leon@…"). Aus einer E-Mail einen Vornamen zu raten wäre
   * die schlechtere Wahl: Es trifft oft daneben und wirkt zudringlich.
   */
  anzeigeName: string | null;
  /** Nach dem Ändern in „Mein Konto" den Benutzernamen neu einlesen. */
  refreshProfil: () => Promise<void>;
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
  username: null,
  anzeigeName: null,
  refreshProfil: async () => {},
  signOut: async () => {},
  signedOutReason: null,
  clearSignedOutReason: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Der Benutzername steht in `public.users`, nicht in der Sitzung — einmal je
  // Anmeldung geholt, damit ihn nicht jede Komponente einzeln nachfragen muss.
  const [username, setUsername] = useState<string | null>(null);

  const ladeProfil = useCallback(async (id: string | undefined) => {
    if (!id) { setUsername(null); return; }
    const { data } = await supabase.from('users').select('username').eq('id', id).maybeSingle();
    setUsername((data?.username as string | undefined) ?? null);
  }, [supabase]);

  useEffect(() => { void ladeProfil(user?.id); }, [user?.id, ladeProfil]);

  const refreshProfil = useCallback(() => ladeProfil(user?.id), [ladeProfil, user?.id]);

  // Angesprochen wird mit dem selbst gewählten Namen; fehlt der, mit dem
  // Benutzernamen; fehlt beides, gar nicht.
  const eigenerName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const anzeigeName = eigenerName || username || null;

  // Der Grund muss ein Neuladen überstehen: Auf dem Handy wird die Seite beim
  // Zurückwechseln oft komplett neu aufgebaut, und ein reiner React-Zustand
  // wäre dann weg — der Hinweis erschien nie.
  const REASON_KEY = 'gf-signed-out-reason';
  const [signedOutReason, setReasonState] = useState<SignedOutReason | null>(null);
  const setSignedOutReason = (reason: SignedOutReason | null) => {
    setReasonState(reason);
    try {
      if (reason) sessionStorage.setItem(REASON_KEY, reason);
      else sessionStorage.removeItem(REASON_KEY);
    } catch { /* Speicher gesperrt */ }
  };

  // Beim Start einen gemerkten Grund zurückholen.
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(REASON_KEY);
      if (stored === 'other-device' || stored === 'idle') setReasonState(stored);
    } catch { /* Speicher gesperrt */ }
  }, []);

  useEffect(() => {
    // `getSession()` liest nur den Speicher des Browsers und glaubt ihm. Ob die
    // Sitzung serverseitig überhaupt noch gilt, prüft erst `getUser()`.
    //
    // Ohne diese Prüfung entsteht der schlimmste Zustand von allen: Die App
    // hält den Nutzer für angemeldet, schickt bei jeder Abfrage einen
    // ungültigen Ausweis mit, und der Server lehnt alles ab. Sichtbar wird das
    // nicht als Fehler, sondern als leere App — „0 von 0 Aufgaben", alle Themen
    // gesperrt, kein Kauf gefunden. Genau das hat Leon gesehen.
    //
    // Fällt die Prüfung durch, wird die Sitzung verworfen. Abgemeldet zu sein
    // ist ein ehrlicher Zustand; angemeldet zu scheinen und nichts zu können
    // ist keiner.
    // ABER: Diese Prüfung darf den Start unter keinen Umständen aufhalten.
    // In ihrer ersten Fassung tat sie genau das — ohne Zeitgrenze und ohne
    // Auffangnetz. Hing die Anfrage oder warf sie, lief `setLoading(false)` nie,
    // und die Seite stand endlos auf „Einen Moment …". Ein Startvorgang, der auf
    // das Netz wartet, muss immer einen Ausgang haben.
    //
    // Deshalb: höchstens vier Sekunden, und jeder Ausgang setzt `loading` auf
    // false. Läuft die Zeit ab, gilt die gespeicherte Sitzung weiter — eine
    // lahme Verbindung ist kein Grund, jemanden hinauszuwerfen. Abgemeldet wird
    // nur, wenn der Server die Sitzung ausdrücklich zurückweist.
    const start = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          const abgelaufen = Symbol('zeit');
          const ergebnis = await Promise.race([
            supabase.auth.getUser().catch(() => null),
            new Promise<symbol>(fertig => setTimeout(() => fertig(abgelaufen), 4000)),
          ]);

          // NUR bei einer ausdrücklichen Zurückweisung abmelden (401/403).
          //
          // Jeder andere Fehler heißt bloß „die Frage kam nicht durch": kein
          // Netz, DNS noch nicht wach, Server kurz weg. Beim Start der App ist
          // genau das der Normalfall — das Fenster lädt, bevor die Verbindung
          // steht. Wer daraufhin abmeldet, wirft den Nutzer bei jedem zweiten
          // App-Start hinaus, obwohl mit seiner Sitzung alles in Ordnung ist.
          const fehler = ergebnis !== abgelaufen && ergebnis && typeof ergebnis === 'object' && 'error' in ergebnis
            ? (ergebnis.error as { status?: number } | null)
            : null;
          const zurueckgewiesen = fehler?.status === 401 || fehler?.status === 403;

          if (zurueckgewiesen) {
            await supabase.auth.signOut().catch(() => {});
            setSession(null);
            setUser(null);
            return;
          }
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch {
        // Nicht einmal die gespeicherte Sitzung ließ sich lesen. Dann eben ohne.
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void start();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Bewusst NICHTS am Geräte-Anspruch oder am Hinweis ändern: Supabase
      // meldet auch das bloße Wiederherstellen einer bestehenden Sitzung als
      // SIGNED_IN. Daran die Übernahme zu hängen war der eigentliche Fehler —
      // dadurch riss sich jedes Gerät beim Neuladen den Anspruch zurück, und
      // das andere Gerät flog statt seiner hinaus.
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

    // Nur eine bewusste Anmeldung übernimmt das Gerät. Die Anmeldemaske setzt
    // dafür kurz vorher eine Einmal-Markierung; ein bloßer Seitenaufruf oder
    // ein Neuladen findet sie nicht vor und prüft deshalb nur.
    let deliberateSignIn = false;
    try {
      deliberateSignIn = sessionStorage.getItem('gf-claim-device') === '1';
      if (deliberateSignIn) sessionStorage.removeItem('gf-claim-device');
    } catch { /* Speicher gesperrt */ }

    if (deliberateSignIn) void claim();
    else void verify();

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

    // Der wichtigste Fall in der Praxis: Das Handy liegt in der Tasche,
    // während man sich am Laptop anmeldet. Im Hintergrund friert das Handy
    // Zeitgeber ein und trennt die Realtime-Verbindung — die Übernahme geht
    // dabei verloren und wird auch nicht nachgeliefert. Deshalb wird beim
    // Zurückkommen sofort neu geprüft, statt auf den nächsten Takt zu warten.
    const recheck = () => {
      if (document.visibilityState === 'visible') void verify();
    };
    document.addEventListener('visibilitychange', recheck);
    window.addEventListener('focus', recheck);
    window.addEventListener('pageshow', recheck);

    return () => {
      alive = false;
      window.clearInterval(poll);
      document.removeEventListener('visibilitychange', recheck);
      window.removeEventListener('focus', recheck);
      window.removeEventListener('pageshow', recheck);
      void supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  // Die App darf nicht wissen, wer angemeldet ist — sie kennt keine Konten.
  // Also legt die Seite die Antwort für sie hin; die native Hülle liest sie
  // beim Aktivieren aus und merkt sie sich bis zum nächsten Start.
  useEffect(() => {
    let lebt = true;
    // Bis die Antwort da ist, gilt „geschützt". Ein Fehler darf nie dazu
    // führen, dass ein gekaufter Kurs plötzlich abfotografierbar ist.
    try { localStorage.setItem(SCHUTZ_KEY, '0'); } catch { /* Speicher gesperrt */ }
    void screenshotsFrei(user?.email).then(frei => {
      if (!lebt || !frei) return;
      try { localStorage.setItem(SCHUTZ_KEY, '1'); } catch { /* Speicher gesperrt */ }
    });
    return () => { lebt = false; };
  }, [user]);

  // Sicherheitshalber automatisch abmelden, wenn zwei Stunden lang nichts
  // passiert. Jede Eingabe setzt die Frist zurück; die letzte Aktivität liegt
  // im Speicher, damit auch ein geschlossener und wieder geöffneter Tab zählt.
  //
  // NUR im Browser. Ein Browser läuft oft auf einem fremden oder geteilten
  // Rechner, eine installierte App liegt auf genau einem Gerät, das dem Nutzer
  // gehört und selbst gesperrt ist. Dort ist das Abmelden kein Schutz, sondern
  // eine Zumutung: Man macht die App auf und muss erst wieder Passwort tippen.
  // Keine App, die man täglich benutzt, tut das.
  useEffect(() => {
    if (!user) return;
    if (imAppRahmen()) return;
    const LIMIT = 2 * 60 * 60 * 1000;
    const KEY = 'gf-last-activity';
    const touch = () => {
      try { localStorage.setItem(KEY, String(Date.now())); } catch { /* Speicher gesperrt */ }
    };
    // Der Zeitpunkt der Anmeldung zählt als Aktivität — man kann nicht seit
    // zwei Stunden untätig sein, wenn man sich gerade angemeldet hat.
    //
    // Das ist keine Feinheit: Ohne diesen Vergleich entschied allein der
    // Zeitstempel der VORIGEN Sitzung. Nach jeder Pause von mehr als zwei
    // Stunden wurde man deshalb in derselben Sekunde wieder abgemeldet, in der
    // die Anmeldung gelang — und weil die Sitzung dabei sofort wieder wegfiel,
    // konnte auch die Geräteübernahme nicht mehr schreiben.
    const anmeldung = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : 0;
    const expired = () => {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return false;
        const zuletzt = Math.max(Number(raw), anmeldung);
        return Date.now() - zuletzt > LIMIT;
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
    <Ctx.Provider value={{ user, session, loading, username, anzeigeName, refreshProfil, signOut, signedOutReason, clearSignedOutReason }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
