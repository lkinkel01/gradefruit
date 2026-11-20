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
    fakt1: { de: 'Hessen', en: 'Hessen' },
    fakt2: { de: 'Jahrgang 2027', en: 'Class of 2027' },
    fakt3: { de: 'Grundkurs und Leistungskurs', en: 'Both course levels' },
    titelAnfang: { de: 'Online-Kurse für', en: 'Online courses for' },
    titelAkzent: { de: 'dein Mathe\u2011Abitur', en: 'your maths A\u2011levels' },
    titelZusatz: { de: '2027 in Hessen', en: '2027 in Hessen' },
    nutzen1: { de: 'Prüfungsnahe Aufgaben', en: 'Exam-style tasks' },
    nutzen2: { de: 'Lösungswege Schritt für Schritt', en: 'Worked solutions step by step' },
    nutzen3: { de: 'Detaillierte Erklärvideos', en: 'Detailed explainer videos' },
    nutzen4: { de: 'KI-Coach rund um die Uhr', en: 'AI coach around the clock' },
    nutzen5: { de: 'Grundkurs und Leistungskurs', en: 'Basic and advanced course' },
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
  galerie: {
    zusammenfassung: { de: 'Zusammenfassung zum Thema', en: 'Topic summary' },
    loesungsweg: { de: 'Lösungsweg Schritt für Schritt', en: 'Worked solution, step by step' },
    videos: { de: 'Erklärvideos zu jedem Thema', en: 'Explainer videos for every topic' },
    wiederholen: { de: 'Wiederholen, was noch sitzt', en: 'Revise what has not stuck' },
  },
  bandMut: {
    titel: { de: 'Du musst nicht verzweifeln.', en: 'You are not stuck with it.' },
    zeile: {
      de: 'Die meisten, die in Mathe hängen, sind nicht zu dumm dafür. Ihnen fehlt eine Grundlage von vor zwei Jahren, und niemand merkt es.',
      en: 'Most people stuck in maths are not too stupid for it. They are missing something from two years ago, and nobody notices.',
    },
    knopf: { de: 'Die Geschichte dahinter', en: 'The story behind it' },
  },
  bandGruende: {
    titel: { de: 'Warum Gradefruit?', en: 'Why Gradefruit?' },
    zeile: {
      de: 'Gebaut für eine Prüfung, nicht für alle.',
      en: 'Built for one exam, not for all of them.',
    },
  },
  bandFragen: {
    titel: { de: 'Häufige Fragen.', en: 'Common questions.' },
    knopf: { de: 'Alle Fragen', en: 'All questions' },
  },
  bandLernsystem: {
    name: { de: 'Lernsystem', en: 'How it works' },
    titel: { de: 'Einfaches Lernsystem.', en: 'A simple way to study.' },
    zeile: {
      de: 'Lesen oder ansehen. Zu allem gibt es Erklärvideos.',
      en: 'Read it or watch it. Everything comes with a video.',
    },
    knopf: { de: 'Zum Lernsystem', en: 'See how it works' },
  },
  bandKurse: {
    name: { de: 'Kurse', en: 'Courses' },
    titel: { de: 'Einmal zahlen, kein Abo.', en: 'Pay once, no subscription.' },
    zeile: {
      de: 'Grundkurs {gk}, Leistungskurs {lk}.\nDer Zugang gilt bis zum Ende des Prüfungszeitraums.',
      en: 'Basic course {gk}, advanced course {lk}.\nAccess runs until the end of the exam period.',
    },
    knopf: { de: 'Zu den Kursen', en: 'See courses' },
    zeileKurz: {
      de: 'Zugang bis zum Ende des Prüfungszeitraums. Keine automatische Verlängerung.',
      en: 'Access until the end of the exam period. No automatic renewal.',
    },
    gk: { de: 'Grundkurs', en: 'Basic course' },
    lk: { de: 'Leistungskurs', en: 'Advanced course' },
    einmalig: { de: 'einmalig', en: 'one-off' },
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
      de: 'Die ersten Inhalte jedes Themas stehen dir offen. Für alles Weitere brauchst du einen Kurs.',
      en: 'The first content of every topic is open to you. Everything beyond needs a course.',
    },
    zeileMitKurs: {
      de: 'Dein Zugang gilt bis zum Ende des Prüfungszeitraums.',
      en: 'Your access runs until the end of the exam period.',
    },
  },
  bandUeberUns: {
    name: { de: 'Über uns', en: 'About' },
    titelAnfang: { de: 'Für', en: 'Built for' },
    titelAkzent: { de: 'dein', en: 'your' },
    titelEnde: { de: 'Bundesland gebaut.', en: 'state.' },
    titel: { de: 'Für dein Bundesland gebaut.', en: 'Built for your state.' },
    punkt1: { de: 'Hessen 2027, Grundkurs und Leistungskurs', en: 'Hessen 2027, both course levels' },
    punkt2: { de: 'Nach dem hessischen Kerncurriculum', en: 'Follows the Hessen curriculum' },
    punkt3: { de: 'Im Format der Abiturprüfungen', en: 'In the format of the exam papers' },
    zeile: {
      de: 'Kein Kurs für alle Bundesländer. Einer für deins.',
      en: 'Not a course for every state. One for yours.',
    },
    knopf: { de: 'Mehr über uns', en: 'More about us' },
  },
  bandSchluss: {
    titel: { de: 'Fang an.', en: 'Get started.' },
    zeile: { de: 'Die ersten Inhalte sind für dich kostenlos. Überzeug dich selbst.', en: 'The first content is free for you. See for yourself.' },
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
