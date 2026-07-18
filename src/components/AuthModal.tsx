'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import styles from './AuthModal.module.css';
import modalStyles from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
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

export default function AuthModal({ open, onClose, initialMode = 'login' }: Props) {
  const supabase = createClient();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setError(''); setInfo(''); };

  // Beim Öffnen dem gewünschten Modus folgen. Ohne das bliebe das Fenster im
  // Modus des ERSTEN Öffnens hängen ("Registrieren" öffnete den Login).
  useEffect(() => {
    let frame = 0;
    if (open) {
      frame = requestAnimationFrame(() => {
        setMode(initialMode);
        reset();
      });
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [open, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); reset();

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      });
      if (error) setError(germanAuthError(error.message));
      else if (data.session) onClose(); // E-Mail-Bestätigung ist aus -> sofort eingeloggt
      else setInfo('Bestätigungs-E-Mail gesendet! Bitte überprüfe dein Postfach (auch den Spam-Ordner).');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(/email not confirmed/i.test(error.message)
          ? 'Bitte bestätige zuerst deine E-Mail – der Link ist in deinem Postfach.'
          : 'E-Mail oder Passwort falsch.');
      } else onClose();
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
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
          <div className={modalStyles.ptag}>Gradefruit · Mathe-Abi Hessen 2027</div>
          <h2 id="auth-title">{mode === 'login' ? 'Anmelden' : 'Registrieren'}</h2>
          <p>{mode === 'login' ? 'Mit deinem Konto einloggen.' : 'Konto erstellen und loslegen.'}</p>
        </div>
        <div className={modalStyles.mbody}>
          <button className={styles.googleBtn} onClick={handleGoogle} type="button">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.09-6.09C34.46 3.08 29.5 1 24 1 14.82 1 7.07 6.49 3.64 14.21l7.1 5.52C12.47 13.37 17.77 9.5 24 9.5z"/><path fill="#4285F4" d="M46.6 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.73c-.55 2.98-2.22 5.5-4.73 7.2l7.25 5.63C43.4 37.44 46.6 31.4 46.6 24.5z"/><path fill="#FBBC05" d="M10.74 28.27A14.55 14.55 0 0 1 9.5 24c0-1.49.25-2.93.69-4.28l-7.1-5.51A23.94 23.94 0 0 0 0 24c0 3.86.92 7.51 2.55 10.73l8.19-6.46z"/><path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.49-4.95l-7.25-5.63c-2.01 1.35-4.58 2.08-6.24 2.08-6.23 0-11.52-3.86-13.26-9.23l-8.19 6.46C7.07 41.51 14.82 47 24 47z"/></svg>
            Mit Google anmelden
          </button>

          <div className={styles.divider}><span>oder</span></div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className={styles.field}>
                <label htmlFor="auth-name">Name</label>
                <input id="auth-name" type="text" value={name} onChange={e => setName(e.target.value)} autoComplete="name" required />
              </div>
            )}
            <div className={styles.field}>
              <label htmlFor="auth-email">E-Mail</label>
              <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            <div className={styles.field}>
              <label htmlFor="auth-password">Passwort</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                required
                minLength={6}
              />
              {mode === 'register' && <span className={styles.fieldHint}>Mindestens 6 Zeichen</span>}
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {info && <div className={styles.info}>{info}</div>}

            <button className="btn primary" style={{ width: '100%', marginTop: 8 }} type="submit" disabled={loading}>
              {loading ? '…' : mode === 'login' ? 'Anmelden' : 'Konto erstellen'}
            </button>
          </form>

          <div className={styles.switchMode}>
            {mode === 'login' ? (
              <>Noch kein Konto?{' '}<button onClick={() => { setMode('register'); reset(); }}>Registrieren</button></>
            ) : (
              <>Schon ein Konto?{' '}<button onClick={() => { setMode('login'); reset(); }}>Anmelden</button></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
