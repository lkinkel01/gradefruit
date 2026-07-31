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
 * Supabase schickt den Nachweis je nach Einstellung in verschiedenen Formen.
 * Beim Zurücksetzen des Passworts ist es die fertige Sitzung im Anker der
 * Adresse (`#access_token=…`) — nachgemessen an einem echten Link, nicht
 * vermutet. Die übrigen Formen werden trotzdem behandelt, weil eine falsche
 * Annahme hier erst auffällt, wenn jemand tatsächlich ausgesperrt ist.
 */
export default function PasswortNeu() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [pruefen, setPruefen] = useState(true);
  const [bereit, setBereit] = useState(false);
  // Warum es nicht ging. „Verbraucht" und „gar kein Nachweis dabei" fühlen sich
  // für den Nutzer gleich an, verlangen aber Verschiedenes von ihm — deshalb
  // sagt die Seite, was sie vorgefunden hat, statt pauschal „gilt nicht mehr".
  const [grund, setGrund] = useState<'verbraucht' | 'ohne-nachweis' | 'unbekannt'>('unbekannt');
  // Der Wortlaut, den Supabase genannt hat. Steht klein unter der Meldung:
  // Ohne ihn ist jede Fehlersuche ein Ratespiel per Screenshot, und genau darin
  // sind hier schon zwei Anläufe verlorengegangen.
  const [technisch, setTechnisch] = useState('');
  const [passwort, setPasswort] = useState('');
  const [wiederholung, setWiederholung] = useState('');
  const [fehler, setFehler] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [fertig, setFertig] = useState(false);

  useEffect(() => {
    let abgebrochen = false;

    /**
     * Gibt es trotz gescheitertem Einlösen bereits eine GÜLTIGE Sitzung?
     *
     * Der Fall ist nicht ausgedacht: Safari lädt Adressen aus der Adresszeile
     * vorab, und dabei läuft diese Seite samt Einlösen schon einmal durch. Beim
     * eigentlichen Aufruf ist der Nachweis dann verbraucht, von einem selbst,
     * eine Sekunde vorher. Die Sitzung aus dem ersten Durchlauf liegt aber noch
     * da und ist genau so viel wert.
     *
     * Geprüft wird mit `getUser()`, nicht mit `getSession()`. Letzteres liest nur
     * den Speicher des Browsers, und dort kann eine längst tote Sitzung liegen.
     * Genau die hat der erste Anlauf gefunden: Das Formular erschien, und erst
     * das Speichern scheiterte. Ein Formular anzubieten, das nicht speichern
     * kann, ist schlimmer als eine ehrliche Absage.
     */
    const sitzungGueltig = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return false;
      const { error } = await supabase.auth.getUser();
      return !error;
    };

    const einloesen = async () => {
      const params = new URLSearchParams(window.location.search);
      const anker = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      // Sagt die Adresse selbst, dass es schiefging (abgelaufen, schon
      // benutzt), ist jeder weitere Versuch sinnlos.
      if (anker.get('error') || params.get('error')) {
        setTechnisch(anker.get('error_code') || params.get('error_code') || anker.get('error') || params.get('error') || '');
        setGrund('verbraucht');
        setBereit(false); setPruefen(false);
        return;
      }

      // Form 1: Die fertige Sitzung steht im Anker. GENAU DAS schickt Supabase
      // beim Zurücksetzen des Passworts.
      //
      // Der Supabase-Client räumt den Anker NICHT von selbst ab: Er ist auf den
      // PKCE-Weg eingestellt und hält deshalb nur nach `?code=` Ausschau. Die
      // fertigen Token im Anker sieht er nie — die Seite meldete dann „Link gilt
      // nicht mehr", obwohl der Link tadellos war und alles Nötige mitbrachte.
      const access_token = anker.get('access_token');
      const refresh_token = anker.get('refresh_token');
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        // Anker entfernen, damit die Token nicht im Verlauf stehen bleiben.
        window.history.replaceState({}, '', window.location.pathname);
        const ok = !error || await sitzungGueltig();
        if (!abgebrochen) {
          if (!ok && error) setTechnisch(error.message);
          setBereit(ok);
          setPruefen(false);
        }
        return;
      }

      // Form 2: PKCE — ein Code in der Adresse.
      const code = params.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        const ok = !error || await sitzungGueltig();
        if (!abgebrochen) {
          if (!ok && error) setTechnisch(error.message);
          setBereit(ok);
          setPruefen(false);
        }
        return;
      }

      // Form 3: Einmal-Kennung, die noch eingelöst werden muss.
      const tokenHash = params.get('token_hash');
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });
        const ok = !error || await sitzungGueltig();
        if (!abgebrochen) {
          if (!ok && error) setTechnisch(error.message);
          setBereit(ok);
          setPruefen(false);
        }
        return;
      }

      // Letzte Möglichkeit: Der Client hatte die Sitzung schon selbst übernommen.
      const { data } = await supabase.auth.getSession();
      if (!abgebrochen) {
        // Nichts in der Adresse und keine Sitzung: Der Aufruf kam nicht aus der
        // E-Mail, sondern etwa aus dem Verlauf oder einem Lesezeichen.
        if (!data.session) setGrund('ohne-nachweis');
        setBereit(!!data.session);
        setPruefen(false);
      }
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
      setFehler('Das hat nicht geklappt. Bitte fordere einen neuen Link an.');
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
              {grund === 'ohne-nachweis'
                ? 'Diese Seite wurde ohne Link geöffnet. Nimm den Knopf aus der E-Mail.'
                : 'Dieser Link wurde schon benutzt oder ist abgelaufen. Fordere einen neuen an.'}
            </p>
            <button type="button" className="btn primary" onClick={() => router.push('/')}>
              Neuen Link anfordern
            </button>
            {technisch && <p className={styles.technisch}>Grund: {technisch}</p>}
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
