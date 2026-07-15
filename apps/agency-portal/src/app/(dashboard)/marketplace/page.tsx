import type { Metadata } from 'next';

import { MarketplaceContent } from '@/components/marketplace/MarketplaceContent';

export const metadata: Metadata = { title: 'Marketplace Profile' };

export default function MarketplacePage() {
  return <MarketplaceContent />;
}
