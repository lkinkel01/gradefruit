'use client';
import { useState, useEffect } from 'react';
import { View } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
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
const FREE_VIEWS: View[] = ['dashboard', 'analysis', 'account'];

export default function Home() {
  const { user, loading } = useAuth();

  const [view, setView] = useState<View>('landing');
  const [owned, setOwned] = useState(false);
  const [dark, setDark] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [askOpen, setAskOpen] = useState(false);
  const [askCtx, setAskCtx] = useState('');
  const [askSnippet, setAskSnippet] = useState('');

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
          onEnter={() => user ? setView('dashboard') : openAuth('register')}
          onOpenCheckout={() => user ? setCheckoutOpen(true) : openAuth('register')}
        />
        <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onPurchase={() => { setOwned(true); setCheckoutOpen(false); setView('dashboard'); }} />
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
      case 'account': return <AccountView onNavigate={(v) => setView(v as View)} />;
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
        onPurchase={() => { setOwned(true); setCheckoutOpen(false); }}
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
