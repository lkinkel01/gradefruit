'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import { createClient } from '@/lib/supabase';
import LernErinnerung from './LernErinnerung';
import styles from './AccountView.module.css';
import { LogoutIcon, PlayIcon, TutorIcon, ArrowRightIcon } from './UiIcons';
import { useImAppRahmen } from '@/lib/nativeApp';
import { PASSWORT_REGELN } from '@/lib/passwort';

interface Props {
  onNavigate: (v: string) => void;
  onOpenCheckout: (course: 'gk' | 'lk') => void;
  dark: boolean;
  onToggleDark: () => void;
}

export default function AccountView({ onNavigate, onOpenCheckout, dark, onToggleDark }: Props) {
  const { user, session, signOut, username: gespeicherterName, anzeigeName, refreshProfil } = useAuth();
  // In der App gibt es keine Seitenleiste. Erklärvideos und 1:1 Nachhilfe wären
  // dort sonst überhaupt nicht erreichbar — deshalb hängen sie unter „Konto",
  // so wie WhatsApp alles Seltenere in die Einstellungen legt.
  const imApp = useImAppRahmen();
  const { owned, ownedLk, plan, planLk } = useProgress();
  const supabase = createClient();
  const [name, setName] = useState(user?.user_metadata?.full_name ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  // Benutzername: zweiter Weg zur Anmeldung. Steht in `public.users`, nicht in
  // den Anmeldedaten — Supabase kennt dort nur E-Mail und Passwort.
  const [benutzername, setBenutzername] = useState('');
  const [nameFehler, setNameFehler] = useState('');
  const [portalBusy, setPortalBusy] = useState(false);
  // Passwort ändern — bewusst eingeklappt: Man tut es selten, und ein
  // dauerhaft offenes Passwortfeld im Konto lädt zum Verwechseln ein.
  const [pwOffen, setPwOffen] = useState(false);
  const [pwNeu, setPwNeu] = useState('');
  const [pwWdh, setPwWdh] = useState('');
  const [pwMeldung, setPwMeldung] = useState('');
  const [pwFehler, setPwFehler] = useState(false);
  const [pwLaeuft, setPwLaeuft] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>((user?.user_metadata?.avatar_url as string) ?? '');

  // Der Benutzername kommt aus dem Auth-Kontext (dort einmal je Anmeldung
  // geholt), das Feld übernimmt ihn beim ersten Rendern.
  useEffect(() => { setBenutzername(gespeicherterName ?? ''); }, [gespeicherterName]);

  // Profilbild: klein gerechnet und direkt im Nutzerprofil abgelegt, damit
  // dafür kein zusätzlicher Speicher nötig ist.
  const handleAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const bitmap = await createImageBitmap(file);
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const side = Math.min(bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setAvatarUrl(dataUrl);
    await supabase.auth.updateUser({ data: { avatar_url: dataUrl } });
  };

  // Öffnet das Stripe-Kundenportal (Abo ansehen/ändern/kündigen)
  const openPortal = async () => {
    if (portalBusy || !session?.access_token) return;
    setPortalBusy(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        window.location.href = data.url as string;
        return;
      }
    } catch {
      /* Fehler ignorieren – Button wird wieder aktiv */
    }
    setPortalBusy(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setNameFehler('');
    await supabase.auth.updateUser({ data: { full_name: name } });

    if (user) {
      const gewuenscht = benutzername.trim();
      const { error } = await supabase
        .from('users')
        .update({ username: gewuenscht || null })
        .eq('id', user.id);
      if (error) {
        // 23505 = schon vergeben, 23514 = Form stimmt nicht (siehe
        // supabase/username.sql). Alles andere ist unerwartet und soll auch so
        // klingen, statt einen falschen Grund zu behaupten.
        setNameFehler(
          error.code === '23505'
            ? 'Dieser Benutzername ist schon vergeben. Bitte wähle einen anderen.'
            : error.code === '23514'
              ? '3–24 Zeichen, erlaubt sind Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich.'
              : 'Der Benutzername konnte nicht gespeichert werden. Bitte versuch es erneut.',
        );
        setSaving(false);
        return;
      }
    }

    // Damit Begrüßung und Kürzel sofort mitziehen, statt erst beim nächsten
    // Laden.
    await refreshProfil();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const passwortAendern = async () => {
    setPwMeldung(''); setPwFehler(false);
    if (PASSWORT_REGELN.some(r => !r.erfuellt(pwNeu))) {
      setPwMeldung('Das Passwort erfüllt noch nicht alle Bedingungen.'); setPwFehler(true); return;
    }
    if (pwNeu !== pwWdh) {
      setPwMeldung('Die beiden Passwörter stimmen nicht überein.'); setPwFehler(true); return;
    }
    setPwLaeuft(true);
    const { error } = await supabase.auth.updateUser({ password: pwNeu });
    setPwLaeuft(false);
    if (error) {
      setPwMeldung('Das hat nicht geklappt. Melde dich neu an und versuch es dann noch einmal.');
      setPwFehler(true);
      return;
    }
    setPwNeu(''); setPwWdh('');
    setPwMeldung('Passwort geändert.');
  };

  // Konto löschen: bewusst zweistufig und mit Tippbestätigung, weil der
  // Schritt nicht rückgängig zu machen ist.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    if (deleting || confirmText.trim().toUpperCase() !== 'LÖSCHEN') return;
    if (!session?.access_token) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setDeleteError(data?.message ?? 'Das Konto konnte nicht gelöscht werden.');
        setDeleting(false);
        return;
      }
      await signOut();
      onNavigate('landing');
    } catch {
      setDeleteError('Das Konto konnte nicht gelöscht werden. Bitte prüfe deine Verbindung.');
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  if (!user) return null;

  // Reihenfolge wie bei der Begrüßung: Name, sonst Benutzername. Anders als die
  // Begrüßung darf die Kachel aber nicht leer bleiben — deshalb zuletzt die
  // E-Mail.
  const kachelName = (anzeigeName || '').trim();
  const parts = kachelName.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (kachelName || user.email || 'U').slice(0, 2).toUpperCase();

  // Ein Kurs pro Zeile: nur der Kursname. Kurse ohne Zugang stehen grau
  // darunter und tragen den Hinweis „inaktiv".
  const COURSE_NAME = {
    gk: 'Mathematik-Abiturvorbereitung 2027 · Grundkurs',
    lk: 'Mathematik-Abiturvorbereitung 2027 · Leistungskurs',
  } as const;

  const courseRow = (course: 'gk' | 'lk', isOwned: boolean, coursePlan: string | null) => (
    <div key={course} className={`${styles.courseRow} ${isOwned ? '' : styles.courseOff}`}>
      <span className={styles.courseName}>{COURSE_NAME[course]}</span>
      {isOwned ? (
        coursePlan === 'subscription' ? (
          <button className="btn light sm" style={{ fontSize: 13, flexShrink: 0 }} onClick={openPortal} disabled={portalBusy}>
            {portalBusy ? '…' : 'Abo verwalten'}
          </button>
        ) : null
      ) : (
        <span className={styles.courseTag}>inaktiv</span>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.ph1}>Dein Gradefruit-Konto</h1>

      <div className={styles.card}>
        <label className={styles.avatarWrap} title="Profilbild auswählen">
          {/* Bewusst immer die Initialen-Kachel: Ein von außen mitgebrachtes
              Profilbild (etwa aus einem Google-Konto) sah fremd aus und zeigte
              nur einen Buchstaben. Die Kachel trägt dieselben Initialen wie
              oben rechts, in Gradefruits Orange. */}
          <span className={styles.avatar}>{initials}</span>
          <span className={styles.avatarEdit}>Ändern</span>
          <input type="file" accept="image/*" onChange={handleAvatar} hidden />
        </label>
        <div className={styles.meta}>
          <div className={styles.metaName}>{anzeigeName || 'Ohne Namen'}</div>
          <div className={styles.metaEmail}>{user.email}</div>
        </div>
        <button className={styles.signoutTop} onClick={handleSignOut}>
          <LogoutIcon size={15} />
          Abmelden
        </button>
      </div>

      {/* Erinnerung und Erscheinungsbild stehen bewusst oben: Das sind die
          Schalter, die man tatsächlich benutzt. Profil und Zugang darunter. */}
      <LernErinnerung />

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Erscheinungsbild</h2>
        <div className={styles.infoRow}>
          <span>Dunkler Modus</span>
          <button
            type="button"
            className={`${styles.themeBtn} ${dark ? styles.themeBtnOn : ''}`}
            role="switch"
            aria-checked={dark}
            onClick={onToggleDark}
          >
            <span className={styles.themeKnob} />
          </button>
        </div>
      </div>

      {imApp && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Mehr</h2>
          {/* Erklärvideos gehören zum bezahlten Kurs. Ohne Zugang bleibt die
              Zeile weg, statt in einen Kaufhinweis zu führen — in der App darf
              es keinen geben. */}
          {(owned || ownedLk) && (
            <button type="button" className={styles.linkRow} onClick={() => onNavigate('videos')}>
              <PlayIcon size={17} />
              <span className={styles.linkLabel}>Erklärvideos</span>
              <ArrowRightIcon size={16} />
            </button>
          )}
          <button type="button" className={styles.linkRow} onClick={() => onNavigate('tutors')}>
            <TutorIcon size={17} />
            <span className={styles.linkLabel}>1:1 Nachhilfe</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Profil bearbeiten</h2>
        <div className={styles.field}>
          <label htmlFor="konto-name">Name</label>
          <input
            id="konto-name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            placeholder="Wie sollen wir dich ansprechen?"
          />
          <span className={styles.feldHinweis}>
            Freiwillig. Ohne Namen und Benutzernamen wirst du nicht persönlich angesprochen.
          </span>
        </div>
        <div className={styles.field}>
          <label htmlFor="konto-benutzername">Benutzername</label>
          <input
            id="konto-benutzername"
            value={benutzername}
            onChange={e => { setBenutzername(e.target.value); setNameFehler(''); }}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="noch keiner"
          />
          <span className={`${styles.feldHinweis} ${nameFehler ? styles.feldFehler : ''}`}>
            {nameFehler || 'Damit kannst du dich anmelden, ohne deine E-Mail einzutippen.'}
          </span>
        </div>
        <div className={styles.field}>
          <label>E-Mail</label>
          <input value={user.email ?? ''} disabled title="E-Mail kann nicht geändert werden" />
        </div>
        <button className="btn primary" onClick={handleSave} disabled={saving} style={{ marginTop: 4 }}>
          {saved ? '✓ Gespeichert' : saving ? '…' : 'Speichern'}
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Passwort</h2>
        {!pwOffen ? (
          <button type="button" className="btn light sm" onClick={() => setPwOffen(true)}>
            Passwort ändern
          </button>
        ) : (
          <>
            <div className={styles.field}>
              <label htmlFor="pw-neu">Neues Passwort</label>
              <input
                id="pw-neu"
                type="password"
                value={pwNeu}
                onChange={e => { setPwNeu(e.target.value); setPwMeldung(''); }}
                autoComplete="new-password"
              />
              <ul className={styles.regeln}>
                {PASSWORT_REGELN.map(regel => {
                  const ok = regel.erfuellt(pwNeu);
                  return (
                    <li key={regel.text} className={ok ? styles.regelOk : undefined}>
                      <span aria-hidden="true">{ok ? '✓' : '·'}</span>
                      {regel.text}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className={styles.field}>
              <label htmlFor="pw-wdh">Noch einmal</label>
              <input
                id="pw-wdh"
                type="password"
                value={pwWdh}
                onChange={e => { setPwWdh(e.target.value); setPwMeldung(''); }}
                autoComplete="new-password"
              />
            </div>
            {pwMeldung && (
              <p className={`${styles.feldHinweis} ${pwFehler ? styles.feldFehler : ''}`}>{pwMeldung}</p>
            )}
            <div className={styles.dangerActions}>
              <button className="btn primary" onClick={passwortAendern} disabled={pwLaeuft}>
                {pwLaeuft ? '…' : 'Speichern'}
              </button>
              <button
                className="btn light sm"
                onClick={() => { setPwOffen(false); setPwNeu(''); setPwWdh(''); setPwMeldung(''); }}
                disabled={pwLaeuft}
              >
                Abbrechen
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Zugang</h2>
        <div className={styles.infoRow}>
          <span>Registriert seit</span>
          <span>{new Date(user.created_at).toLocaleDateString('de-DE')}</span>
        </div>
        <div className={styles.courseList}>
          {courseRow('gk', owned, plan)}
          {courseRow('lk', ownedLk, planLk)}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Konto löschen</h2>
        {!deleteOpen ? (
          <>
            <p className={styles.dangerText}>
              Dein Konto und alle zugehörigen Daten werden endgültig entfernt.
              Ein laufendes Abo wird dabei automatisch beendet.
            </p>
            <button className={styles.dangerBtn} onClick={() => setDeleteOpen(true)}>
              Konto löschen
            </button>
          </>
        ) : (
          <>
            <p className={styles.dangerText}>
              Das lässt sich nicht rückgängig machen. Dein Lernfortschritt und dein
              Zugang gehen verloren. Tippe zur Bestätigung <b>LÖSCHEN</b> ein.
            </p>
            <div className={styles.field}>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="LÖSCHEN"
                aria-label="Zur Bestätigung LÖSCHEN eingeben"
              />
            </div>
            {deleteError && <p className={styles.dangerError}>{deleteError}</p>}
            <div className={styles.dangerActions}>
              <button
                className={styles.dangerBtn}
                onClick={handleDelete}
                disabled={deleting || confirmText.trim().toUpperCase() !== 'LÖSCHEN'}
              >
                {deleting ? 'Wird gelöscht …' : 'Endgültig löschen'}
              </button>
              <button
                className="btn light sm"
                onClick={() => { setDeleteOpen(false); setConfirmText(''); setDeleteError(''); }}
                disabled={deleting}
              >
                Abbrechen
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
