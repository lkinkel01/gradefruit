'use client';
import { useEffect, useRef, useState } from 'react';

// Gradefruit-Logo: eine Grapefruit im Querschnitt, flach und ruhig gezeichnet.
// Feine Segmentlinien statt Clipart-Keilen, Farben nah an der echten Frucht.
// Ein Segment ist dezent gefüllt: der Lern-Keil. Über `filled` lassen sich
// später 0 bis 6 Segmente füllen (Fortschritt, Level, kleine Animationen) –
// dieselbe Form trägt dann das ganze Belohnungssystem.

const SEGMENTS = [0, 60, 120, 180, 240, 300];

// Ein Keil zwischen zwei Segmentlinien (oben beginnend), wird rotiert.
const WEDGE = 'M24 25 L24 10.4 A14.6 14.6 0 0 1 36.65 17.7 Z';

export function Logo({ size = 28, filled = 1 }: { size?: number; filled?: number }) {
  const n = Math.max(0, Math.min(6, filled));
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* Frucht: flache, warme Scheibe */}
      <circle cx="24" cy="25" r="20" fill="#EE7457" />
      {/* Schale: feiner heller Ring */}
      <circle cx="24" cy="25" r="16.6" fill="none" stroke="#FFF6F1" strokeOpacity="0.5" strokeWidth="1.5" />
      {/* gefüllte Lern-Keile */}
      {SEGMENTS.slice(0, n).map(a => (
        <path key={`w${a}`} d={WEDGE} fill="#FFF6F1" fillOpacity="0.3" transform={`rotate(${a} 24 25)`} />
      ))}
      {/* Segmentlinien */}
      {SEGMENTS.map(a => (
        <line
          key={a}
          x1="24" y1="25" x2="24" y2="10.4"
          stroke="#FFF6F1" strokeOpacity="0.8" strokeWidth="1.8" strokeLinecap="round"
          transform={`rotate(${a} 24 25)`}
        />
      ))}
      {/* Blatt: klein und matt */}
      <path
        d="M26.8 4.4 C29.6 2.2 33.4 2.4 35.7 4.3 C34 6.9 30.5 8 27.4 7 C26.9 6.8 26.7 5.6 26.8 4.4 Z"
        fill="#5E9E77"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Grapefruit als Fortschrittsanzeige – die zentrale Designidee der Plattform.
// Die Frucht füllt sich Stück für Stück, exakt proportional zum Fortschritt
// (Kreissektor ab 12 Uhr), darüber liegen die ruhigen Segmentlinien.
// Überall einsetzbar: Gesamtfortschritt, Themenfortschritt, Lernfortschritt.
// ---------------------------------------------------------------------------

const R_FLESH = 16.6;

// Kreissektor von „12 Uhr" im Uhrzeigersinn bis zum Anteil p (0..1).
function piePath(p: number): string {
  const a = p * Math.PI * 2;
  const x = 24 + R_FLESH * Math.sin(a);
  const y = 25 - R_FLESH * Math.cos(a);
  const large = a > Math.PI ? 1 : 0;
  return `M 24 25 L 24 ${25 - R_FLESH} A ${R_FLESH} ${R_FLESH} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}

interface GrapefruitProgressProps {
  pct: number;          // 0..100
  size?: number;
  rind?: string;        // Farbe der Schale (Ring)
  flesh?: string;       // Farbe des ungefüllten Fruchtfleischs
  gap?: string;         // Farbe der Segmentlinien (Grund dahinter)
  showLeaf?: boolean;
  animate?: boolean;    // beim Erscheinen bis zum Zielwert füllen (Standard: an)
}

// Zählt eine 0..1-Fraktion beim Mount (und bei Wertwechsel) sanft zum Ziel –
// ease-out über ~750ms. Bei reduced-motion sofort am Ziel. So wirkt
// Fortschritt „verdient", ohne verspielt zu sein.
function useFillFraction(target: number, animate: boolean): number {
  const [frac, setFrac] = useState(animate ? 0 : target);
  const fromRef = useRef(animate ? 0 : target);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce) {
      setFrac(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const dur = 750;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const e = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - e, 3); // ease-out-cubic
      const v = from + (target - from) * eased;
      setFrac(v);
      if (e < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, animate]);

  return frac;
}

export function GrapefruitProgress({
  pct,
  size = 64,
  rind = 'var(--line-strong)',
  flesh = 'var(--control)',
  gap = 'var(--surface)',
  showLeaf = true,
  animate = true,
}: GrapefruitProgressProps) {
  const target = Math.min(100, Math.max(0, pct)) / 100;
  const p = useFillFraction(target, animate);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={`${Math.round(target * 100)} % geschafft`}
    >
      {/* Schale */}
      <circle cx="24" cy="25" r="19.4" fill="none" stroke={rind} strokeWidth="2.4" />
      {/* Fruchtfleisch, noch leer */}
      <circle cx="24" cy="25" r={R_FLESH} fill={flesh} />
      {/* gefüllter Anteil */}
      {p >= 0.999 ? (
        <circle cx="24" cy="25" r={R_FLESH} fill="#EE7457" />
      ) : p > 0.001 ? (
        <path d={piePath(p)} fill="#EE7457" />
      ) : null}
      {/* Segmentlinien über allem */}
      {SEGMENTS.map(a => (
        <line
          key={a}
          x1="24" y1="25" x2="24" y2={25 - R_FLESH}
          stroke={gap} strokeWidth="1.7" strokeLinecap="round"
          transform={`rotate(${a} 24 25)`}
        />
      ))}
      {/* Blatt */}
      {showLeaf && (
        <path
          d="M26.8 4.4 C29.6 2.2 33.4 2.4 35.7 4.3 C34 6.9 30.5 8 27.4 7 C26.9 6.8 26.7 5.6 26.8 4.4 Z"
          fill="#5E9E77"
        />
      )}
    </svg>
  );
}
