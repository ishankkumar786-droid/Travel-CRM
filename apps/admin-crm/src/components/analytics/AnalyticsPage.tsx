'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useAnalytics } from '@/hooks/usePhase6';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-foreground text-2xl font-bold">Analytics</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const agencyByStatusData = Object.entries(data?.agencies.byStatus ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
  const agencyByMonthData = data?.agencies.byMonth ?? [];
  const actByTypeData = Object.entries(data?.activities.byType ?? {}).map(([name, value]) => ({
    name,
    value,
  }));
  const taskByPriorityData = Object.entries(data?.tasks.byPriority ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-bold">Analytics</h1>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Agencies" value={data?.agencies.total ?? 0} />
        <KpiCard title="Verification Rate" value={`${data?.verification.rate ?? 0}%`} />
        <KpiCard title="Task Completion" value={`${data?.tasks.completion ?? 0}%`} />
        <KpiCard title="Total Activities" value={data?.activities.total ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agency growth by month */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agency Growth (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agencyByMonthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agency by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agencies by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={agencyByStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                >
                  {agencyByStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activities by type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activities by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={actByTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tasks by priority */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={taskByPriorityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {taskByPriorityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top contributors */}
      {(data?.activities.byUser ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Activity Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.activities.byUser.slice(0, 5).map((u) => (
                <div key={u.userId} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{u.name}</span>
                  <span className="text-primary font-medium">{u.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-muted-foreground text-sm">{title}</p>
        <p className="text-foreground mt-1 text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
