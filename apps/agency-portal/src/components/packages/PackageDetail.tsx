'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePackage, useDeletePackage } from '@/hooks/useAgencyPortal';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Clock,
  IndianRupee,
  Star,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from 'lucide-react';

import type { PackageStatus } from '@travel/types';

const statusConfig: Record<PackageStatus, { label: string; variant: 'success' | 'secondary' | 'outline' | 'destructive' }> = {
  active: { label: 'Active', variant: 'success' },
  draft: { label: 'Draft', variant: 'secondary' },
  inactive: { label: 'Inactive', variant: 'outline' },
  archived: { label: 'Archived', variant: 'destructive' },
};

export function PackageDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: pkg, isLoading, isError } = usePackage(id);
  const deletePackage = useDeletePackage();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this package?')) {
      await deletePackage.mutateAsync(id);
      router.push('/packages');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold">Package not found</p>
        <p className="text-sm text-muted-foreground mt-1">This package may have been deleted or does not exist.</p>
        <Link href="/packages">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Packages
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/packages">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{pkg.name}</h1>
                <Badge variant={statusConfig[pkg.status]?.variant ?? 'outline'}>
                  {statusConfig[pkg.status]?.label ?? pkg.status}
                </Badge>
                {pkg.isFeatured && (
                  <Badge className="bg-accent/90 text-accent-foreground">
                    <Star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Created {new Date(pkg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/packages/${id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} disabled={deletePackage.isPending}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Cover Image */}
      {pkg.coverImage && (
        <div className="overflow-hidden rounded-xl border border-border">
          <img src={pkg.coverImage} alt={pkg.name} className="h-64 w-full object-cover" />
        </div>
      )}

      {/* Key Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="text-sm font-semibold">{pkg.destinationName ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-semibold">{pkg.durationDays} Days / {pkg.durationNights} Nights</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price / Person</p>
              <p className="text-sm font-semibold">₹{pkg.pricePerPerson.toLocaleString('en-IN')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-semibold">{pkg.category}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itinerary */}
      {pkg.itinerary && pkg.itinerary.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Itinerary</h2>
            <div className="space-y-4">
              {pkg.itinerary.map((day, index) => (
                <div key={index} className="relative pl-8 pb-4 last:pb-0">
                  {/* Timeline line */}
                  {index < pkg.itinerary!.length - 1 && (
                    <div className="absolute left-3 top-6 bottom-0 w-px bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{day.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{day.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inclusions & Exclusions */}
      <div className="grid gap-6 md:grid-cols-2">
        {pkg.inclusions.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Inclusions</h2>
              <ul className="space-y-2">
                {pkg.inclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {pkg.exclusions.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Exclusions</h2>
              <ul className="space-y-2">
                {pkg.exclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
