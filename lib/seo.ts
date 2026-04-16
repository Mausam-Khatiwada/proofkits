import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://proofkit.app';

export const SITE_NAME = 'ProofKits';
export const SITE_TAGLINE = 'AI Testimonial Platform for SaaS Teams';
export const SITE_DESCRIPTION =
  'Collect, verify, and publish high-converting customer testimonials with AI-powered workflows and premium embeds.';
export const SITE_TWITTER_HANDLE = '@proofkit';

export const PUBLIC_ROBOTS: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export const PRIVATE_ROBOTS: NonNullable<Metadata['robots']> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    'max-snippet': -1,
    'max-image-preview': 'none',
    'max-video-preview': -1,
  },
};

export function getSiteUrl(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined,
    DEFAULT_SITE_URL,
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    try {
      return new URL(raw);
    } catch {
      // Continue to next candidate when current env var is malformed.
    }
  }

  return new URL(DEFAULT_SITE_URL);
}

export function absoluteUrl(path = '/'): string {
  return new URL(path, getSiteUrl()).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} Open Graph image`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: ['/twitter-image'],
      creator: SITE_TWITTER_HANDLE,
      site: SITE_TWITTER_HANDLE,
    },
    robots: index ? PUBLIC_ROBOTS : PRIVATE_ROBOTS,
  };
}
