'use client';
import { useEffect, useRef } from 'react';

// Scroll-Reveal: hängt [data-reveal] an das Element und toggelt [data-shown],
// sobald es in den Viewport kommt (einmalig). Die eigentliche Bewegung macht
// CSS ([data-reveal] in globals.css). Ohne IntersectionObserver oder bei
// reduced-motion ist der Inhalt sofort sichtbar — es bleibt nie etwas
// unsichtbar hängen.
export function useReveal<T extends HTMLElement = HTMLDivElement>(margin = '-12% 0px') {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.setAttribute('data-shown', '');

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    el.setAttribute('data-reveal', '');
    // Schon im Viewport (über der Falz)? Sofort zeigen, kein Aufblitzen.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92) {
      reveal();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal();
            io.disconnect();
          }
        }
      },
      { rootMargin: margin, threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  return ref;
}
