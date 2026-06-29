'use client';
import { useState, useEffect } from 'react';
import { View } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { useProgress } from '@/lib/ProgressContext';
import LandingPage from '@/components/LandingPage';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Dashboard from '@/components/Dashboard';
import TopicView from '@/components/TopicView';
import VideosView from '@/components/VideosView';
import TutorsView from '@/components/TutorsView';
import AccountView from '@/components/AccountView';
import CheckoutModal from '@/components/CheckoutModal';
import AuthModal from '@/components/AuthModal';
import AskDrawer from '@/components/AskDrawer';
import styles from './page.module.css';

// Ohne Login darf nur Analysis geöffnet werden (Probezugang)
const FREE_VIEWS: View[] = ['dashboard', 'analysis', 'account', 'landing'];

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const { owned, refresh } = useProgress();

  const [view, setView] = useState<View>('landing');
  const [dark, setDark] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [askOpen, setAskOpen] = useState(false);
  const [askCtx, setAskCtx] = useState('');
  const [askSnippet, setAskSnippet] = useState('');
  const [notice, setNotice] = useState('');

  // Wenn Nutzer eingeloggt ist und noch auf Landing: ins Dashboard
  useEffect(() => {
    if (user && view === 'landing') setView('dashboard');
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    document.body.classList.toggle('navopen', navOpen);
  }, [navOpen]);

  // Rückkehr von der Stripe-Bezahlseite auswerten (?checkout=success|cancel)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('checkout');
    if (!c) return;
    // Query aus der Adresszeile entfernen, damit ein Reload nichts doppelt auslöst
    window.history.replaceState({}, '', window.location.pathname);

    if (c === 'success') {
      const PENDING = 'Zahlung erfolgreich! Dein Vollzugang wird freigeschaltet …';
      setNotice(PENDING);
      setView('dashboard');
      // Der Webhook schaltet frei – wir fragen den Status ein paar Mal nach.
      let tries = 0;
      void refresh();
      const iv = setInterval(async () => {
        tries++;
        await refresh();
        if (tries >= 8) clearInterval(iv);
      }, 1500);
      const fallback = setTimeout(() => {
        setNotice(prev =>
          prev === PENDING
            ? 'Zahlung erhalten. Falls der Vollzugang nicht sofort erscheint, lade die Seite in ein paar Sekunden neu.'
            : prev,
        );
      }, 13000);
      return () => { clearInterval(iv); clearTimeout(fallback); };
    }

    if (c === 'cancel') {
      setNotice('Bezahlung abgebrochen – kein Problem, du kannst es jederzeit erneut versuchen.');
      const t = setTimeout(() => setNotice(''), 6000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sobald der Zugang wirklich aktiv ist, Erfolg bestätigen
  useEffect(() => {
    if (owned && notice.startsWith('Zahlung erfolgreich')) {
      setNotice('✓ Vollzugang ist jetzt aktiv. Viel Erfolg beim Lernen!');
      const t = setTimeout(() => setNotice(''), 5000);
      return () => clearTimeout(t);
    }
  }, [owned, notice]);

  const navigate = (v: View) => {
    // Gesperrte Views → Login oder Checkout verlangen
    if (!user && !FREE_VIEWS.includes(v)) {
      setAuthMode('login');
      setAuthOpen(true);
      return;
    }
    if (user && !owned && !FREE_VIEWS.includes(v)) {
      setCheckoutOpen(true);
      return;
    }
    setView(v);
    setNavOpen(false);
  };

  const openAsk = (ctx: string, snippet: string) => {
    if (!user) { setAuthOpen(true); return; }
    setAskCtx(ctx); setAskSnippet(snippet); setAskOpen(true);
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode); setAuthOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setView('landing');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--muted)', fontFamily: 'inherit' }}>
        Laden…
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <>
        <LandingPage
          isAuthed={!!user}
          owned={owned}
          onEnter={() => user ? setView('dashboard') : openAuth('register')}
          onOpenCheckout={() => user ? setCheckoutOpen(true) : openAuth('register')}
          onSignOut={handleSignOut}
        />
        <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
      </>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'analysis':
      case 'linalg':
      case 'stochastik':
        return (
          <TopicView
            topicId={view}
            owned={owned}
            onOpenCheckout={() => setCheckoutOpen(true)}
            onOpenAsk={openAsk}
          />
        );
      case 'videos': return <VideosView />;
      case 'tutors': return <TutorsView />;
      case 'account': return <AccountView onNavigate={(v) => setView(v as View)} onOpenCheckout={() => setCheckoutOpen(true)} />;
      case 'saved':
        return (
          <div style={{ maxWidth: 820, margin: '0 auto', padding: '30px 26px' }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Gespeichert</h1>
            <p style={{ color: 'var(--faint)', marginTop: 40, textAlign: 'center' }}>Noch nichts gespeichert.</p>
          </div>
        );
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <>
      {notice && (
        <div
          role="status"
          style={{
            position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 200, background: 'var(--surface)', color: 'var(--ink)',
            border: '1px solid var(--line)', boxShadow: '0 10px 30px rgba(20,15,30,.18)',
            borderRadius: 12, padding: '12px 18px', fontSize: 14, maxWidth: '92vw',
            textAlign: 'center', lineHeight: 1.45,
          }}
        >
          {notice}
        </div>
      )}
      <div className={styles.shell}>
        <Sidebar
          view={view}
          owned={owned}
          onNavigate={navigate}
          onOpenCheckout={() => setCheckoutOpen(true)}
        />
        <div className={styles.content}>
          <Topbar
            view={view}
            dark={dark}
            onToggleDark={() => setDark(d => !d)}
            onOpenNav={() => setNavOpen(n => !n)}
            onNavigate={navigate}
            onOpenAuth={() => openAuth('login')}
          />
          {renderContent()}
        </div>
      </div>

      {navOpen && <div className={styles.navScrim} onClick={() => setNavOpen(false)} />}

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
      <AskDrawer open={askOpen} ctx={askCtx} snippet={askSnippet} onClose={() => setAskOpen(false)} />
    </>
  );
}
