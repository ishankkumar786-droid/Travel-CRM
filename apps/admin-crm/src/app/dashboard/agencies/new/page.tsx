import type { Metadata } from 'next';

import { AgencyForm } from '@/components/agencies/AgencyForm';

export const metadata: Metadata = { title: 'New Agency' };

export default function NewAgencyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-foreground text-2xl font-bold">Add Agency</h1>
        <p className="text-muted-foreground text-sm">Fill in the details to create a new agency</p>
      </div>
      <AgencyForm />
    </div>
  );
}
