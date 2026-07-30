'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { bewussteAnmeldung } from '@/lib/anmeldung';
import { BrandMark } from '@/components/BrandMark';
import { PASSWORT_REGELN } from '@/lib/passwort';
import styles from './page.module.css';

/**
 * Neues Passwort setzen — hier landet der Link aus der E-Mail.
 *
 * Eine echte Route, kein View-Zustand: Der Link kommt von außen und muss ohne
 * die App im Rücken funktionieren. (Dieselbe Begründung wie bei `/feed`.)
 *
 * Supabase schickt den Nachweis in drei möglichen Formen, je nach Einstellung
 * und Alter des Projekts. Statt eine davon zu raten, werden alle drei
 * behandelt — die falsche Annahme wäre hier besonders ärgerlich, weil man den
 * Fehler erst bemerkt, wenn jemand tatsächlich ausgesperrt ist.
 */
export default function PasswortNeu() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [pruefen, setPruefen] = useState(true);
  const [bereit, setBereit] = useState(false);
  const [passwort, setPasswort] = useState('');
  const [wiederholung, setWiederholung] = useState('');
  const [fehler, setFehler] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [fertig, setFertig] = useState(false);

  useEffect(() => {
    let abgebrochen = false;

    const einloesen = async () => {
      const params = new URLSearchParams(window.location.search);

      // Form 1: PKCE — ein Code in der Adresse.
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!abgebrochen) { setBereit(!error); setPruefen(false); }
        return;
      }

      // Form 2: Einmal-Kennung, die noch eingelöst werden muss.
      const tokenHash = params.get('token_hash');
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        if (!abgebrochen) { setBereit(!error); setPruefen(false); }
        return;
      }

      // Form 3: Die Sitzung steckte im Anker der Adresse (#access_token=…) und
      // wurde vom Supabase-Client beim Laden bereits übernommen.
      const { data } = await supabase.auth.getSession();
      if (!abgebrochen) { setBereit(!!data.session); setPruefen(false); }
    };

    void einloesen();
    return () => { abgebrochen = true; };
  }, [supabase]);

  const speichern = async (event: React.FormEvent) => {
    event.preventDefault();
    setFehler('');

    if (PASSWORT_REGELN.some(r => !r.erfuellt(passwort))) {
      setFehler('Das Passwort erfüllt noch nicht alle Bedingungen.');
      return;
    }
    if (passwort !== wiederholung) {
      setFehler('Die beiden Passwörter stimmen nicht überein.');
      return;
    }

    setLaeuft(true);
    const { error } = await supabase.auth.updateUser({ password: passwort });
    if (error) {
      setFehler('Das hat nicht geklappt. Fordere den Link bitte neu an — er gilt nur eine Stunde.');
      setLaeuft(false);
      return;
    }

    // Nach dem Zurücksetzen ist man angemeldet. Ohne diese Markierung würde die
    // Leerlauf-Sperre auf den Zeitstempel der vorigen Sitzung schauen und
    // sofort wieder abmelden — genau der Fehler, der Leon ausgesperrt hat.
    bewussteAnmeldung();
    setFertig(true);
    setLaeuft(false);
  };

  return (
    <main className={styles.seite}>
      <div className={styles.mitte}>
        <BrandMark size={40} />
        <h1 className={styles.titel}>
          {fertig ? 'Passwort geändert' : 'Neues Passwort'}
        </h1>

        {pruefen && <p className={styles.text}>Einen Moment …</p>}

        {!pruefen && !bereit && !fertig && (
          <>
            <p className={styles.text}>
              Dieser Link gilt nicht mehr. Sie sind eine Stunde lang gültig und
              lassen sich nur einmal verwenden.
            </p>
            <button type="button" className="btn primary" onClick={() => router.push('/')}>
              Neuen Link anfordern
            </button>
          </>
        )}

        {fertig && (
          <>
            <p className={styles.text}>
              Ab jetzt gilt dein neues Passwort — auf der Webseite und in der App.
            </p>
            <button type="button" className="btn primary" onClick={() => router.push('/?view=dashboard')}>
              Weiter zum Lernen
            </button>
          </>
        )}

        {!pruefen && bereit && !fertig && (
          <form onSubmit={speichern} className={styles.form}>
            <div className={styles.feld}>
              <label htmlFor="pw-neu">Neues Passwort</label>
              <input
                id="pw-neu"
                name="password"
                type="password"
                value={passwort}
                onChange={e => { setPasswort(e.target.value); setFehler(''); }}
                autoComplete="new-password"
                required
              />
              <ul className={styles.regeln}>
                {PASSWORT_REGELN.map(regel => {
                  const ok = regel.erfuellt(passwort);
                  return (
                    <li key={regel.text} className={ok ? styles.regelOk : undefined}>
                      <span aria-hidden="true">{ok ? '✓' : '·'}</span>
                      {regel.text}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className={styles.feld}>
              <label htmlFor="pw-wdh">Noch einmal</label>
              <input
                id="pw-wdh"
                name="password-confirm"
                type="password"
                value={wiederholung}
                onChange={e => { setWiederholung(e.target.value); setFehler(''); }}
                autoComplete="new-password"
                required
              />
            </div>

            {fehler && <p className={styles.fehler}>{fehler}</p>}

            <button className="btn primary" type="submit" disabled={laeuft}>
              {laeuft ? '…' : 'Passwort speichern'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
