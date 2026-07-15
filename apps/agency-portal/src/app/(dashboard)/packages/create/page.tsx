import { CreatePackageForm } from '@/components/packages/CreatePackageForm';

export const metadata = {
  title: 'Create Package | Travel CRM',
  description: 'Create a new travel package for your agency',
};

export default function CreatePackagePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Package</h1>
        <p className="text-muted-foreground">Add a new travel package to your offerings.</p>
      </div>
      
      <CreatePackageForm />
    </div>
  );
}
