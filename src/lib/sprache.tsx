'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Sprache = 'de' | 'en';

const SCHLUESSEL = 'gf-sprache';

/**
 * Zweisprachigkeit für die öffentlichen Seiten.
 *
 * Bewusst klein gehalten: ein Wörterbuch, ein Haken, kein Framework. Die
 * Kursinhalte selbst bleiben deutsch — es ist eine deutsche Abiturprüfung,
 * und eine übersetzte Aufgabe wäre eine andere Aufgabe.
 */
export const TEXTE = {
  kopf: {
    anmelden: { de: 'Anmelden', en: 'Sign in' },
    abmelden: { de: 'Abmelden', en: 'Sign out' },
    registrieren: { de: 'Registrieren', en: 'Sign up' },
    weiterlernen: { de: 'Weiterlernen', en: 'Continue' },
    menueOeffnen: { de: 'Menü öffnen', en: 'Open menu' },
    menueSchliessen: { de: 'Menü schließen', en: 'Close menu' },
    einstellungen: { de: 'Einstellungen', en: 'Settings' },
    zurStartseite: { de: 'Zur Startseite', en: 'To the home page' },
  },
  menue: {
    lernsystem: { de: 'Lernsystem', en: 'How it works' },
    kurse: { de: 'Kurse', en: 'Courses' },
    ueberUns: { de: 'Über uns', en: 'About' },
    fragen: { de: 'Fragen', en: 'FAQ' },
  },
  start: {
    zeile: { de: 'Mathe-Abitur · Hessen 2027 · Nach deinem Lehrplan', en: 'Maths A-levels · Hessen 2027 · Built on your syllabus' },
    titelAnfang: { de: 'Online-Kurse für', en: 'Online courses for' },
    titelAkzent: { de: 'dein Mathe\u2011Abitur 2027 in Hessen', en: 'your 2027 maths A\u2011levels in Hessen' },
    unterzeile: {
      de: 'Sowohl Grundkurs als auch Leistungskurs, nach dem hessischen Kerncurriculum.',
      en: 'Both the basic and the advanced course, based on the Hessen syllabus.',
    },
    nutzen1: { de: 'Prüfungsnahe Aufgaben', en: 'Exam-style tasks' },
    nutzen2: { de: 'Lösungswege Schritt für Schritt', en: 'Worked solutions step by step' },
    nutzen3: { de: 'Erklärvideos', en: 'Explainer videos' },
    nutzen4: { de: 'KI-Coach rund um die Uhr', en: 'AI coach around the clock' },
    titelVersteckt: {
      de: 'Gradefruit: Vorbereitungskurse, Mathe-Abitur, Hessen 2027',
      en: 'Gradefruit: preparation courses for the Maths A-levels in Hessen 2027',
    },
    kostenlosTesten: { de: 'Kostenlos testen', en: 'Try for free' },
    kurse: { de: 'Kurse', en: 'Courses' },
    mehr: { de: 'Mehr', en: 'More' },
    faktenPruefung: { de: 'Hessen 2027', en: 'Hessen 2027' },
    faktenPruefungSub: { de: 'Dein Bundesland, dein Jahrgang', en: 'Your state, your cohort' },
    faktenKurse: { de: 'GK und LK', en: 'Basic and advanced' },
    faktenKurseSub: { de: 'Kurse für beide Niveaus', en: 'Courses for both levels' },
    faktenTageSub: { de: 'Bis zur Prüfung', en: 'Until the exam' },
    tage: { de: 'Tage', en: 'days' },
  },
  bandLernsystem: {
    name: { de: 'Lernsystem', en: 'How it works' },
    titel: { de: 'Einfaches Lernsystem.', en: 'A simple way to study.' },
    zeile: {
      de: 'Zusammenfassung lesen, Übungsaufgabe rechnen, mit dem Lösungsweg vergleichen, Erklärvideo ansehen und am Ende prüfungsnahe Aufgaben lösen.',
      en: 'Read the summary, work through an exercise, compare it with the solution, watch the explainer video, then tackle exam-style tasks.',
    },
    knopf: { de: 'Zum Lernsystem', en: 'See how it works' },
  },
  bandKurse: {
    name: { de: 'Kurse', en: 'Courses' },
    titel: { de: 'Einmal zahlen, kein Abo.', en: 'Pay once, no subscription.' },
    zeile: {
      de: 'Grundkurs {gk}, Leistungskurs {lk}. Der Zugang gilt bis zum Ende des Prüfungszeitraums.',
      en: 'Basic course {gk}, advanced course {lk}. Access runs until the end of the exam period.',
    },
    knopf: { de: 'Zu den Kursen', en: 'See courses' },
    titelEinKurs: { de: 'Noch ein Kurs fehlt dir.', en: 'One course still missing.' },
    zeileEinKurs: {
      de: 'Du hast einen Kurs freigeschaltet. Der zweite ist einzeln dazubuchbar.',
      en: 'You have one course. The second can be added separately.',
    },
    titelAlle: { de: 'Alles freigeschaltet.', en: 'Everything unlocked.' },
    zeileAlle: {
      de: 'Grundkurs und Leistungskurs liegen bereit. Keine weiteren Kosten.',
      en: 'Basic and advanced course are ready. No further costs.',
    },
    knopfKurs: { de: 'Zum Kurs', en: 'Go to course' },
  },
  bandSchlussZustand: {
    titelAngemeldet: { de: 'Weiter, wo du warst.', en: 'Pick up where you left off.' },
    zeileOhneKurs: {
      de: 'Analysis ist für dich freigeschaltet. Lineare Algebra und Stochastik brauchen einen Kurs.',
      en: 'Calculus is unlocked for you. Linear algebra and stochastics need a course.',
    },
    zeileMitKurs: {
      de: 'Dein Zugang gilt bis zum Ende des Prüfungszeitraums.',
      en: 'Your access runs until the end of the exam period.',
    },
  },
  bandUeberUns: {
    name: { de: 'Über uns', en: 'About' },
    titel: { de: 'Für dein Bundesland gebaut.', en: 'Built for your state.' },
    zeile: {
      de: 'Mathe-Abitur in Hessen 2027, sowohl für den Grundkurs als auch für den Leistungskurs.',
      en: 'Maths A-levels in Hessen 2027, for the basic course as well as the advanced one.',
    },
    knopf: { de: 'Mehr über uns', en: 'More about us' },
  },
  bandSchluss: {
    titel: { de: 'Fang an.', en: 'Get started.' },
    zeile: { de: 'Analysis ist kostenlos. Ohne Zahlungsdaten, ohne Frist.', en: 'Calculus is free. No payment details, no time limit.' },
    titelGast: { de: 'Fang an.', en: 'Get started.' },
  },
  einstellungen: {
    name: { de: 'Einstellungen', en: 'Settings' },
    titel: { de: 'Deine Einstellungen.', en: 'Your settings.' },
    darstellung: { de: 'Darstellung', en: 'Appearance' },
    darstellungText: { de: 'Gilt auf diesem Gerät. Die Wahl bleibt gespeichert.', en: 'Applies on this device. Your choice is remembered.' },
    sprache: { de: 'Sprache', en: 'Language' },
    spracheText: {
      de: 'Die Seiten gibt es auf Deutsch und Englisch. Die Kursinhalte bleiben deutsch, weil die Prüfung es ist.',
      en: 'These pages come in German and English. Course content stays German, because the exam is.',
    },
    konto: { de: 'Konto', en: 'Account' },
    kontoText: {
      de: 'Kauf, Rechnungen und Löschung deines Kontos findest du nach dem Anmelden unter „Mein Konto“.',
      en: 'Purchases, invoices and account deletion are available under “My account” once you are signed in.',
    },
    rechtliches: { de: 'Rechtliches', en: 'Legal' },
  },
  fuss: {
    hinweis: { de: '© 2026 Gradefruit · Mathe-Abitur Hessen 2027 · Zahlung über Stripe', en: '© 2026 Gradefruit · Maths A-levels Hessen 2027 · Payments via Stripe' },
  },
} as const;

type Pfad = { [K in keyof typeof TEXTE]: `${K & string}.${keyof (typeof TEXTE)[K] & string}` }[keyof typeof TEXTE];

/**
 * Die Sprache liegt bewusst in einem gemeinsamen Zustand, nicht in jedem
 * Bauteil einzeln: Sonst hätte jede Komponente ihre eigene Wahl, und ein
 * Umschalten in den Einstellungen würde Kopfzeile und Fußzeile nicht
 * erreichen.
 */
const Ctx = createContext<{ sprache: Sprache; waehlen: (wert: Sprache) => void }>({
  sprache: 'de',
  waehlen: () => {},
});

export function SpracheProvider({ children }: { children: ReactNode }) {
  const [sprache, setSprache] = useState<Sprache>('de');

  useEffect(() => {
    // Erst im nächsten Takt setzen: Ein setState direkt im Effekt löst eine
    // zweite Renderrunde aus, bevor die erste gezeichnet ist.
    const t = window.setTimeout(() => {
      try {
        const gespeichert = localStorage.getItem(SCHLUESSEL);
        if (gespeichert === 'en' || gespeichert === 'de') {
          setSprache(gespeichert);
          document.documentElement.lang = gespeichert;
        }
      } catch {
        /* Speicher gesperrt: Es bleibt bei Deutsch. */
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const waehlen = useCallback((wert: Sprache) => {
    setSprache(wert);
    document.documentElement.lang = wert;
    try {
      localStorage.setItem(SCHLUESSEL, wert);
    } catch {
      /* Speicher gesperrt */
    }
  }, []);

  const wert = useMemo(() => ({ sprache, waehlen }), [sprache, waehlen]);
  return <Ctx.Provider value={wert}>{children}</Ctx.Provider>;
}

export function useSprache() {
  const { sprache, waehlen } = useContext(Ctx);

  const t = useCallback(
    (pfad: Pfad, werte?: Record<string, string>) => {
      const [gruppe, schluessel] = pfad.split('.') as [keyof typeof TEXTE, string];
      const eintrag = (TEXTE[gruppe] as Record<string, Record<Sprache, string>>)[schluessel];
      let text = eintrag?.[sprache] ?? eintrag?.de ?? pfad;
      if (werte) for (const [k, v] of Object.entries(werte)) text = text.replaceAll(`{${k}}`, v);
      return text;
    },
    [sprache],
  );

  return { sprache, waehlen, t };
}
