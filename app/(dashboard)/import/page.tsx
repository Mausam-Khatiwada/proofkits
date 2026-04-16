import { Upload } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/ComingSoon';

export default function ImportPage() {
  return (
    <ComingSoon
      icon={Upload}
      title="Import"
      description="Import existing testimonials from other platforms and spreadsheets."
      features={[
        'CSV and Excel file upload',
        'Import from Google Reviews',
        'Import from Trustpilot and G2',
        'Automatic deduplication',
        'Bulk approve and categorize',
      ]}
    />
  );
}
