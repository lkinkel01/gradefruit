'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import styles from './AuthModal.module.css';
import modalStyles from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  initialMode?: 'login' | 'register';
}

// Übersetzt die häufigsten Supabase-Fehlermeldungen in freundliches Deutsch.
function germanAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('already registered') || m.includes('already exists') || m.includes('user already'))
    return 'Diese E-Mail ist schon registriert. Melde dich einfach an.';
  if (m.includes('password') && (m.includes('at least') || m.includes('should be') || m.includes('6 characters')))
    return 'Das Passwort muss mindestens 6 Zeichen haben.';
  if (m.includes('weak password') || m.includes('pwned') || m.includes('too weak'))
    return 'Bitte wähle ein sichereres Passwort (länger, mit Zahlen oder Zeichen).';
  if (m.includes('invalid') && m.includes('email'))
    return 'Diese E-Mail-Adresse sieht nicht gültig aus. Bitte prüfe sie.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Zu viele Versuche. Bitte warte einen Moment und versuch es dann erneut.';
  if (m.includes('signups not allowed') || m.includes('signup is disabled'))
    return 'Die Registrierung ist gerade nicht möglich. Bitte versuch es später erneut.';
  return 'Registrierung fehlgeschlagen. Bitte prüfe deine Angaben und versuch es erneut.';
}

/**
 * Die Bedingungen fürs Passwort — als Liste, damit sie sowohl geprüft als auch
 * angezeigt werden können. Beides aus derselben Quelle: Eine Regel, die nur im
 * Text steht, läuft irgendwann der Prüfung davon.
 */
const PASSWORT_REGELN: { text: string; erfuellt: (p: string) => boolean }[] = [
  { text: 'Mindestens 8 Zeichen', erfuellt: p => p.length >= 8 },
  { text: 'Mindestens ein Buchstabe', erfuellt: p => /\p{L}/u.test(p) },
  { text: 'Mindestens eine Ziffer', erfuellt: p => /\d/.test(p) },
];

export default function AuthModal({ open, onClose, onAuthenticated, initialMode = 'login' }: Props) {
  const supabase = createClient();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  // Beim Anmelden ein Feld für beides: E-Mail oder Benutzername. Was davon
  // gemeint ist, entscheidet das @ — und der Server löst es auf.
  const [kennung, setKennung] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Die Registrierung läuft in zwei Schritten: erst das Nötige (E-Mail und
  // Passwort), danach das Freiwillige. So steht zwischen dem Nutzer und seinem
  // Konto nur, was wirklich gebraucht wird.
  const [schritt, setSchritt] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setError(''); setInfo(''); };
  const registrierSchritt2 = mode === 'register' && schritt === 2;

  // Beim Öffnen dem gewünschten Modus folgen. Ohne das bliebe das Fenster im
  // Modus des ERSTEN Öffnens hängen ("Registrieren" öffnete den Login).
  useEffect(() => {
    let frame = 0;
    if (open) {
      frame = requestAnimationFrame(() => {
        setMode(initialMode);
        setSchritt(1);
        reset();
      });
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [open, initialMode]);

  /**
   * Meldet mit E-Mail oder Benutzername an. Gibt bei Erfolg null zurück,
   * sonst den anzuzeigenden Text.
   *
   * Der Umweg über den Server ist nötig, weil Supabase nur E-Mail-Adressen
   * kennt; ein Benutzername muss dort erst aufgelöst werden. Zurück kommt nur
   * die fertige Sitzung — die aufgelöste Adresse verlässt den Server nie.
   */
  const anmelden = async (eingabe: string, passwort: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/anmelden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kennung: eingabe, passwort }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.access_token) {
        return data?.error === 'email_not_confirmed'
          ? data.message
          : 'E-Mail/Benutzername oder Passwort falsch.';
      }
      const { error } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (error) return 'Anmeldung fehlgeschlagen. Bitte versuch es erneut.';
      return null;
    } catch {
      return 'Keine Verbindung. Bitte prüfe dein Internet und versuch es erneut.';
    }
  };

  /**
   * Speichert die freiwilligen Angaben aus Schritt 2. Gibt null zurück, wenn
   * alles sitzt — sonst den Text, der am Feld stehen soll.
   *
   * Beides darf leer bleiben. Wer nichts angibt, wird später schlicht nicht
   * persönlich angesprochen; das ist ein gültiges Ergebnis und kein Mangel.
   */
  const profilSpeichern = async (): Promise<string | null> => {
    const wunschName = username.trim();
    const wunschAnrede = name.trim();

    if (wunschName && !/^[A-Za-z0-9._-]{3,24}$/.test(wunschName)) {
      return '3–24 Zeichen, erlaubt sind Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich.';
    }

    const { data: { user: neu } } = await supabase.auth.getUser();
    if (!neu) return 'Dein Konto ist angelegt, die Angaben konnten aber nicht gespeichert werden.';

    if (wunschAnrede) {
      await supabase.auth.updateUser({ data: { full_name: wunschAnrede } });
    }
    if (wunschName) {
      const { error } = await supabase.from('users').update({ username: wunschName }).eq('id', neu.id);
      if (error) {
        return error.code === '23505'
          ? 'Dieser Benutzername ist schon vergeben. Bitte wähle einen anderen.'
          : 'Der Benutzername konnte nicht gespeichert werden.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); reset();

    if (mode === 'register') {
      if (schritt === 1) {
        const offen = PASSWORT_REGELN.filter(r => !r.erfuellt(password));
        if (offen.length > 0) {
          setError('Das Passwort erfüllt noch nicht alle Bedingungen.');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({ email, password });
        markDeliberateSignIn();
        if (error) { setError(germanAuthError(error.message)); setLoading(false); return; }

        // Ohne Sitzung ist die Bestätigung per E-Mail eingeschaltet — dann gibt
        // es hier nichts weiter zu tun, der zweite Schritt käme ins Leere.
        if (!data.session) {
          setInfo('Bestätigungs-E-Mail gesendet! Bitte überprüfe dein Postfach (auch den Spam-Ordner).');
          setLoading(false);
          return;
        }
        setSchritt(2);
        setLoading(false);
        return;
      }

      // Schritt 2 — beides freiwillig. Was leer bleibt, bleibt leer.
      const fehler = await profilSpeichern();
      if (fehler) { setError(fehler); setLoading(false); return; }
      onAuthenticated();
    } else {
      markDeliberateSignIn();
      const error = await anmelden(kennung, password);
      // Gerät direkt hier übernehmen, nicht über das SIGNED_IN-Ereignis:
      // dessen Zeitpunkt war nicht verlässlich, wodurch die Kennung des
      // zweiten Geräts nie in der Tabelle landete.
      if (!error) {
        const { data: { user: signedIn } } = await supabase.auth.getUser();
        if (signedIn) {
          let deviceId = '';
          try {
            deviceId = localStorage.getItem('gf-device-id') ?? '';
            if (!deviceId) { deviceId = crypto.randomUUID(); localStorage.setItem('gf-device-id', deviceId); }
          } catch { /* Speicher gesperrt */ }
          if (deviceId) {
            const { error: claimError } = await supabase.from('active_device').upsert(
              { user_id: signedIn.id, device_id: deviceId, updated_at: new Date().toISOString() },
              { onConflict: 'user_id' },
            );
            if (claimError) console.warn('Geräteübernahme fehlgeschlagen:', claimError.message);
          }
        }
      }
      if (error) setError(error);
      else onAuthenticated();
    }
    setLoading(false);
  };

  // Einmal-Markierung: Nur eine bewusste Anmeldung darf das Gerät übernehmen.
  // AuthContext liest sie beim nächsten Durchlauf und verbraucht sie dabei.
  const markDeliberateSignIn = () => {
    try {
      sessionStorage.setItem('gf-claim-device', '1');
      // Wer sich gerade anmeldet, IST aktiv.
      //
      // Ohne diese Zeile galt der Zeitstempel der VORIGEN Sitzung. Lag der über
      // zwei Stunden zurück — also nach jeder normalen Pause —, schlug die
      // Leerlauf-Sperre in demselben Moment zu, in dem die Anmeldung gelang:
      // Der Server stellte die Sitzung aus, der Browser warf sie sofort wieder
      // weg und zeigte „Automatisch abgemeldet". Schlimmer noch, die
      // Geräteübernahme kam nicht mehr dazu zu schreiben, weshalb danach auch
      // noch das andere Gerät als angemeldet galt.
      localStorage.setItem('gf-last-activity', String(Date.now()));
    } catch { /* Speicher gesperrt */ }
  };

  const handleGoogle = async () => {
    try { localStorage.setItem('gf-after-auth', 'dashboard'); } catch { /* Speicher gesperrt */ }
    markDeliberateSignIn();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  if (!open) return null;

  return (
    <>
      <div className={`${modalStyles.scrim} ${modalStyles.open}`} onClick={onClose} />
      <div className={`${modalStyles.modal} ${modalStyles.open}`} role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className={modalStyles.mhead}>
          <button type="button" className={modalStyles.mclose} onClick={onClose} aria-label="Dialog schließen">✕</button>
          <div className={`${modalStyles.ptag} ${styles.ptag}`}>Gradefruit · Mathematik-Abitur Hessen 2027</div>
          <h2 id="auth-title">
            {mode === 'login' ? 'Anmelden' : registrierSchritt2 ? 'Fast fertig' : 'Registrieren'}
          </h2>
          <p>
            {mode === 'login'
              ? 'Mit deinem Konto einloggen.'
              : registrierSchritt2
                ? 'Beides ist freiwillig — du kannst es auch später unter „Mein Konto" nachtragen.'
                : 'Konto erstellen und loslegen.'}
          </p>
        </div>
        <div className={modalStyles.mbody}>
          {/* Im zweiten Schritt ist das Konto schon angelegt — ein zweiter
              Anmeldeweg hätte dort nichts mehr zu suchen. */}
          {!registrierSchritt2 && (
            <>
              <button className={styles.googleBtn} onClick={handleGoogle} type="button">
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.08 29.5 1 24 1 14.82 1 7.07 6.49 3.64 14.21l7.1 5.52C12.47 13.37 17.77 9.5 24 9.5z"/><path fill="#4285F4" d="M46.6 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.73c-.55 2.98-2.22 5.5-4.73 7.2l7.25 5.63C43.4 37.44 46.6 31.4 46.6 24.5z"/><path fill="#FBBC05" d="M10.74 28.27A14.55 14.55 0 0 1 9.5 24c0-1.49.25-2.93.69-4.28l-7.1-5.51A23.94 23.94 0 0 0 0 24c0 3.86.92 7.51 2.55 10.73l8.19-6.46z"/><path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.49-4.95l-7.25-5.63c-2.01 1.35-4.58 2.08-6.24 2.08-6.23 0-11.52-3.86-13.26-9.23l-8.19 6.46C7.07 41.51 14.82 47 24 47z"/></svg>
                Mit Google anmelden
              </button>
              <div className={styles.divider}><span>oder</span></div>
            </>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'login' && (
              <div className={styles.field}>
                <label htmlFor="auth-kennung">E-Mail oder Benutzername</label>
                {/* Bewusst `type="text"`: Ein Benutzername ist keine Adresse,
                    `type="email"` würde ihn als ungültig abweisen. `inputMode`
                    holt auf dem Handy trotzdem die Tastatur mit dem @ hervor,
                    und `autocomplete="username"` ist das Kennwort-Feldpaar, auf
                    das iOS und die Passwortspeicher hören. */}
                <input
                  id="auth-kennung"
                  name="username"
                  type="text"
                  inputMode="email"
                  value={kennung}
                  onChange={e => setKennung(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>
            )}

            {mode === 'register' && !registrierSchritt2 && (
              <div className={styles.field}>
                <label htmlFor="auth-email">E-Mail</label>
                <input id="auth-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
              </div>
            )}

            {!registrierSchritt2 && (
              <div className={styles.field}>
                <label htmlFor="auth-password">Passwort</label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                  minLength={mode === 'register' ? 8 : 6}
                />
                {/* Die Bedingungen stehen dabei und haken sich beim Tippen ab —
                    ein Passwort abzulehnen, ohne vorher zu sagen, was verlangt
                    ist, ist Rätselraten. */}
                {mode === 'register' && (
                  <ul className={styles.regeln}>
                    {PASSWORT_REGELN.map(regel => {
                      const ok = regel.erfuellt(password);
                      return (
                        <li key={regel.text} className={ok ? styles.regelOk : undefined}>
                          <span aria-hidden="true">{ok ? '✓' : '·'}</span>
                          {regel.text}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {registrierSchritt2 && (
              <>
                <div className={styles.field}>
                  <label htmlFor="auth-anrede">Name <span className={styles.optional}>optional</span></label>
                  <input
                    id="auth-anrede"
                    name="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="Wie sollen wir dich ansprechen?"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="auth-username">Benutzername <span className={styles.optional}>optional</span></label>
                  <input
                    id="auth-username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); reset(); }}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="frei lassen ist in Ordnung"
                  />
                  <span className={styles.fieldHint}>
                    3–24 Zeichen. Damit kannst du dich später auch ohne deine E-Mail anmelden.
                  </span>
                </div>
              </>
            )}

            {error && <div className={styles.error}>{error}</div>}
            {info && <div className={styles.info}>{info}</div>}

            <button className="btn primary" style={{ width: '100%', marginTop: 8 }} type="submit" disabled={loading}>
              {loading ? '…' : mode === 'login' ? 'Anmelden' : registrierSchritt2 ? 'Fertig' : 'Weiter'}
            </button>

            {registrierSchritt2 && (
              <button
                type="button"
                className={styles.ueberspringen}
                onClick={onAuthenticated}
                disabled={loading}
              >
                Überspringen
              </button>
            )}
          </form>

          <div className={styles.switchMode} hidden={registrierSchritt2}>
            {mode === 'login' ? (
              <>Noch kein Konto?{' '}<button onClick={() => { setMode('register'); setSchritt(1); reset(); }}>Registrieren</button></>
            ) : (
              <>Schon ein Konto?{' '}<button onClick={() => { setMode('login'); setSchritt(1); reset(); }}>Anmelden</button></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
