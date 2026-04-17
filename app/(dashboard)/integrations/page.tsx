import { Plug } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function IntegrationsPage() {
  return (
    <ComingSoon
      icon={Plug}
      title="Integrations"
      description="Connect ProofEngine with your favorite tools and platforms."
      features={[
        'Zapier and Make.com webhooks',
        'Slack notifications',
        'Notion database sync',
        'WordPress plugin',
        'Shopify and Webflow embeds',
      ]}
    />
  );
}
