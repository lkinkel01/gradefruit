'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase';
import styles from './AccountView.module.css';

interface Props {
  onNavigate: (v: string) => void;
}

export default function AccountView({ onNavigate }: Props) {
  const { user, signOut } = useAuth();
  const supabase = createClient();
  const [name, setName] = useState(user?.user_metadata?.full_name ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase.auth.updateUser({ data: { full_name: name } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  if (!user) return null;

  const initials = (name || user.email || 'U').slice(0, 2).toUpperCase();
  const provider = user.app_metadata?.provider;

  return (
    <div className={styles.page}>
      <h1 className={styles.ph1}>Mein Konto</h1>

      <div className={styles.card}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.meta}>
          <div className={styles.metaName}>{name || '—'}</div>
          <div className={styles.metaEmail}>{user.email}</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Profil bearbeiten</div>
        <div className={styles.field}>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" />
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
        <div className={styles.sectionTitle}>Anmeldung</div>
        <div className={styles.infoRow}>
          <span>Methode</span>
          <span className={styles.tag}>{provider === 'google' ? 'Google' : 'E-Mail & Passwort'}</span>
        </div>
        <div className={styles.infoRow}>
          <span>Registriert seit</span>
          <span>{new Date(user.created_at).toLocaleDateString('de-DE')}</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Zugang</div>
        <div className={styles.planRow}>
          <div>
            <b>Gratis-Zugang</b>
            <p>Für den Vollzugang alle Themen und Aufgaben freischalten.</p>
          </div>
          <button className="btn primary btn sm" style={{ fontSize: 13, flexShrink: 0 }}>
            Vollzugang — 79 €
          </button>
        </div>
      </div>

      <div className={styles.danger}>
        <button className={styles.signoutBtn} onClick={handleSignOut}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Abmelden
        </button>
      </div>
    </div>
  );
}
