'use client';

import { X } from 'lucide-react';
import { useCallback } from 'react';

import type { AgencyListQuery } from '@travel/types';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
  { value: 'suspended', label: 'Suspended' },
];

const VERIFICATION_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
];

const MARKETPLACE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'unlisted', label: 'Unlisted' },
  { value: 'listed', label: 'Listed' },
  { value: 'featured', label: 'Featured' },
  { value: 'suspended', label: 'Suspended' },
];

interface AgencyFiltersProps {
  current: Partial<AgencyListQuery>;
  onChange: (filters: Partial<AgencyListQuery>) => void;
  onClose: () => void;
}

export function AgencyFilters({ current, onChange, onClose }: AgencyFiltersProps) {
  const set = useCallback(
    (key: keyof AgencyListQuery, value: string) => {
      onChange({ [key]: value || undefined });
    },
    [onChange],
  );

  return (
    <Card className="border-border">
      <CardContent className="pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-foreground text-sm font-semibold">Filters</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close filters">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-medium">Status</label>
            <select
              value={current.status ?? ''}
              onChange={(e) => set('status', e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Verification */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-medium">Verification</label>
            <select
              value={current.verificationStatus ?? ''}
              onChange={(e) => set('verificationStatus', e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              aria-label="Filter by verification status"
            >
              {VERIFICATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Marketplace */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-medium">Marketplace</label>
            <select
              value={current.marketplaceStatus ?? ''}
              onChange={(e) => set('marketplaceStatus', e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              aria-label="Filter by marketplace status"
            >
              {MARKETPLACE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-medium">State</label>
            <input
              type="text"
              placeholder="e.g. Maharashtra"
              value={current.state ?? ''}
              onChange={(e) => set('state', e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              aria-label="Filter by state"
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground text-xs font-medium">City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai"
              value={current.city ?? ''}
              onChange={(e) => set('city', e.target.value)}
              className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              aria-label="Filter by city"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
