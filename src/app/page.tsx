'use client';
import { useState, useEffect, useRef } from 'react';
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

// Ohne Login frei zugänglich (Probezugang): Übersicht, alle Themenseiten und Konto.
// Achtung: Inhalt bleibt pro Stufe gesperrt – nur Analysis ist gratis, der Rest
// zeigt Gästen nur die Vorschau-Sperre mit Kauf-Hinweis.
const FREE_VIEWS: View[] = ['dashboard', 'analysis', 'linalg', 'stochastik', 'account', 'landing'];
// Themen-Seiten mit eigener Bezahlschranke – Eingeloggte dürfen sie immer öffnen
// (die Sperre pro Kursstufe steckt direkt in der Themenseite).
const TOPIC_VIEWS: View[] = ['analysis', 'linalg', 'stochastik'];

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const { owned, ownedLk, refresh } = useProgress();

  const [view, setView] = useState<View>('landing');
  const [dark, setDark] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutCourse, setCheckoutCourse] = useState<'gk' | 'lk'>('gk');
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

  // Das Inline-Skript in layout.tsx hat das gespeicherte Theme schon vor dem
  // ersten Rendern als Body-Klasse gesetzt (kein Aufblitzen). React gleicht
  // seinen Zustand hier einmalig daran an.
  useEffect(() => {
    setDark(document.body.classList.contains('dark'));
  }, []);

  // Theme anwenden und dauerhaft merken, sobald der Nutzer es umschaltet. Der
  // erste Durchlauf wird übersprungen, damit die vom Inline-Skript gesetzte
  // Klasse nicht kurz entfernt wird – genau das würde das Flackern auslösen.
  const themeReady = useRef(false);
  useEffect(() => {
    if (!themeReady.current) { themeReady.current = true; return; }
    const body = document.body;
    // Wichtig: Übergänge während des Wechsels kurz abschalten und ein
    // Neuzeichnen erzwingen. Sonst behalten einzelne Flächen den alten Modus,
    // bis man die Seite neu lädt (das war der halb-hell/halb-dunkel-Fehler).
    body.classList.add('theme-switching');
    body.classList.toggle('dark', dark);
    // Harten Repaint erzwingen: manche Browser zeichnen beim Theme-Wechsel
    // nicht ALLE Flächen neu (halb hell / halb dunkel, bis man neu lädt). Ein
    // reines Reflow (offsetHeight) reicht dafür nicht. Body für einen Moment aus
    // dem Render-Baum nehmen und wieder einsetzen erzwingt ein vollständiges
    // Neuzeichnen. Läuft synchron vor dem nächsten Frame – kein Flackern.
    // Scroll-Position sichern & wiederherstellen (display:none setzt sie sonst
    // auf 0 zurück).
    const sx = window.scrollX, sy = window.scrollY;
    const prevDisplay = body.style.display;
    body.style.display = 'none';
    void body.offsetHeight;
    body.style.display = prevDisplay;
    window.scrollTo(sx, sy);
    // Übergänge gleich wieder anschalten (für Hover-Effekte etc.). setTimeout
    // statt requestAnimationFrame, damit es auch in Hintergrund-Tabs sicher feuert.
    const t = setTimeout(() => body.classList.remove('theme-switching'), 40);
    try { localStorage.setItem('gf-theme', dark ? 'dark' : 'light'); } catch { /* Speicher gesperrt */ }
    return () => clearTimeout(t);
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
    if ((owned || ownedLk) && notice.startsWith('Zahlung erfolgreich')) {
      setNotice('✓ Vollzugang ist jetzt aktiv. Viel Erfolg beim Lernen!');
      const t = setTimeout(() => setNotice(''), 5000);
      return () => clearTimeout(t);
    }
  }, [owned, ownedLk, notice]);

  const openCheckout = (course: 'gk' | 'lk' = 'gk') => {
    // Kaufen geht nur mit Konto – Gäste zuerst zur Registrierung schicken.
    if (!user) { openAuth('register'); return; }
    setCheckoutCourse(course);
    setCheckoutOpen(true);
  };

  const navigate = (v: View) => {
    // Nicht eingeloggt → Login verlangen (außer freie Views)
    if (!user && !FREE_VIEWS.includes(v)) {
      setAuthMode('login');
      setAuthOpen(true);
      return;
    }
    // Eingeloggt, aber ohne Zugang: Themen-Seiten dürfen trotzdem geöffnet
    // werden – die Bezahlschranke steckt jetzt direkt in der Themenseite
    // (pro Kursstufe). Andere kostenpflichtige Views (Videos, Tutoren)
    // zeigen weiterhin den Checkout.
    if (user && !owned && !ownedLk && !FREE_VIEWS.includes(v) && !TOPIC_VIEWS.includes(v)) {
      openCheckout('gk');
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
          dark={dark}
          onToggleDark={() => setDark(d => !d)}
          onEnter={() => user ? setView('dashboard') : setView('analysis')}
          onLogin={() => openAuth('login')}
          onOpenCheckout={() => user ? openCheckout('gk') : openAuth('register')}
          onSignOut={handleSignOut}
        />
        <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} course={checkoutCourse} />
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
            ownedLk={ownedLk}
            onOpenCheckout={openCheckout}
            onOpenAsk={openAsk}
            onNavigate={navigate}
          />
        );
      case 'videos': return <VideosView />;
      case 'tutors': return <TutorsView />;
      case 'account': return <AccountView onNavigate={(v) => setView(v as View)} onOpenCheckout={openCheckout} />;
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
          ownedLk={ownedLk}
          onNavigate={navigate}
          onOpenCheckout={() => openCheckout('gk')}
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
        course={checkoutCourse}
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
