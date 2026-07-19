interface BrandMarkProps {
  size?: number;
  className?: string;
  variant?: 'color' | 'monochrome';
}

export const BRAND_VIEW_BOX = '6 6 88 88';
export const BRAND_RING_PATH =
  'M 56.165 15.039 A 35.5 35.5 0 1 0 84.961 43.835 A 4.5 4.5 0 0 0 76.097 45.398 A 26.5 26.5 0 1 1 54.602 23.903 A 4.5 4.5 0 0 0 56.165 15.039 Z';
export const BRAND_CORE_PATH =
  'M 50 50 L 50 27.5 A 22.5 22.5 0 1 0 72.5 50 Z';

/**
 * Das freigegebene Gradefruit-Markenzeichen aus dem gelieferten Logopaket.
 * Die optionale monochrome Variante bleibt für Sonderfälle auf einfarbigen
 * Flächen verfügbar; regulär wird die originale Zweifarbigkeit verwendet.
 */
export function BrandMark({ size = 28, className, variant = 'color' }: BrandMarkProps) {
  const ring = variant === 'monochrome' ? 'currentColor' : 'var(--brand-rind)';
  const core = variant === 'monochrome' ? 'currentColor' : 'var(--brand-flesh)';

  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      height={size}
      viewBox={BRAND_VIEW_BOX}
      width={size}
    >
      <g transform="translate(0 6)">
        <path d={BRAND_RING_PATH} fill={ring} />
        <path d={BRAND_CORE_PATH} fill={core} />
      </g>
    </svg>
  );
}
