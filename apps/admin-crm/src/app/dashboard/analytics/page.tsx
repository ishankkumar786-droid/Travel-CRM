import type { Metadata } from 'next';

import { AnalyticsPage } from '@/components/analytics/AnalyticsPage';

export const metadata: Metadata = { title: 'Analytics' };

export default function Page() {
  return <AnalyticsPage />;
}
