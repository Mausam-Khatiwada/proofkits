import { Wand2 } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function RequestBuilderPage() {
  return (
    <ComingSoon
      icon={Wand2}
      title="Request Builder"
      description="Create and automate personalized testimonial request campaigns powered by AI."
      features={[
        'Drag-and-drop email template builder',
        'AI-powered message personalization',
        'Multi-channel outreach (email, SMS, WhatsApp)',
        'Automated follow-up sequences',
        'Campaign analytics and tracking',
      ]}
    />
  );
}
