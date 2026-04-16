import type { NextConfig } from 'next';

const cspReportOnly = process.env.CSP_REPORT_ONLY === 'true';
const cspReportUri = process.env.CSP_REPORT_URI;
const isDev = process.env.NODE_ENV !== 'production';

function buildContentSecurityPolicy() {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline'",
    isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://*.supabase.co https://api.groq.com https://test.dodopayments.com https://live.dodopayments.com",
  ];

  if (cspReportUri) {
    directives.push(`report-uri ${cspReportUri}`);
  }

  return directives.join('; ');
}

const nextConfig: NextConfig = {
  async headers() {
    const cspHeaderKey = cspReportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    const cspHeaderValue = buildContentSecurityPolicy();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: cspHeaderKey,
            value: cspHeaderValue,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
