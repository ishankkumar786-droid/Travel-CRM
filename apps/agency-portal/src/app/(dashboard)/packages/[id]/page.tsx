import { PackageDetail } from '@/components/packages/PackageDetail';

export const metadata = {
  title: 'Package Details | Travel CRM',
  description: 'View travel package details',
};

export default function PackageDetailPage({ params }: { params: { id: string } }) {
  return <PackageDetail id={params.id} />;
}
