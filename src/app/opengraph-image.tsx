import { ImageResponse } from 'next/og';

export const alt = 'Clariven Labs - Premium Pharmaceutical-Grade Peptides';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A1628',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0D9488, #1E40AF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
          <div style={{ display: 'flex', color: 'white', fontSize: 36, fontWeight: 700, letterSpacing: 3 }}>
            CLARIVEN
            <span style={{ color: '#0D9488' }}>LABS</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Pharmaceutical-Grade Peptides.
          </span>
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: '#0D9488',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            Uncompromising Purity.
          </span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            maxWidth: 700,
            marginBottom: 48,
            display: 'flex',
          }}
        >
          Premium peptide supply for clinics, compounding pharmacies, and research institutions.
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', gap: 24 }}>
          {['98%+ Purity', 'cGMP Certified', 'USA Made', 'COA Verified'].map((badge) => (
            <div
              key={badge}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 100,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0D9488', display: 'flex' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 500 }}>
                {badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
