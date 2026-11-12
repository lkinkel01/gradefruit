'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Thema setzen — an Body UND Dokument.
 *
 * Die Fläche, die beim Überziehen am Rand sichtbar wird, gehört dem Dokument,
 * nicht dem Seitenkörper; Variablen vom <body> reichen nicht nach oben.
 * Dieselbe Logik lag vorher nur in page.tsx und wurde für jede weitere Seite
 * gebraucht — deshalb liegt sie jetzt an einer Stelle.
 */
export function themaSetzen(dunkel: boolean) {
  const body = document.body;
  body.classList.add('theme-switching');
  body.classList.toggle('dark', dunkel);
  if (dunkel) document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
  window.setTimeout(() => body.classList.remove('theme-switching'), 60);
  try {
    localStorage.setItem('gf-theme', dunkel ? 'dark' : 'light');
  } catch {
    /* Speicher gesperrt — das Thema gilt dann nur für diese Sitzung. */
  }
}

/**
 * Das Inline-Skript in layout.tsx hat die Body-Klasse schon vor dem ersten
 * Rendern gesetzt (kein Aufblitzen). React gleicht sich hier einmalig daran an.
 */
export function useDunkelmodus() {
  const [dunkel, setDunkel] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDunkel(document.body.classList.contains('dark')), 0);
    return () => window.clearTimeout(t);
  }, []);

  const waehlen = useCallback((wert: boolean) => {
    themaSetzen(wert);
    setDunkel(wert);
  }, []);

  return { dunkel, waehlen };
}
