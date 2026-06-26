'use client';
import { useState, useEffect } from 'react';
import { View } from '@/lib/types';
import LandingPage from '@/components/LandingPage';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Dashboard from '@/components/Dashboard';
import TopicView from '@/components/TopicView';
import VideosView from '@/components/VideosView';
import TutorsView from '@/components/TutorsView';
import CheckoutModal from '@/components/CheckoutModal';
import AskDrawer from '@/components/AskDrawer';
import styles from './page.module.css';

export default function Home() {
  const [view, setView] = useState<View>('landing');
  const [owned, setOwned] = useState(false);
  const [dark, setDark] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [askCtx, setAskCtx] = useState('');
  const [askSnippet, setAskSnippet] = useState('');

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    document.body.classList.toggle('navopen', navOpen);
  }, [navOpen]);

  const openAsk = (ctx: string, snippet: string) => {
    setAskCtx(ctx); setAskSnippet(snippet); setAskOpen(true);
  };

  if (view === 'landing') {
    return (
      <>
        <LandingPage onEnter={() => setView('dashboard')} onOpenCheckout={() => setCheckoutOpen(true)} />
        <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onPurchase={() => { setOwned(true); setCheckoutOpen(false); setView('dashboard'); }} />
      </>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard onNavigate={setView} />;
      case 'analysis':
      case 'linalg':
      case 'stochastik':
        return <TopicView topicId={view} owned={owned} onOpenCheckout={() => setCheckoutOpen(true)} onOpenAsk={openAsk} />;
      case 'videos': return <VideosView />;
      case 'tutors': return <TutorsView />;
      case 'saved':
        return (
          <div style={{ maxWidth: 820, margin: '0 auto', padding: '30px 26px' }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Gespeichert</h1>
            <p style={{ color: 'var(--faint)', marginTop: 40, textAlign: 'center' }}>Noch nichts gespeichert.</p>
          </div>
        );
      default: return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <>
      <div className={styles.shell}>
        <Sidebar view={view} owned={owned} onNavigate={(v) => { setView(v); setNavOpen(false); }} onOpenCheckout={() => setCheckoutOpen(true)} />
        <div className={styles.content}>
          <Topbar view={view} dark={dark} onToggleDark={() => setDark(d => !d)} onOpenNav={() => setNavOpen(n => !n)} />
          {renderContent()}
        </div>
      </div>

      {navOpen && <div className={styles.navScrim} onClick={() => setNavOpen(false)} />}

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} onPurchase={() => { setOwned(true); setCheckoutOpen(false); }} />
      <AskDrawer open={askOpen} ctx={askCtx} snippet={askSnippet} onClose={() => setAskOpen(false)} />
    </>
  );
}
