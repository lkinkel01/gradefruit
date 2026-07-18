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
import ReviewView from '@/components/ReviewView';
import TutorsView from '@/components/TutorsView';
import AccountView from '@/components/AccountView';
import CheckoutModal from '@/components/CheckoutModal';
import AuthModal from '@/components/AuthModal';
import AskDrawer from '@/components/AskDrawer';
import { GrapefruitSpinner } from '@/components/Logo';
import styles from './page.module.css';

// Ohne Kauf frei zugänglich (Probezugang): Übersicht, alle Themenseiten und Konto.
// Achtung: Inhalt bleibt pro Stufe gesperrt – nur Analysis ist gratis, der Rest
// zeigt Gästen nur die Vorschau-Sperre mit Kauf-Hinweis.
// 'tutors' ist eine reine Info-Seite (Nachhilfe „bald verfügbar") – kein Kauf nötig.
// 'review' (Wiederholen) ist persönlicher Lernfortschritt – nie hinter der Bezahlschranke.
const FREE_VIEWS: View[] = ['dashboard', 'analysis', 'linalg', 'stochastik', 'account', 'landing', 'tutors', 'review'];
// Themen-Seiten mit eigener Bezahlschranke – Eingeloggte dürfen sie immer öffnen
// (die Sperre pro Kursstufe steckt direkt in der Themenseite).
const TOPIC_VIEWS: View[] = ['analysis', 'linalg', 'stochastik'];

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const { owned, ownedLk, refresh } = useProgress();

  const [view, setView] = useState<View>('landing');
  const [dark, setDark] = useState(false);
  // Kursstufe: Wer gekauft hat, hat sich entschieden. Nur Gäste (und wer beide
  // Kurse besitzt) wählen selbst; die Wahl wird lokal gemerkt.
  const [prefLevel, setPrefLevel] = useState<'gk' | 'lk'>('gk');
  const [navOpen, setNavOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutCourse, setCheckoutCourse] = useState<'gk' | 'lk'>('gk');
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [askOpen, setAskOpen] = useState(false);
  const [askCtx, setAskCtx] = useState('');
  const [askSnippet, setAskSnippet] = useState('');
  const [notice, setNotice] = useState('');
  // Zählt bei jeder Navigation hoch. TopicView liest daraufhin den gewünschten
  // Tab (gf-open-tab) neu ein – auch wenn man schon im selben Thema ist
  // (Sidebar-Untermenü: „Zusammenfassung"/„Übungen" im aktiven Thema).
  const [navSignal, setNavSignal] = useState(0);
  // Aktiver Tab der geöffneten Themenseite — gemeldet von TopicView, damit
  // Breadcrumb (Topbar) und Sidebar-Untermenü denselben Standort zeigen.
  const [topicTab, setTopicTab] = useState<'zusammenfassung' | 'uebungen'>('zusammenfassung');
  const [topicSection, setTopicSection] = useState<string | null>(null);

  // Deep-Link aus dem Reel-Modus (gf-open-topic): einmalig beim Start
  // konsumieren und ins gewünschte Thema springen. Es gibt KEINEN
  // automatischen Sprung ins Dashboard mehr: Eingeloggte bleiben auf der
  // Startseite — auch bei Tab-Wechsel, Fokus-Events oder Session-Refresh,
  // denn dieser Effekt läuft pro Seitenaufruf höchstens einmal (Ref-Guard;
  // spätere Auth-Events können keine Navigation mehr auslösen).
  const jumpConsumed = useRef(false);
  useEffect(() => {
    if (loading || !user || jumpConsumed.current) return;
    jumpConsumed.current = true;
    try {
      const jump = localStorage.getItem('gf-open-topic');
      if (jump === 'analysis' || jump === 'linalg' || jump === 'stochastik') {
        localStorage.removeItem('gf-open-topic');
        // Bewusst ohne Cleanup: Der Frame darf auch nach StrictModes
        // doppeltem Effekt-Lauf genau einmal feuern (Ref verhindert Doppel-Konsum).
        requestAnimationFrame(() => {
          setView(jump);
          setNavSignal(n => n + 1);
        });
      }
    } catch { /* Speicher gesperrt */ }
  }, [user, loading]);

  // Das Inline-Skript in layout.tsx hat das gespeicherte Theme schon vor dem
  // ersten Rendern als Body-Klasse gesetzt (kein Aufblitzen). React gleicht
  // seinen Zustand hier einmalig daran an.
  useEffect(() => {
    const initialDark = document.body.classList.contains('dark');
    let initialLevel: 'gk' | 'lk' | null = null;
    try {
      const l = localStorage.getItem('gf-level');
      if (l === 'gk' || l === 'lk') initialLevel = l;
    } catch { /* Speicher gesperrt */ }
    const frame = requestAnimationFrame(() => {
      setDark(initialDark);
      if (initialLevel) setPrefLevel(initialLevel);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Besitzt jemand genau einen Kurs, zählt der Kauf. Sonst die eigene Wahl.
  const level: 'gk' | 'lk' = owned && !ownedLk ? 'gk' : ownedLk && !owned ? 'lk' : prefLevel;
  const levelChoosable = owned === ownedLk; // niemand oder beide gekauft
  const chooseLevel = (l: 'gk' | 'lk') => {
    setPrefLevel(l);
    try { localStorage.setItem('gf-level', l); } catch { /* Speicher gesperrt */ }
  };

  // Theme umschalten. WICHTIG (vor allem für Safari/WebKit): Erst die
  // Body-Klasse SYNCHRON umstellen, dann per State-Änderung die betroffenen
  // Bereiche komplett neu aufbauen (der key-Wechsel im JSX weiter unten).
  // Safari aktualisiert die Farb-Variablen bereits vorhandener Elemente beim
  // Umschalten NICHT zuverlässig – nur frisch erzeugte Elemente lesen die neuen
  // Farben. Deshalb reicht kein Neuzeichnen; die Elemente müssen neu entstehen.
  const setTheme = (next: boolean) => {
    const body = document.body;
    body.classList.add('theme-switching');       // Übergänge kurz aus
    body.classList.toggle('dark', next);          // Farb-Variablen umstellen
    setTimeout(() => body.classList.remove('theme-switching'), 60);
    try { localStorage.setItem('gf-theme', next ? 'dark' : 'light'); } catch { /* Speicher gesperrt */ }
    setDark(next);                                 // löst den Neuaufbau (key) aus
  };

  // Wechselt bei jedem Theme-Wechsel und zwingt React, die Bereiche neu
  // aufzubauen, damit sie mit den neuen Farben entstehen (Safari-Fix).
  const themeKey = dark ? 'dark' : 'light';

  useEffect(() => {
    document.body.classList.toggle('navopen', navOpen);
  }, [navOpen]);

  // Rückkehr von der Stripe-Bezahlseite auswerten (?checkout=success|cancel)
  useEffect(() => {
    let frame = 0;
    const params = new URLSearchParams(window.location.search);
    const c = params.get('checkout');
    if (!c) return;
    // Query aus der Adresszeile entfernen, damit ein Reload nichts doppelt auslöst
    window.history.replaceState({}, '', window.location.pathname);

    if (c === 'success') {
      const PENDING = 'Zahlung erfolgreich! Dein Vollzugang wird freigeschaltet …';
      frame = requestAnimationFrame(() => {
        setNotice(PENDING);
        setView('dashboard');
      });
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
      return () => { cancelAnimationFrame(frame); clearInterval(iv); clearTimeout(fallback); };
    }

    if (c === 'cancel') {
      frame = requestAnimationFrame(() => {
        setNotice('Bezahlung abgebrochen. Du kannst es jederzeit erneut versuchen.');
      });
      const t = setTimeout(() => setNotice(''), 6000);
      return () => { cancelAnimationFrame(frame); clearTimeout(t); };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sobald der Zugang wirklich aktiv ist, Erfolg bestätigen
  useEffect(() => {
    if ((owned || ownedLk) && notice.startsWith('Zahlung erfolgreich')) {
      const start = setTimeout(() => {
        setNotice('✓ Vollzugang ist jetzt aktiv. Viel Erfolg beim Lernen!');
      }, 0);
      const t = setTimeout(() => setNotice(''), 5000);
      return () => { clearTimeout(start); clearTimeout(t); };
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
    // Die App wechselt Ansichten innerhalb derselben Route. Ohne explizites
    // Zurücksetzen würde dabei die Scrollposition der vorherigen Ansicht
    // erhalten bleiben und der neue Seitenkopf könnte unter der Topbar liegen.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (!TOPIC_VIEWS.includes(v)) setTopicSection(null);
    setView(v);
    setNavOpen(false);
    setNavSignal(n => n + 1);
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
    navigate('landing');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <GrapefruitSpinner label="Einen Moment …" />
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <>
        <LandingPage
          key={themeKey}
          isAuthed={!!user}
          owned={owned}
          ownedLk={ownedLk}
          dark={dark}
          onToggleDark={() => setTheme(!dark)}
          onEnter={() => navigate(user ? 'dashboard' : 'analysis')}
          onLogin={() => openAuth('login')}
          onRegister={() => openAuth('register')}
          onOpenCheckout={(course) => user ? openCheckout(course) : openAuth('register')}
          onSignOut={handleSignOut}
        />
        <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} course={checkoutCourse} />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
      </>
    );
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} level={level} choosable={levelChoosable} onChooseLevel={chooseLevel} />;
      case 'analysis':
      case 'linalg':
      case 'stochastik':
        return (
          <TopicView
            topicId={view}
            level={level}
            owned={owned}
            ownedLk={ownedLk}
            navSignal={navSignal}
            onOpenCheckout={openCheckout}
            onOpenAsk={openAsk}
            onNavigate={navigate}
            onTabChange={setTopicTab}
            onSectionChange={setTopicSection}
          />
        );
      case 'videos': return <VideosView />;
      case 'tutors': return <TutorsView />;
      case 'account': return <AccountView onNavigate={(v) => setView(v as View)} onOpenCheckout={openCheckout} />;
      case 'review':
        return <ReviewView level={level} onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} level={level} choosable={levelChoosable} onChooseLevel={chooseLevel} />;
    }
  };

  return (
    <>
      {notice && (
        <div role="status" className={styles.notice}>
          {notice}
        </div>
      )}
      <div className={styles.shell} key={themeKey}>
        <Sidebar
          view={view}
          topicTab={topicTab}
          topicSection={topicSection}
          owned={owned}
          ownedLk={ownedLk}
          level={level}
          onNavigate={navigate}
          onOpenCheckout={() => openCheckout('gk')}
        />
        <div className={styles.content}>
          <Topbar
            view={view}
            topicTab={topicTab}
            topicSection={topicSection}
            dark={dark}
            onToggleDark={() => setTheme(!dark)}
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
