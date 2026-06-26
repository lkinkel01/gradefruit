'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import styles from './AuthModal.module.css';
import modalStyles from './Modal.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); reset();

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      });
      if (error) setError(error.message);
      else setInfo('Bestätigungs-E-Mail gesendet! Bitte überprüfe dein Postfach.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError('E-Mail oder Passwort falsch.');
      else onClose();
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
      <div className={`${modalStyles.modal} ${modalStyles.open}`} role="dialog" aria-modal="true">
        <div className={modalStyles.mhead}>
          <button className={modalStyles.mclose} onClick={onClose}>✕</button>
          <div className={modalStyles.ptag}>Gradefruit · Mathe-Abi Hessen 2027</div>
          <h2>{mode === 'login' ? 'Anmelden' : 'Registrieren'}</h2>
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
                <label>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" required />
              </div>
            )}
            <div className={styles.field}>
              <label>E-Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@beispiel.de" required />
            </div>
            <div className={styles.field}>
              <label>Passwort</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'register' ? 'Mindestens 6 Zeichen' : '••••••••'} required minLength={6} />
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
