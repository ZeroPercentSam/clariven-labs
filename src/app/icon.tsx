import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #0D9488, #1E40AF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* DNA helix icon */}
          <path d="M2 15c6.667-6 13.333 0 20-6" />
          <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
          <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
          <path d="M17 6l-2.5 2.5" />
          <path d="M14 8l-1 1" />
          <path d="M7 18l2.5-2.5" />
          <path d="M3.5 14.5l.5-.5" />
          <path d="M20 9l.5-.5" />
          <path d="M2 9c6.667 6 13.333 0 20 6" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
