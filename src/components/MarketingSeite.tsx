'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import AuthModal from './AuthModal';
import SeitenKopf from './SeitenKopf';
import SeitenFuss from './SeitenFuss';
import { useAuth } from '@/lib/AuthContext';
import styles from './MarketingSeite.module.css';

/** Damit Unterseiten das Anmeldefenster öffnen können, ohne es selbst zu halten. */
const AuthDialog = createContext<{ anmelden: () => void; registrieren: () => void }>({
  anmelden: () => {},
  registrieren: () => {},
});

export const useAuthDialog = () => useContext(AuthDialog);

/**
 * Rahmen für alle öffentlichen Seiten: Kopf, Inhalt, Fußzeile, Anmeldefenster.
 *
 * Bis hierher war die gesamte Außendarstellung eine einzige lange Seite mit
 * Sprungmarken. Jetzt hat jeder Bereich eine eigene Adresse — teilbar,
 * auffindbar, und der Zurück-Knopf des Browsers tut das Erwartete.
 */
export default function MarketingSeite({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [authOffen, setAuthOffen] = useState(false);
  const [authModus, setAuthModus] = useState<'login' | 'register'>('login');

  const oeffne = (modus: 'login' | 'register') => {
    setAuthModus(modus);
    setAuthOffen(true);
  };

  const dialog = useMemo(
    () => ({ anmelden: () => oeffne('login'), registrieren: () => oeffne('register') }),
    [],
  );

  return (
    <AuthDialog.Provider value={dialog}>
    <div className={styles.seite}>
      <a className={styles.skipLink} href="#inhalt">Zum Inhalt</a>

      <SeitenKopf
        isAuthed={Boolean(user)}
        onLogin={() => oeffne('login')}
        onRegister={() => oeffne('register')}
        onEnter={() => router.push('/')}
        onSignOut={() => void signOut()}
      />

      <main id="inhalt">{children}</main>

      <SeitenFuss />

      <AuthModal
        open={authOffen}
        onClose={() => setAuthOffen(false)}
        onAuthenticated={() => {
          setAuthOffen(false);
          router.push('/');
        }}
        initialMode={authModus}
      />
    </div>
    </AuthDialog.Provider>
  );
}
