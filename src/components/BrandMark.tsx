interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Monochromes Gradefruit-Markenzeichen.
 *
 * Die reduzierte Zitrus-Geometrie bleibt auch in 16 px erkennbar und nimmt
 * ihre Farbe immer aus `currentColor`. So funktioniert dasselbe Zeichen auf
 * hellen und dunklen Flächen, ohne eine zweite Komponentenvariante zu pflegen.
 */
export function BrandMark({ size = 28, className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      height={size}
      viewBox="0 0 48 48"
      width={size}
    >
      <circle cx="24" cy="25" r="17.25" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M24 9.9v13.2M37.1 17.45l-11.45 6.6M37.1 32.55l-11.45-6.6M24 40.1V26.9M10.9 32.55l11.45-6.6M10.9 17.45l11.45 6.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="24" cy="25" r="2.5" fill="currentColor" />
      <path
        d="M28.1 7.15c3.7-3.15 8.45-2.7 11.15.35-2.65 3.45-7.3 4.45-11.05 1.75-.75-.55-.75-1.45-.1-2.1Z"
        fill="currentColor"
      />
    </svg>
  );
}
