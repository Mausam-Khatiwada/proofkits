import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/seo';

export const runtime = 'edge';
export const alt = `${SITE_NAME} Twitter Image`;
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '46px',
          color: '#f4f7ff',
          background:
            'radial-gradient(980px 380px at 0% -10%, rgba(14,165,233,0.3), transparent 52%), radial-gradient(900px 420px at 100% -20%, rgba(168,85,247,0.35), transparent 50%), linear-gradient(145deg, #050b1f 0%, #0d1d43 100%)',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            maxWidth: 960,
          }}
        >
          AI testimonials that drive real SaaS conversion lift.
        </div>
      </div>
    ),
    size
  );
}
