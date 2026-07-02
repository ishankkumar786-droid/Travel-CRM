'use client';

import { Package, Plus, Trash2 } from 'lucide-react';

import type { PackageDTO } from '@travel/types';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useCreatePackage, useDeletePackage, usePackages } from '@/hooks/useMarketplace';
import { useState } from 'react';

const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'secondary' | 'destructive' | 'default'
> = {
  active: 'success',
  draft: 'warning',
  inactive: 'secondary',
  archived: 'secondary',
};

// Package list across all agencies — for the admin CRM view
export function PackagesListPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-bold">Packages</h1>
        <p className="text-muted-foreground text-sm">
          Manage agency packages from the agency detail page.
        </p>
      </div>
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="text-muted-foreground mx-auto mb-3 h-10 w-10" aria-hidden="true" />
          <p className="text-foreground font-medium">Packages are managed per agency</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Open an agency → Packages tab to manage its packages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Inline Packages Tab for AgencyDetail ─────────────────────────────────────

interface PackagesTabProps {
  agencyId: string;
}

export function PackagesTab({ agencyId }: PackagesTabProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    durationDays: '1',
    durationNights: '0',
    pricePerPerson: '1000',
  });
  const { data, isLoading } = usePackages(agencyId);
  const createMutation = useCreatePackage(agencyId);
  const deleteMutation = useDeletePackage(agencyId);

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      ...form,
      durationDays: Number(form.durationDays),
      durationNights: Number(form.durationNights),
      pricePerPerson: Number(form.pricePerPerson),
    });
    setForm({
      name: '',
      category: '',
      durationDays: '1',
      durationNights: '0',
      pricePerPerson: '1000',
    });
    setOpen(false);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );

  const packages = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {packages.length} package{packages.length !== 1 ? 's' : ''}
        </p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add Package
        </Button>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          title="No packages yet"
          description="Add a package to make this agency marketplace-ready."
          icon={<Package className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              Add Package
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {packages.map((p: PackageDTO) => (
            <div
              key={p.id}
              className="border-border flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="text-foreground font-medium">{p.name}</p>
                <p className="text-muted-foreground text-xs">
                  {p.category} · {p.durationDays}D/{p.durationNights}N · ₹
                  {p.pricePerPerson.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[p.status] ?? 'default'} className="capitalize">
                  {p.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Delete package?')) deleteMutation.mutate(p.id);
                  }}
                >
                  <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add Package</ModalTitle>
          </ModalHeader>
          <div className="space-y-4 p-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium">Package Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Goa Beach Package"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category *</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Beach, Adventure…"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Price per Person (₹) *</label>
                <Input
                  type="number"
                  value={form.pricePerPerson}
                  onChange={(e) => setForm((f) => ({ ...f, pricePerPerson: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Days</label>
                <Input
                  type="number"
                  min={1}
                  value={form.durationDays}
                  onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nights</label>
                <Input
                  type="number"
                  min={0}
                  value={form.durationNights}
                  onChange={(e) => setForm((f) => ({ ...f, durationNights: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!form.name || !form.category}
                loading={createMutation.isPending}
              >
                Create Package
              </Button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
}
