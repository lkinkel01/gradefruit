'use client';
import { useState, useEffect, useRef } from 'react';
import { NavigateTo, TopicTab, View } from '@/lib/types';
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
const APP_VIEWS: View[] = ['landing', 'dashboard', 'analysis', 'linalg', 'stochastik', 'videos', 'review', 'tutors', 'account'];

interface LocationState {
  view: View;
  tab: TopicTab;
  itemId: string | null;
}

function readLocationState(): LocationState {
  const params = new URLSearchParams(window.location.search);
  const candidate = params.get('view');
  const view = APP_VIEWS.includes(candidate as View) ? candidate as View : 'landing';
  const tab: TopicTab = params.get('tab') === 'uebungen' ? 'uebungen' : 'zusammenfassung';
  const itemId = tab === 'uebungen' ? params.get('task') : params.get('section');
  return { view, tab, itemId };
}

function locationFor(view: View, tab: TopicTab, itemId: string | null): string {
  if (view === 'landing') return window.location.pathname;
  const params = new URLSearchParams({ view });
  if (TOPIC_VIEWS.includes(view)) {
    params.set('tab', tab);
    if (itemId) params.set(tab === 'uebungen' ? 'task' : 'section', itemId);
  }
  return `${window.location.pathname}?${params.toString()}`;
}

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const { owned, ownedLk, refresh } = useProgress();

  const [view, setView] = useState<View>('landing');
  const [routeReady, setRouteReady] = useState(false);
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
  const [topicTab, setTopicTab] = useState<TopicTab>('zusammenfassung');
  const [topicItemId, setTopicItemId] = useState<string | null>(null);
  const [topicItemLabel, setTopicItemLabel] = useState<string | null>(null);

  // Die App bleibt eine View-State-Machine auf derselben Next.js-Route.
  // Der sichtbare Standort wird zusätzlich in der URL gespiegelt, damit
  // Reload, Zurück und Vorwärts dieselbe Ansicht wiederherstellen.
  useEffect(() => {
    let frame = 0;
    const applyLocation = () => {
      const location = readLocationState();
      setView(location.view);
      setTopicTab(location.tab);
      setTopicItemId(location.itemId);
      setTopicItemLabel(location.itemId);
      setNavOpen(false);
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    frame = requestAnimationFrame(() => {
      applyLocation();
      setRouteReady(true);
    });
    window.addEventListener('popstate', applyLocation);
    return () => {
      window.removeEventListener('popstate', applyLocation);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Ein bewusster Login führt zur Übersicht. Eine bereits vorhandene Session
  // verändert den aktuellen URL-Standort dagegen nicht. Deep-Links aus dem
  // Reel-Modus werden weiterhin einmalig konsumiert.
  const jumpConsumed = useRef(false);
  useEffect(() => {
    if (loading || !routeReady || !user || jumpConsumed.current) return;
    const frame = requestAnimationFrame(() => {
      jumpConsumed.current = true;
      try {
        const afterAuth = localStorage.getItem('gf-after-auth');
        if (afterAuth === 'dashboard') {
          localStorage.removeItem('gf-after-auth');
          setView('dashboard');
          setTopicItemId(null);
          setTopicItemLabel(null);
          window.history.replaceState({}, '', locationFor('dashboard', 'zusammenfassung', null));
          return;
        }

        const jump = localStorage.getItem('gf-open-topic');
        if (jump === 'analysis' || jump === 'linalg' || jump === 'stochastik') {
          localStorage.removeItem('gf-open-topic');
          const requestedTab = localStorage.getItem('gf-open-tab') === 'uebungen'
            ? 'uebungen'
            : 'zusammenfassung';
          const requestedItem = requestedTab === 'uebungen'
            ? localStorage.getItem('gf-open-task')
            : localStorage.getItem('gf-open-summary');
          localStorage.removeItem('gf-open-tab');
          localStorage.removeItem('gf-open-task');
          localStorage.removeItem('gf-open-summary');
          setTopicTab(requestedTab);
          setTopicItemId(requestedItem);
          setTopicItemLabel(requestedItem);
          setView(jump);
          window.history.replaceState({}, '', locationFor(jump, requestedTab, requestedItem));
        }
      } catch { /* Speicher gesperrt */ }
    });
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [user, loading, routeReady]);

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
    // Query aus der Adresszeile entfernen, damit ein Reload nichts doppelt
    // auslöst. Nach Erfolg ist die Übersicht zugleich der neue URL-Standort.
    window.history.replaceState(
      {},
      '',
      c === 'success'
        ? locationFor('dashboard', 'zusammenfassung', null)
        : window.location.pathname,
    );

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

  const navigate: NavigateTo = (v, destination = {}) => {
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

    let nextTab: TopicTab = destination.tab ?? 'zusammenfassung';
    let nextItemId = destination.itemId ?? null;
    let nextItemLabel = destination.itemLabel ?? nextItemId;

    if (TOPIC_VIEWS.includes(v) && destination.tab === undefined) {
      try {
        const pendingTab = localStorage.getItem('gf-open-tab');
        if (pendingTab === 'zusammenfassung' || pendingTab === 'uebungen') {
          nextTab = pendingTab;
          localStorage.removeItem('gf-open-tab');
        }
        const pendingItem = nextTab === 'uebungen'
          ? localStorage.getItem('gf-open-task')
          : localStorage.getItem('gf-open-summary');
        if (pendingItem) {
          nextItemId = pendingItem;
          nextItemLabel = pendingItem;
        }
        localStorage.removeItem('gf-open-task');
        localStorage.removeItem('gf-open-summary');
      } catch { /* Speicher gesperrt */ }
    }

    if (TOPIC_VIEWS.includes(v)) {
      setTopicTab(nextTab);
      setTopicItemId(nextItemId);
      setTopicItemLabel(nextItemLabel);
    } else {
      setTopicItemId(null);
      setTopicItemLabel(null);
    }

    setView(v);
    setNavOpen(false);
    const nextLocation = locationFor(v, nextTab, nextItemId);
    const currentLocation = `${window.location.pathname}${window.location.search}`;
    if (nextLocation !== currentLocation) {
      window.history[destination.replace ? 'replaceState' : 'pushState']({}, '', nextLocation);
    }
  };

  const openAsk = (ctx: string, snippet: string) => {
    if (!user) { setAuthOpen(true); return; }
    setAskCtx(ctx); setAskSnippet(snippet); setAskOpen(true);
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode); setAuthOpen(true);
  };

  const handleAuthenticated = () => {
    setAuthOpen(false);
    try { localStorage.removeItem('gf-after-auth'); } catch { /* Speicher gesperrt */ }
    navigate('dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('landing');
  };

  if (loading || !routeReady) {
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
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthenticated={handleAuthenticated}
          initialMode={authMode}
        />
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
            tab={topicTab}
            itemId={topicItemId}
            onOpenCheckout={openCheckout}
            onOpenAsk={openAsk}
            onNavigate={navigate}
            onLocationChange={(tab, itemId, itemLabel) => {
              navigate(view, { tab, itemId, itemLabel });
            }}
            onItemLabelChange={setTopicItemLabel}
          />
        );
      case 'videos': return <VideosView />;
      case 'tutors': return <TutorsView />;
      case 'account': return <AccountView onNavigate={(v) => navigate(v as View)} onOpenCheckout={openCheckout} />;
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
          topicItemId={topicItemId}
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
            topicItemLabel={topicItemLabel}
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
        onAuthenticated={handleAuthenticated}
        initialMode={authMode}
      />
      <AskDrawer open={askOpen} ctx={askCtx} snippet={askSnippet} onClose={() => setAskOpen(false)} />
    </>
  );
}
