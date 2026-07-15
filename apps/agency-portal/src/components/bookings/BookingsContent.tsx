'use client';

import { useState } from 'react';
import {
  ClipboardList,
  Search,
  MessageSquare,
  Calendar,
  User,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

/* ─── Types & Mock Data ────────────────────────────────────────────────────── */

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  packageName: string;
  message: string;
  status: 'new' | 'responded' | 'converted' | 'closed';
  date: string;
  travelDate?: string;
  guests?: number;
}

const MOCK_ENQUIRIES: Enquiry[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    packageName: 'Goa Beach Paradise',
    message:
      'Hi, I am interested in this package for 4 people. Can you provide more details about accommodation?',
    status: 'new',
    date: '2026-07-14T10:30:00Z',
    travelDate: '2026-08-15',
    guests: 4,
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 87654 32109',
    packageName: 'Manali Mountain Explorer',
    message: 'Looking for a customized package with trekking activities included.',
    status: 'responded',
    date: '2026-07-13T14:20:00Z',
    travelDate: '2026-09-01',
    guests: 2,
  },
  {
    id: '3',
    name: 'Amit Verma',
    email: 'amit@example.com',
    phone: '+91 76543 21098',
    packageName: 'Rajasthan Heritage Tour',
    message: 'Would like to know about the hotel options and meal plan included.',
    status: 'converted',
    date: '2026-07-12T09:15:00Z',
    guests: 6,
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    email: 'sneha@example.com',
    phone: '+91 65432 10987',
    packageName: 'Kerala Backwaters Cruise',
    message: "Interested but the dates don't work for us. Any alternative dates available?",
    status: 'closed',
    date: '2026-07-10T16:45:00Z',
    guests: 3,
  },
];

const statusConfig = {
  new: { label: 'New', variant: 'info' as const, icon: AlertCircle },
  responded: { label: 'Responded', variant: 'warning' as const, icon: MessageSquare },
  converted: { label: 'Converted', variant: 'success' as const, icon: CheckCircle2 },
  closed: { label: 'Closed', variant: 'secondary' as const, icon: XCircle },
};

const tabs = [
  { key: 'all', label: 'All', count: 4 },
  { key: 'new', label: 'New', count: 1 },
  { key: 'responded', label: 'Responded', count: 1 },
  { key: 'converted', label: 'Converted', count: 1 },
  { key: 'closed', label: 'Closed', count: 1 },
] as const;

/* ─── Component ────────────────────────────────────────────────────────────── */

export function BookingsContent() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<string | null>(null);

  const filtered = MOCK_ENQUIRIES.filter((e) => {
    const matchesTab = activeTab === 'all' || e.status === activeTab;
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.packageName.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selected = MOCK_ENQUIRIES.find((e) => e.id === selectedEnquiry);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookings & Enquiries</h1>
        <p className="text-muted-foreground">Manage customer enquiries and bookings</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'New Enquiries', value: '1', color: 'text-info' },
          { label: 'Awaiting Response', value: '1', color: 'text-warning' },
          { label: 'Converted', value: '1', color: 'text-success' },
          { label: 'Total This Month', value: '4', color: 'text-primary' },
        ].map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-4 text-center">
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-muted-foreground mt-1 text-xs">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-xs',
                activeTab === tab.key
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search enquiries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Enquiry list */}
        <div className={cn('space-y-2', selected ? 'lg:col-span-2' : 'lg:col-span-5')}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No enquiries found"
              description="Try adjusting your search or filters."
            />
          ) : (
            filtered.map((enquiry, i) => {
              const config = statusConfig[enquiry.status];
              const StatusIcon = config.icon;
              return (
                <Card
                  key={enquiry.id}
                  className={cn(
                    'animate-fade-in cursor-pointer transition-all duration-200',
                    selectedEnquiry === enquiry.id
                      ? 'border-primary ring-primary/20 ring-1'
                      : 'hover:border-primary/30',
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => setSelectedEnquiry(enquiry.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{enquiry.name}</p>
                          <Badge variant={config.variant} className="shrink-0">
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1 truncate text-xs">
                          {enquiry.packageName}
                        </p>
                        <p className="text-muted-foreground mt-1.5 line-clamp-1 text-xs">
                          {enquiry.message}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-muted-foreground text-xs">
                          {new Date(enquiry.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <ChevronRight className="text-muted-foreground ml-auto mt-2 h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <Card className="animate-slide-in-right lg:col-span-3">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selected.name}</CardTitle>
                  <CardDescription>{selected.packageName}</CardDescription>
                </div>
                <Badge variant={statusConfig[selected.status].variant}>
                  {statusConfig[selected.status].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Contact info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span>{selected.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span>{selected.phone}</span>
                </div>
                {selected.travelDate && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span>
                      Travel:{' '}
                      {new Date(selected.travelDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {selected.guests && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span>{selected.guests} guests</span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-muted-foreground mb-1.5 text-xs font-medium">Message</p>
                <p className="text-foreground text-sm">{selected.message}</p>
              </div>

              {/* Enquiry time */}
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Received on{' '}
                  {new Date(selected.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 border-t pt-2">
                <Button size="sm" onClick={() => toast.success('Reply draft opened')}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success('Quotation builder opened')}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Create Quotation
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEnquiry(null)}>
                  Close Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
