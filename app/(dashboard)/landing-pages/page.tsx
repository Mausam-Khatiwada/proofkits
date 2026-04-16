import { Globe } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function LandingPagesPage() {
  return (
    <ComingSoon
      icon={Globe}
      title="Landing Pages"
      description="Create beautiful, standalone testimonial landing pages to share with the world."
      features={[
        'Pre-designed page templates',
        'Custom branding and colors',
        'Custom domain support',
        'SEO optimization built-in',
        'Social sharing previews',
      ]}
    />
  );
}
