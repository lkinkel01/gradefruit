'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BRAND_CORE_PATH,
  BRAND_RING_PATH,
  BRAND_VIEW_BOX,
} from './BrandMark';

const CORE_RADIUS = 22.5;

/**
 * Große und kleine Markenillustration mit der originalen Zweifarbigkeit aus
 * dem freigegebenen Logopaket.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox={BRAND_VIEW_BOX}
      width={size}
    >
      <g transform="translate(0 6)">
        <path d={BRAND_RING_PATH} fill="var(--brand-rind)" />
        <path d={BRAND_CORE_PATH} fill="var(--brand-flesh)" />
      </g>
    </svg>
  );
}

// Die Ladeanzeige bleibt dasselbe Zeichen. Nur der innere Fortschrittskern
// pulsiert, damit keine zusätzliche Markenform entsteht.
export function GrapefruitSpinner({ size = 46, label }: { size?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg width={size} height={size} viewBox={BRAND_VIEW_BOX} aria-hidden="true">
        <g transform="translate(0 6)">
          <path d={BRAND_RING_PATH} fill="var(--brand-rind)" />
          <path className="gf-logo-pulse" d={BRAND_CORE_PATH} fill="var(--brand-flesh)" />
        </g>
      </svg>
      {label && <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>{label}</span>}
    </div>
  );
}

// Der Fortschritt wächst ab 12 Uhr IM Uhrzeigersinn (nach rechts) —
// wie ein Zifferblatt, das sich füllt.
function piePath(progress: number): string {
  const angle = -Math.PI / 2 + progress * Math.PI * 2;
  const x = 50 + CORE_RADIUS * Math.cos(angle);
  const y = 50 + CORE_RADIUS * Math.sin(angle);
  const largeArc = progress > 0.5 ? 1 : 0;
  return `M 50 50 L 50 ${50 - CORE_RADIUS} A ${CORE_RADIUS} ${CORE_RADIUS} 0 ${largeArc} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}

interface GrapefruitProgressProps {
  pct: number;
  size?: number;
  rind?: string;
  flesh?: string;
  progressColor?: string;
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
 * Fortschritt und Markenzeichen sind dieselbe Form. Der rote Kern füllt sich
 * innerhalb des orangefarbenen G-Rings proportional im Uhrzeigersinn.
 */
export function GrapefruitProgress({
  pct,
  size = 64,
  rind = 'var(--brand-rind)',
  flesh = 'var(--surface-2)',
  progressColor = 'var(--brand-flesh)',
  animate = true,
}: GrapefruitProgressProps) {
  const target = Math.min(100, Math.max(0, pct)) / 100;
  const progress = useFillFraction(target, animate);

  return (
    <svg
      width={size}
      height={size}
      viewBox={BRAND_VIEW_BOX}
      role="img"
      aria-label={`${Math.round(target * 100)} % geschafft`}
    >
      <g transform="translate(0 6)">
        <path d={BRAND_RING_PATH} fill={rind} />
        <circle cx="50" cy="50" r={CORE_RADIUS} fill={flesh} />
        {progress >= 0.999 ? (
          <circle cx="50" cy="50" r={CORE_RADIUS} fill={progressColor} />
        ) : progress > 0.001 ? (
          <path d={piePath(progress)} fill={progressColor} />
        ) : null}
      </g>
    </svg>
  );
}
