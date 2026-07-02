'use client';

import { useParams } from 'next/navigation';

import { AgencyDetail } from '@/components/agencies/AgencyDetail';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAgency } from '@/hooks/useAgencies';

export default function AgencyDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: agency, isLoading } = useAgency(params.id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!agency) return null;

  return <AgencyDetail agency={agency} />;
}
