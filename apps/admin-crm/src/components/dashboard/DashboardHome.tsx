'use client';

import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle,
  CheckSquare,
  Clock,
  Plus,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

import { useCRMStats } from '@/hooks/useCRM';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
  variant = 'default',
}: {
  title: string;
  value?: number;
  icon: React.ElementType;
  loading?: boolean;
  variant?: 'default' | 'warning' | 'danger' | 'success';
}) {
  const colors = {
    default: 'bg-primary/10 text-primary',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400',
  };

  return (
    <Card>
      <CardContent className="pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            {loading ? (
              <Skeleton className="mt-1 h-8 w-12" />
            ) : (
              <p className="text-foreground mt-1 text-2xl font-bold">{value ?? 0}</p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${colors[variant]}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardHome() {
  const { data: stats, isLoading } = useCRMStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your workspace at a glance</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/agencies/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add Agency
          </Link>
        </Button>
      </div>

      {/* Agency stats */}
      <div>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
          Agencies
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            title="Total"
            value={stats?.agencies.total}
            icon={Building2}
            loading={isLoading}
          />
          <StatCard
            title="Active"
            value={stats?.agencies.active}
            icon={CheckCircle}
            loading={isLoading}
            variant="success"
          />
          <StatCard
            title="Pending"
            value={stats?.agencies.pending}
            icon={Clock}
            loading={isLoading}
            variant="warning"
          />
          <StatCard
            title="This Week"
            value={stats?.agencies.addedThisWeek}
            icon={TrendingUp}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Task stats */}
      <div>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
          My Tasks
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            title="Overdue"
            value={stats?.tasks.overdue}
            icon={AlertCircle}
            loading={isLoading}
            variant="danger"
          />
          <StatCard
            title="Due Today"
            value={stats?.tasks.dueToday}
            icon={Clock}
            loading={isLoading}
            variant="warning"
          />
          <StatCard
            title="Assigned to Me"
            value={stats?.tasks.assignedToMe}
            icon={CheckSquare}
            loading={isLoading}
          />
          <StatCard
            title="Total Pending"
            value={stats?.tasks.totalPending}
            icon={CheckSquare}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Follow-up stats */}
      <div>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
          Follow-ups
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard
            title="Due Today"
            value={stats?.followups.dueToday}
            icon={Clock}
            loading={isLoading}
            variant="warning"
          />
          <StatCard
            title="Overdue"
            value={stats?.followups.overdue}
            icon={AlertCircle}
            loading={isLoading}
            variant="danger"
          />
          <StatCard
            title="Activities Today"
            value={stats?.activities.todayCount}
            icon={Activity}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/agencies">
              <Building2 className="mr-2 h-4 w-4" aria-hidden="true" />
              All Agencies
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/agencies?status=pending">
              <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
              Pending ({isLoading ? '…' : (stats?.agencies.pending ?? 0)})
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/agencies/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add Agency
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Month summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">This Month</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {isLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <>
              <Badge variant="info">{stats?.agencies.addedThisMonth ?? 0} agencies added</Badge>
              <Badge variant="success">
                {stats?.activities.recentCount ?? 0} activities logged
              </Badge>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
