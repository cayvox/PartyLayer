import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'PartyLayer — One SDK for Every Canton Wallet';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FFF5CC 30%, #FFCC00 70%, #E6B800 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: '#0F0F0F',
            border: '4px solid rgba(255,255,255,0.3)',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#FFCC00',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#0B0F1A',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          PartyLayer
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: '#334155',
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          One SDK for Every Canton Wallet
        </div>

        {/* Wallet chips */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Console Wallet', '5N Loop', 'Cantor8', 'Nightly', 'Bron'].map(
            (name) => (
              <div
                key={name}
                style={{
                  padding: '10px 24px',
                  borderRadius: 40,
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(15,23,42,0.1)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#0B0F1A',
                }}
              >
                {name}
              </div>
            ),
          )}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            fontSize: 18,
            fontWeight: 500,
            color: '#475569',
          }}
        >
          partylayer.xyz
        </div>
      </div>
    ),
    { ...size },
  );
}
