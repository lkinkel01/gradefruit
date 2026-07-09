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
