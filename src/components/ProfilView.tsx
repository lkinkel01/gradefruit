'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import styles from './ProfilView.module.css';

/**
 * Profil bearbeiten — eine eigene Seite, wie bei Instagram.
 *
 * Vorher standen Name und Benutzername mitten zwischen Erscheinungsbild,
 * Passwort und Kontolöschung auf der Kontoseite. Was zusammengehört, gehört
 * auch zusammen: Wer sein Profil ändern will, geht auf eine Seite, die genau
 * das tut.
 *
 * Bewusst ohne Erklärtexte unter den Feldern. Zwei beschriftete Felder
 * erklären sich; Sätze darunter machen aus einer Kleinigkeit eine Lektüre.
 */
export default function ProfilView({ onFertig }: { onFertig: () => void }) {
  const { user, username: gespeicherterName, refreshProfil } = useAuth();
  const supabase = createClient();

  const [name, setName] = useState<string>((user?.user_metadata?.full_name as string) ?? '');
  const [benutzernameEntwurf, setBenutzername] = useState<string | null>(null);
  const benutzername = benutzernameEntwurf ?? gespeicherterName ?? '';
  const [fehler, setFehler] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [fertig, setFertig] = useState(false);

  const speichern = async () => {
    if (!user) return;
    setLaeuft(true);
    setFehler('');

    await supabase.auth.updateUser({ data: { full_name: name.trim() } });

    const gewuenscht = benutzername.trim();
    const { error } = await supabase.from('users')
      .update({ username: gewuenscht || null })
      .eq('id', user.id);

    if (error) {
      // 23505 = vergeben, 23514 = Form stimmt nicht (siehe supabase/username.sql).
      setFehler(
        error.code === '23505'
          ? 'Dieser Benutzername ist schon vergeben.'
          : error.code === '23514'
            ? '3 bis 24 Zeichen, erlaubt sind Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich.'
            : 'Konnte nicht gespeichert werden. Bitte versuch es erneut.',
      );
      setLaeuft(false);
      return;
    }

    await refreshProfil();
    setLaeuft(false);
    setFertig(true);
    setTimeout(() => setFertig(false), 1800);
  };

  if (!user) return null;

  return (
    <div className={styles.seite}>
      <div className={styles.feld}>
        <label htmlFor="profil-name">Name</label>
        <input
          id="profil-name"
          value={name}
          onChange={e => { setName(e.target.value); setFehler(''); }}
          autoComplete="name"
          placeholder="Wie sollen wir dich ansprechen?"
        />
      </div>

      <div className={styles.feld}>
        <label htmlFor="profil-benutzername">Benutzername</label>
        <input
          id="profil-benutzername"
          value={benutzername}
          onChange={e => { setBenutzername(e.target.value); setFehler(''); }}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="noch keiner"
        />
      </div>

      <div className={`${styles.feld} ${styles.gesperrt}`}>
        <label htmlFor="profil-email">E-Mail</label>
        <input id="profil-email" value={user.email ?? ''} disabled title="E-Mail kann nicht geändert werden" />
      </div>

      {fehler && <p className={styles.fehler}>{fehler}</p>}

      <div className={styles.knoepfe}>
        <button className="btn primary" onClick={speichern} disabled={laeuft}>
          {laeuft ? '…' : fertig ? 'Gespeichert' : 'Speichern'}
        </button>
        <button className="btn light" onClick={onFertig} disabled={laeuft}>
          Zurück
        </button>
      </div>
    </div>
  );
}
