import type { Metadata } from 'next';

import { AgencyListPage } from '@/components/agencies/AgencyListPage';

export const metadata: Metadata = { title: 'Agencies' };

export default function AgenciesPage() {
  return <AgencyListPage />;
}
