import type { Metadata } from 'next';

import { PackagesContent } from '@/components/packages/PackagesContent';

export const metadata: Metadata = { title: 'Packages' };

export default function PackagesPage() {
  return <PackagesContent />;
}
