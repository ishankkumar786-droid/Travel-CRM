'use client';

import { Save } from 'lucide-react';

import { useSettings, useUpdateSettings } from '@/hooks/usePhase6';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

export function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-foreground text-2xl font-bold">Settings</h1>
        <Card>
          <CardContent className="pt-5">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async (section: string, values: Record<string, unknown>) => {
    await updateMutation.mutateAsync({ [section]: values });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-bold">Settings</h1>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void handleSave('general', {
                companyName: fd.get('companyName'),
                timezone: fd.get('timezone'),
                currency: fd.get('currency'),
              });
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company Name</label>
              <Input name="companyName" defaultValue={settings?.general.companyName} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Timezone</label>
              <Input name="timezone" defaultValue={settings?.general.timezone} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Currency</label>
              <Input name="currency" defaultValue={settings?.general.currency} />
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" loading={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Save General
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void handleSave('verification', {
                requireDocuments: fd.get('requireDocuments') === 'on',
                minScore: Number(fd.get('minScore')),
              });
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Minimum Verification Score (%)</label>
              <Input
                type="number"
                name="minScore"
                min={0}
                max={100}
                defaultValue={settings?.verification.minScore}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="requireDocs"
                name="requireDocuments"
                className="border-border h-4 w-4 rounded"
                defaultChecked={settings?.verification.requireDocuments}
              />
              <label htmlFor="requireDocs" className="text-sm">
                Require Documents for Verification
              </label>
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" loading={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Save Verification
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              void handleSave('import', {
                maxFileSizeMb: Number(fd.get('maxFileSizeMb')),
                defaultConflictStrategy: fd.get('strategy'),
              });
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Max File Size (MB)</label>
              <Input
                type="number"
                name="maxFileSizeMb"
                min={1}
                max={100}
                defaultValue={settings?.import.maxFileSizeMb}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Default Conflict Strategy</label>
              <select
                name="strategy"
                defaultValue={settings?.import.defaultConflictStrategy}
                className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              >
                {['skip', 'merge', 'overwrite'].map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button type="submit" size="sm" loading={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                Save Import
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Placeholder sections */}
      {(['Notification Settings', 'Email Templates', 'API Keys', 'Branding'] as const).map(
        (title) => (
          <Card key={title} className="opacity-60">
            <CardHeader>
              <CardTitle className="text-muted-foreground text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">Available in a future release.</p>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
