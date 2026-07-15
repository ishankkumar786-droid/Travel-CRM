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

const statusConfig: Record<
  PackageStatus,
  { label: string; variant: 'success' | 'secondary' | 'outline' | 'destructive' }
> = {
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
        <p className="text-muted-foreground mt-1 text-sm">
          This package may have been deleted or does not exist.
        </p>
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
              <p className="text-muted-foreground mt-1 text-sm">
                Created{' '}
                {new Date(pkg.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
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
        <div className="border-border overflow-hidden rounded-xl border">
          <img src={pkg.coverImage} alt={pkg.name} className="h-64 w-full object-cover" />
        </div>
      )}

      {/* Key Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Destination</p>
              <p className="text-sm font-semibold">{pkg.destinationName ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Duration</p>
              <p className="text-sm font-semibold">
                {pkg.durationDays} Days / {pkg.durationNights} Nights
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <IndianRupee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Price / Person</p>
              <p className="text-sm font-semibold">₹{pkg.pricePerPerson.toLocaleString('en-IN')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Category</p>
              <p className="text-sm font-semibold">{pkg.category}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itinerary */}
      {pkg.itinerary && pkg.itinerary.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-foreground mb-4 text-lg font-semibold">Itinerary</h2>
            <div className="space-y-4">
              {pkg.itinerary.map((day, index) => (
                <div key={index} className="relative pb-4 pl-8 last:pb-0">
                  {/* Timeline line */}
                  {index < pkg.itinerary!.length - 1 && (
                    <div className="bg-border absolute bottom-0 left-3 top-6 w-px" />
                  )}
                  {/* Timeline dot */}
                  <div className="bg-primary text-primary-foreground absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                    {day.day}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{day.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{day.description}</p>
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
              <h2 className="text-foreground mb-4 text-lg font-semibold">Inclusions</h2>
              <ul className="space-y-2">
                {pkg.inclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
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
              <h2 className="text-foreground mb-4 text-lg font-semibold">Exclusions</h2>
              <ul className="space-y-2">
                {pkg.exclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
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
