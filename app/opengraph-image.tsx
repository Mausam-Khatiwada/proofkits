import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export const runtime = 'edge';
export const alt = `${SITE_NAME} Open Graph Image`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px',
          color: '#f6f8ff',
          background:
            'radial-gradient(1200px 500px at 10% -10%, rgba(56,189,248,0.35), transparent 52%), radial-gradient(1000px 440px at 92% -8%, rgba(99,102,241,0.45), transparent 50%), linear-gradient(145deg, #050b1f 0%, #0a1838 100%)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px',
            border: '1px solid rgba(165, 180, 252, 0.4)',
            borderRadius: '999px',
            background: 'rgba(10, 16, 40, 0.55)',
            padding: '12px 18px',
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          {SITE_NAME}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.04,
              letterSpacing: '-0.04em',
              fontWeight: 800,
              maxWidth: 1000,
            }}
          >
            Turn social proof into a measurable growth channel.
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.35,
              color: 'rgba(223, 232, 255, 0.92)',
            }}
          >
            {SITE_TAGLINE}
          </div>
        </div>
      </div>
    ),
    size
  );
}
