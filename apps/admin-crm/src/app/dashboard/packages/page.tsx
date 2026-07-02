import type { Metadata } from 'next';

import { PackagesListPage } from '@/components/marketplace/PackagesListPage';

export const metadata: Metadata = { title: 'Packages' };

export default function Page() {
  return <PackagesListPage />;
}
