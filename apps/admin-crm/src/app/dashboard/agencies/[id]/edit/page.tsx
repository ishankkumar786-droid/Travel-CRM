'use client';

import { useParams } from 'next/navigation';

import { useAgency } from '@/hooks/useAgencies';
import { AgencyForm } from '@/components/agencies/AgencyForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function EditAgencyPage() {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold">Edit Agency</h1>
        <p className="text-muted-foreground text-sm">{agency.name}</p>
      </div>
      <AgencyForm agency={agency} />
    </div>
  );
}
