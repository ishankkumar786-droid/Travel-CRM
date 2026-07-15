import { EditPackageForm } from '@/components/packages/EditPackageForm';

export const metadata = {
  title: 'Edit Package | Travel CRM',
  description: 'Edit your travel package',
};

export default function EditPackagePage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Package</h1>
        <p className="text-muted-foreground">Update your travel package details.</p>
      </div>
      <EditPackageForm id={params.id} />
    </div>
  );
}
