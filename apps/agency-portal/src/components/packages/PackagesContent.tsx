'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  IndianRupee,
  Star,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import { usePackages, useDeletePackage } from '@/hooks/useAgencyPortal';

import type { PackageDTO, PackageStatus } from '@travel/types';

const statusConfig: Record<
  PackageStatus,
  { label: string; variant: 'success' | 'secondary' | 'outline' | 'destructive' }
> = {
  active: { label: 'Active', variant: 'success' },
  draft: { label: 'Draft', variant: 'secondary' },
  inactive: { label: 'Inactive', variant: 'outline' },
  archived: { label: 'Archived', variant: 'destructive' },
};

/* ─── Component ────────────────────────────────────────────────────────────── */

export function PackagesContent() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data, isLoading, isError } = usePackages();
  const deletePackage = useDeletePackage();

  const packages: PackageDTO[] = data?.items ?? [];
  const filtered = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      (pkg.destinationName ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      deletePackage.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
          <p className="text-muted-foreground">Manage your travel packages and listings</p>
        </div>
        <Link href="/packages/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Package
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Input
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted/50 flex items-center rounded-lg border p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Package}
          title="Failed to load packages"
          description="Something went wrong. Please try refreshing the page."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No packages found"
          description={
            packages.length === 0
              ? 'Create your first travel package to get started.'
              : 'Try adjusting your search.'
          }
          action={
            <Link href="/packages/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Package
              </Button>
            </Link>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg, i) => (
            <Card
              key={pkg.id}
              className="card-hover animate-fade-in group overflow-hidden"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Cover image or placeholder */}
              <div className="from-primary/20 via-accent/10 to-primary/5 relative h-40 bg-gradient-to-br">
                {pkg.coverImage ? (
                  <img src={pkg.coverImage} alt={pkg.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="text-primary/30 h-12 w-12" />
                  </div>
                )}
                {pkg.isFeatured && (
                  <div className="absolute left-3 top-3">
                    <Badge className="bg-accent/90 text-accent-foreground backdrop-blur-sm">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <Badge variant={statusConfig[pkg.status]?.variant ?? 'outline'}>
                    {statusConfig[pkg.status]?.label ?? pkg.status}
                  </Badge>
                </div>
                {/* Hover actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link href={`/packages/${pkg.id}`}>
                    <Button size="sm" variant="secondary" className="h-8">
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/packages/${pkg.id}/edit`}>
                    <Button size="sm" variant="secondary" className="h-8">
                      <Edit className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8"
                    onClick={() => handleDelete(pkg.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-foreground line-clamp-1 font-semibold">{pkg.name}</h3>
                    <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                      <MapPin className="h-3 w-3" />
                      <span>{pkg.destinationName ?? '—'}</span>
                      <span className="text-border">•</span>
                      <Clock className="h-3 w-3" />
                      <span>
                        {pkg.durationDays}D/{pkg.durationNights}N
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <IndianRupee className="text-foreground h-4 w-4" />
                      <span className="text-lg font-bold">
                        {pkg.pricePerPerson.toLocaleString('en-IN')}
                      </span>
                      <span className="text-muted-foreground text-xs">/person</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {pkg.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <div className="divide-y">
            {filtered.map((pkg, i) => (
              <div
                key={pkg.id}
                className="hover:bg-muted/50 animate-fade-in flex items-center gap-4 p-4 transition-colors"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                  {pkg.coverImage ? (
                    <img
                      src={pkg.coverImage}
                      alt={pkg.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/packages/${pkg.id}`}
                      className="truncate text-sm font-semibold hover:underline"
                    >
                      {pkg.name}
                    </Link>
                    {pkg.isFeatured && (
                      <Star className="fill-accent text-accent h-3.5 w-3.5 shrink-0" />
                    )}
                  </div>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {pkg.destinationName ?? '—'}
                    </span>
                    <span>
                      {pkg.durationDays}D/{pkg.durationNights}N
                    </span>
                    <span>{pkg.category}</span>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold">{formatCurrency(pkg.pricePerPerson)}</p>
                  <p className="text-muted-foreground text-xs">per person</p>
                </div>
                <Badge variant={statusConfig[pkg.status]?.variant ?? 'outline'}>
                  {statusConfig[pkg.status]?.label ?? pkg.status}
                </Badge>
                <div className="flex shrink-0 items-center gap-1">
                  <Link href={`/packages/${pkg.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
