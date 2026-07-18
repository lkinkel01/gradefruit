import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#F26B4A',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <svg height="132" viewBox="0 0 48 48" width="132">
          <circle cx="24" cy="25" r="17.25" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
          <path
            d="M24 9.9v13.2M37.1 17.45l-11.45 6.6M37.1 32.55l-11.45-6.6M24 40.1V26.9M10.9 32.55l11.45-6.6M10.9 17.45l11.45 6.6"
            fill="none"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <circle cx="24" cy="25" r="2.5" fill="#FFFFFF" />
          <path
            d="M28.1 7.15c3.7-3.15 8.45-2.7 11.15.35-2.65 3.45-7.3 4.45-11.05 1.75-.75-.55-.75-1.45-.1-2.1Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    ),
    size,
  );
}
