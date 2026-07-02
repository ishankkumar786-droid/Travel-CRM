'use client';

import {
  Activity,
  Archive,
  ArrowLeft,
  Building2,
  CheckSquare,
  Clock,
  Edit,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RotateCcw,
  Timer,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import type { AgencyDTO } from '@travel/types';

import { useArchiveAgency, useDeleteAgency, useRestoreAgency } from '@/hooks/useAgencies';
import { ActivitiesTab } from '@/components/crm/ActivitiesTab';
import { ContactsTab } from '@/components/crm/ContactsTab';
import { DocumentsTab } from '@/components/crm/DocumentsTab';
import { FollowUpsTab } from '@/components/crm/FollowUpsTab';
import { NotesTab } from '@/components/crm/NotesTab';
import { TasksTab } from '@/components/crm/TasksTab';
import { TimelineTab } from '@/components/crm/TimelineTab';
import { VerificationTab } from '@/components/crm/VerificationTab';
import { MarketplaceTab } from '@/components/marketplace/MarketplaceTab';
import { PackagesTab } from '@/components/marketplace/PackagesListPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'secondary' | 'destructive' | 'default'
> = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary',
  archived: 'secondary',
  suspended: 'destructive',
};
const VERIFICATION_VARIANT: Record<
  string,
  'success' | 'info' | 'secondary' | 'destructive' | 'default'
> = {
  verified: 'success',
  pending: 'info',
  unverified: 'secondary',
  rejected: 'destructive',
};

type Tab =
  | 'overview'
  | 'contacts'
  | 'activities'
  | 'notes'
  | 'tasks'
  | 'followups'
  | 'timeline'
  | 'documents'
  | 'verification'
  | 'packages'
  | 'marketplace'
  | 'ai';

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Overview', icon: Building2 },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'followups', label: 'Follow-ups', icon: Clock },
  { id: 'timeline', label: 'Timeline', icon: Timer },
  { id: 'documents', label: 'Documents', icon: Archive },
  { id: 'verification', label: 'Verification', icon: CheckSquare },
  { id: 'packages', label: 'Packages', icon: Archive },
  { id: 'marketplace', label: 'Marketplace', icon: Globe },
  { id: 'ai', label: 'AI', icon: Activity },
];

const PLACEHOLDER_TABS: Tab[] = ['ai'];

export function AgencyDetail({ agency }: { agency: AgencyDTO }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const archiveMutation = useArchiveAgency();
  const restoreMutation = useRestoreAgency();
  const deleteMutation = useDeleteAgency();

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this agency?')) return;
    await deleteMutation.mutateAsync(agency.id);
    router.push('/dashboard/agencies');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="Back">
            <Link href="/dashboard/agencies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-foreground text-2xl font-bold">{agency.name}</h1>
              <Badge variant={STATUS_VARIANT[agency.status] ?? 'default'} className="capitalize">
                {agency.status}
              </Badge>
              <Badge
                variant={VERIFICATION_VARIANT[agency.verificationStatus] ?? 'default'}
                className="capitalize"
              >
                {agency.verificationStatus}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {agency.agencyCode} · {agency.address.city}, {agency.address.state}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {agency.status === 'archived' ? (
            <Button variant="outline" size="sm" onClick={() => restoreMutation.mutate(agency.id)}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Restore
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => archiveMutation.mutate(agency.id)}>
              <Archive className="mr-2 h-4 w-4" aria-hidden="true" />
              Archive
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/agencies/${agency.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>

      {/* Profile completion bar */}
      <div className="border-border bg-card flex items-center gap-3 rounded-lg border px-4 py-3">
        <div className="flex-1">
          <p className="text-muted-foreground mb-1 text-xs font-medium">Profile Completion</p>
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                agency.profileCompletion >= 80
                  ? 'bg-green-500'
                  : agency.profileCompletion >= 50
                    ? 'bg-yellow-500'
                    : 'bg-red-400',
              )}
              style={{ width: `${agency.profileCompletion}%` }}
            />
          </div>
        </div>
        <span className="text-foreground text-sm font-semibold">{agency.profileCompletion}%</span>
      </div>

      {/* Tabs */}
      <div className="border-border overflow-x-auto border-b">
        <nav className="flex min-w-max gap-0" aria-label="Agency sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:border-border border-transparent',
                PLACEHOLDER_TABS.includes(id) && 'opacity-50',
              )}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab agency={agency} />}
        {activeTab === 'contacts' && <ContactsTab agencyId={agency.id} />}
        {activeTab === 'activities' && <ActivitiesTab agencyId={agency.id} />}
        {activeTab === 'notes' && <NotesTab agencyId={agency.id} />}
        {activeTab === 'tasks' && <TasksTab agencyId={agency.id} />}
        {activeTab === 'followups' && <FollowUpsTab agencyId={agency.id} />}
        {activeTab === 'timeline' && <TimelineTab agencyId={agency.id} />}
        {activeTab === 'documents' && <DocumentsTab agencyId={agency.id} />}
        {activeTab === 'verification' && <VerificationTab agencyId={agency.id} />}
        {activeTab === 'packages' && <PackagesTab agencyId={agency.id} />}
        {activeTab === 'marketplace' && <MarketplaceTab agencyId={agency.id} />}
        {(['ai'] as Tab[]).includes(activeTab) && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-foreground text-lg font-semibold capitalize">{activeTab}</p>
            <p className="text-muted-foreground text-sm">
              This module will be available in a future phase.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ agency }: { agency: AgencyDTO }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="Legal Name" value={agency.legalName} />
            <InfoRow label="Owner" value={agency.ownerName} />
            <InfoRow label="Contact" value={agency.primaryContactName} />
            <InfoRow label="Year Est." value={agency.yearEstablished?.toString()} />
            <InfoRow label="Employees" value={agency.employeeCount} />
            <InfoRow label="GST" value={agency.gstNumber} mono />
            <InfoRow label="PAN" value={agency.panNumber} mono />
            <InfoRow label="Rating" value={agency.rating ? `${agency.rating}/5` : undefined} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <InfoRow label="Email" value={agency.email} icon={<Mail className="h-3.5 w-3.5" />} />
            <InfoRow label="Secondary Email" value={agency.secondaryEmail} />
            <InfoRow label="Phone" value={agency.phone} icon={<Phone className="h-3.5 w-3.5" />} />
            <InfoRow label="Secondary Phone" value={agency.secondaryPhone} />
            <InfoRow label="WhatsApp" value={agency.whatsapp} />
            {agency.website && (
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-xs">Website</p>
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center gap-1 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  {agency.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-foreground">
              {[
                agency.address.street,
                agency.address.city,
                agency.address.state,
                agency.address.country,
                agency.address.postalCode,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
          </CardContent>
        </Card>
        {agency.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap text-sm">{agency.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Services</CardTitle>
          </CardHeader>
          <CardContent>
            {agency.services.length ? (
              <div className="flex flex-wrap gap-1.5">
                {agency.services.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">None added</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            {agency.destinations.length ? (
              <div className="flex flex-wrap gap-1.5">
                {agency.destinations.map((d) => (
                  <Badge key={d} variant="info">
                    {d}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">None added</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {agency.tags.length ? (
              <div className="flex flex-wrap gap-1.5">
                {agency.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">None</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-xs">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(agency.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span>{' '}
              {new Date(agency.updatedAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Marketplace:</span>{' '}
              <span className="capitalize">{agency.marketplaceStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  icon?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={cn('text-foreground flex items-center gap-1', mono ? 'font-mono' : '')}>
        {icon}
        {value}
      </p>
    </div>
  );
}
