'use client';

import { useRouter } from 'next/navigation';
import {
  Package,
  TrendingUp,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  MapPin,
  Eye,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useAgencyProfile, usePackages } from '@/hooks/useAgencyPortal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn, formatCurrency } from '@/lib/utils';

/* ─── Stat Card ────────────────────────────────────────────────────────────── */

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

function StatCard({ title, value, change, changeType = 'neutral', icon, description, isLoading }: StatCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            )}
            {change && !isLoading && (
              <div className="flex items-center gap-1">
                {changeType === 'positive' ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-success" />
                ) : changeType === 'negative' ? (
                  <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                ) : null}
                <span
                  className={cn(
                    'text-xs font-medium',
                    changeType === 'positive' && 'text-success',
                    changeType === 'negative' && 'text-destructive',
                    changeType === 'neutral' && 'text-muted-foreground',
                  )}
                >
                  {change}
                </span>
                {description && (
                  <span className="text-xs text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Quick Action Card ────────────────────────────────────────────────────── */

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

function QuickAction({ icon, title, description, href }: QuickActionProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="group flex w-full items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </button>
  );
}

/* ─── Recent Activity Item ─────────────────────────────────────────────────── */

interface ActivityItem {
  id: string;
  type: 'booking' | 'review' | 'package' | 'profile';
  title: string;
  description: string;
  time: string;
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Enquiry Received',
    description: 'Rahul Sharma enquired about Goa Beach Package',
    time: '5 min ago',
  },
  {
    id: '2',
    type: 'review',
    title: 'New Review',
    description: 'Priya gave you a 5-star review for Manali Trip',
    time: '1 hour ago',
  },
  {
    id: '3',
    type: 'package',
    title: 'Package Published',
    description: 'Kerala Backwaters 5D/4N is now live on marketplace',
    time: '3 hours ago',
  },
  {
    id: '4',
    type: 'profile',
    title: 'Verification Complete',
    description: 'Your GST document has been verified successfully',
    time: 'Yesterday',
  },
];

const activityIcons: Record<string, React.ReactNode> = {
  booking: <CalendarDays className="h-4 w-4" />,
  review: <Star className="h-4 w-4" />,
  package: <Package className="h-4 w-4" />,
  profile: <Eye className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  booking: 'bg-info/10 text-info',
  review: 'bg-warning/10 text-warning',
  package: 'bg-success/10 text-success',
  profile: 'bg-primary/10 text-primary',
};

/* ─── Dashboard Content ────────────────────────────────────────────────────── */

export function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: agency, isLoading: agencyLoading } = useAgencyProfile();
  const { data: packages, isLoading: packagesLoading } = usePackages();

  const packageCount = packages?.items?.length ?? 0;
  const agencyName = agency?.name ?? user?.firstName ?? 'Agency';
  const profileCompletion = agency?.profileCompletion ?? 0;
  const isVerified = agency?.verificationStatus === 'verified';

  // No agencyId warning
  if (!user?.agencyId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.firstName ?? 'User'}! 👋
          </h1>
          <p className="text-muted-foreground">Your agency portal dashboard</p>
        </div>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-8 w-8 text-warning shrink-0" />
            <div>
              <p className="font-semibold text-foreground">No Agency Linked</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your account is not yet linked to an agency. Please contact an administrator to
                associate your account with an agency, or complete the registration process.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.firstName ?? 'Agency'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with <span className="font-medium text-foreground">{agencyName}</span> today.
          </p>
        </div>
        <Button onClick={() => router.push('/packages')}>
          <Package className="mr-2 h-4 w-4" />
          Manage Packages
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Packages"
          value={String(packageCount)}
          change={packageCount > 0 ? 'Live on marketplace' : 'Create your first!'}
          changeType={packageCount > 0 ? 'positive' : 'neutral'}
          icon={<Package className="h-5 w-5" />}
          isLoading={packagesLoading}
        />
        <StatCard
          title="Verification"
          value={isVerified ? 'Verified' : agency?.verificationStatus ?? '—'}
          change={isVerified ? 'All clear' : 'Action needed'}
          changeType={isVerified ? 'positive' : 'negative'}
          icon={<Users className="h-5 w-5" />}
          isLoading={agencyLoading}
        />
        <StatCard
          title="Profile Score"
          value={`${profileCompletion}%`}
          change={profileCompletion >= 80 ? 'Looking good!' : 'Needs improvement'}
          changeType={profileCompletion >= 80 ? 'positive' : 'negative'}
          icon={<TrendingUp className="h-5 w-5" />}
          isLoading={agencyLoading}
        />
        <StatCard
          title="Marketplace"
          value={agency?.marketplaceStatus === 'listed' ? 'Listed' : 'Unlisted'}
          change={agency?.marketplaceStatus === 'listed' ? 'Visible to customers' : 'Complete profile to list'}
          changeType={agency?.marketplaceStatus === 'listed' ? 'positive' : 'neutral'}
          icon={<Star className="h-5 w-5" />}
          isLoading={agencyLoading}
        />
      </div>

      {/* Main Grid: Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity — 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your agency</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {MOCK_ACTIVITIES.map((activity, i) => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-start gap-3.5 rounded-lg p-3 transition-colors hover:bg-muted/50',
                    i < MOCK_ACTIVITIES.length - 1 && 'border-b border-border/50',
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={cn('mt-0.5 rounded-lg p-2', activityColors[activity.type])}>
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions — 1 col */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction
              icon={<Package className="h-5 w-5" />}
              title="Add New Package"
              description="Create and publish a travel package"
              href="/packages"
            />
            <QuickAction
              icon={<MapPin className="h-5 w-5" />}
              title="Edit Marketplace Profile"
              description="Update your public-facing agency page"
              href="/marketplace"
            />
            <QuickAction
              icon={<CalendarDays className="h-5 w-5" />}
              title="View Onboarding"
              description="Check your onboarding progress"
              href="/onboarding"
            />
            <QuickAction
              icon={<Star className="h-5 w-5" />}
              title="Agency Settings"
              description="Update agency info and preferences"
              href="/settings"
            />
          </div>

          {/* Profile Completion */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">Profile Completion</p>
                <Badge variant={profileCompletion >= 80 ? 'success' : 'warning'}>
                  {profileCompletion}%
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {profileCompletion >= 80
                    ? 'Great job! Your profile is in good shape.'
                    : 'Complete your profile to improve visibility on the marketplace.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
