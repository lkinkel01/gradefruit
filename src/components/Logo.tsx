'use client';

import { useEffect, useRef, useState } from 'react';

const SEGMENTS = [0, 60, 120, 180, 240, 300];
const MARK_RADIUS = 17.25;
const FILL_RADIUS = 15.3;
const WEDGE = 'M24 25 L24 9.9 A15.1 15.1 0 0 1 37.1 17.45 Z';
const LEAF = 'M28.1 7.15c3.7-3.15 8.45-2.7 11.15.35-2.65 3.45-7.3 4.45-11.05 1.75-.75-.55-.75-1.45-.1-2.1Z';

/**
 * Große und kleine Markenillustration auf Basis derselben Geometrie wie der
 * BrandMark in Navigation, Favicon und App-Icon. `filled` akzentuiert bis zu
 * sechs Segmente, ohne eine zweite Logovariante einzuführen.
 */
export function Logo({ size = 28, filled = 1 }: { size?: number; filled?: number }) {
  const count = Math.max(0, Math.min(6, filled));

  return (
    <svg
      aria-hidden="true"
      height={size}
      style={{ color: 'var(--accent)' }}
      viewBox="0 0 48 48"
      width={size}
    >
      {SEGMENTS.slice(0, count).map(angle => (
        <path
          key={`fill-${angle}`}
          d={WEDGE}
          fill="currentColor"
          fillOpacity="0.14"
          transform={`rotate(${angle} 24 25)`}
        />
      ))}
      <circle cx="24" cy="25" r={MARK_RADIUS} fill="none" stroke="currentColor" strokeWidth="2.5" />
      {SEGMENTS.map(angle => (
        <line
          key={angle}
          x1="24"
          x2="24"
          y1="25"
          y2="9.9"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
          transform={`rotate(${angle} 24 25)`}
        />
      ))}
      <circle cx="24" cy="25" r="2.5" fill="currentColor" />
      <path d={LEAF} fill="currentColor" />
    </svg>
  );
}

// Die Ladeanzeige bleibt dieselbe Frucht. Nur die Segment-Deckkraft bewegt
// sich, damit der Zustand klar bleibt und keine zusätzliche Form entsteht.
export function GrapefruitSpinner({ size = 46, label }: { size?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="25" r={MARK_RADIUS} fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="2.5" />
        {SEGMENTS.map((angle, index) => (
          <path
            key={`segment-${angle}`}
            className="gf-spin-seg"
            d={WEDGE}
            fill="var(--accent)"
            transform={`rotate(${angle} 24 25)`}
            style={{ animationDelay: `${-index * 0.19}s` }}
          />
        ))}
        {SEGMENTS.map(angle => (
          <line
            key={`line-${angle}`}
            x1="24"
            x2="24"
            y1="25"
            y2="9.9"
            stroke="var(--surface)"
            strokeLinecap="round"
            strokeWidth="2"
            transform={`rotate(${angle} 24 25)`}
          />
        ))}
        <circle cx="24" cy="25" r="2.5" fill="var(--surface)" />
        <path d={LEAF} fill="var(--accent)" />
      </svg>
      {label && <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{label}</span>}
    </div>
  );
}

function piePath(progress: number): string {
  const angle = progress * Math.PI * 2;
  const x = 24 + FILL_RADIUS * Math.sin(angle);
  const y = 25 - FILL_RADIUS * Math.cos(angle);
  const largeArc = angle > Math.PI ? 1 : 0;
  return `M 24 25 L 24 ${25 - FILL_RADIUS} A ${FILL_RADIUS} ${FILL_RADIUS} 0 ${largeArc} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}

interface GrapefruitProgressProps {
  pct: number;
  size?: number;
  rind?: string;
  flesh?: string;
  showLeaf?: boolean;
  animate?: boolean;
}

function useFillFraction(target: number, animate: boolean): number {
  const [fraction, setFraction] = useState(animate ? 0 : target);
  const fromRef = useRef(animate ? 0 : target);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce) {
      const frame = requestAnimationFrame(() => {
        setFraction(target);
        fromRef.current = target;
      });
      return () => cancelAnimationFrame(frame);
    }

    const from = fromRef.current;
    const duration = 260;
    let frame = 0;
    let start = 0;

    const tick = (time: number) => {
      if (!start) start = time;
      const elapsed = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const next = from + (target - from) * eased;
      setFraction(next);
      if (elapsed < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, animate]);

  return fraction;
}

/**
 * Fortschritt und Markenzeichen sind dieselbe Form. Der Akzent füllt sich
 * innerhalb der monochromen BrandMark-Geometrie proportional im Uhrzeigersinn.
 */
export function GrapefruitProgress({
  pct,
  size = 64,
  rind = 'var(--accent)',
  flesh = 'var(--surface-2)',
  showLeaf = true,
  animate = true,
}: GrapefruitProgressProps) {
  const target = Math.min(100, Math.max(0, pct)) / 100;
  const progress = useFillFraction(target, animate);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={`${Math.round(target * 100)} % geschafft`}
    >
      <circle cx="24" cy="25" r={MARK_RADIUS} fill={flesh} stroke={rind} strokeWidth="2.5" />
      {progress >= 0.999 ? (
        <circle cx="24" cy="25" r={FILL_RADIUS} fill="var(--accent-progress)" />
      ) : progress > 0.001 ? (
        <path d={piePath(progress)} fill="var(--accent-progress)" />
      ) : null}
      {SEGMENTS.map(angle => (
        <line
          key={angle}
          x1="24"
          x2="24"
          y1="25"
          y2="9.9"
          stroke={rind}
          strokeLinecap="round"
          strokeWidth="2"
          transform={`rotate(${angle} 24 25)`}
        />
      ))}
      <circle cx="24" cy="25" r="2.5" fill={rind} />
      {showLeaf && <path d={LEAF} fill={rind} />}
    </svg>
  );
}
