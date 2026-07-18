import type { ReactNode, SVGProps } from 'react';

type UiIconProps = Omit<SVGProps<SVGSVGElement>, 'children' | 'height' | 'width'> & {
  children: ReactNode;
  size?: number;
};

/**
 * Gemeinsame Geometrie für funktionale Gradefruit-Icons.
 *
 * Alle Glyphen nutzen ein 24er-Raster, runde Enden und dieselbe Strichstärke.
 * Größe und Farbe kommen vom jeweiligen Bedienelement; dekorative Icon-Kacheln
 * oder eine zweite Perspektive werden dadurch vermieden.
 */
export function UiIcon({ children, size = 18, ...props }: UiIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon({ size = 20 }: { size?: number }) {
  return <UiIcon size={size}><path d="M4 6h16M4 12h16M4 18h16" /></UiIcon>;
}

export function MoonIcon({ size = 18 }: { size?: number }) {
  return <UiIcon size={size}><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" /></UiIcon>;
}

export function SunIcon({ size = 18 }: { size?: number }) {
  return (
    <UiIcon size={size}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </UiIcon>
  );
}

export function OverviewIcon({ size = 18 }: { size?: number }) {
  return (
    <UiIcon size={size}>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
      <rect x="14" y="14" width="6.5" height="6.5" rx="1.5" />
    </UiIcon>
  );
}

export function ReviewIcon({ size = 18 }: { size?: number }) {
  return <UiIcon size={size}><path d="M4 9V4m0 0h5M4 4l3.4 3.4A8 8 0 1 1 4.8 15" /></UiIcon>;
}

export function TutorIcon({ size = 18 }: { size?: number }) {
  return <UiIcon size={size}><circle cx="12" cy="8" r="3.4" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" /></UiIcon>;
}

export function LockIcon({ size = 18 }: { size?: number }) {
  return <UiIcon size={size}><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></UiIcon>;
}

export function ArrowRightIcon({ size = 18 }: { size?: number }) {
  return <UiIcon size={size}><path d="M5 12h14M13 6l6 6-6 6" /></UiIcon>;
}

export function LogoutIcon({ size = 18 }: { size?: number }) {
  return <UiIcon size={size}><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" /></UiIcon>;
}

export function ReelIcon({ size = 18 }: { size?: number }) {
  return <UiIcon size={size}><rect x="5" y="3" width="14" height="18" rx="3" /><path d="m10 8 5 3-5 3Z" /><path d="M9 18h6" /></UiIcon>;
}

export function CheckIcon({ size = 18 }: { size?: number }) {
  return <UiIcon size={size}><path d="m5 12 4.5 4.5L19 7" /></UiIcon>;
}
