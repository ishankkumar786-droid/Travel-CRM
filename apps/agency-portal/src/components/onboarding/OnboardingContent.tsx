'use client';

import {
  CheckCircle2,
  Circle,
  ArrowRight,
  FileText,
  Building2,
  ShieldCheck,
  Package,
  CreditCard,
  Rocket,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'upcoming';
  actionLabel?: string;
  actionHref?: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete Business Profile',
    description: 'Add your agency name, contact details, address, and business information.',
    icon: Building2,
    status: 'completed',
  },
  {
    id: 'documents',
    title: 'Submit Documents',
    description: 'Upload your GST certificate, PAN card, and business registration documents.',
    icon: FileText,
    status: 'completed',
  },
  {
    id: 'verification',
    title: 'Verification Review',
    description: 'Our team will verify your submitted documents and business details.',
    icon: ShieldCheck,
    status: 'current',
    actionLabel: 'Check Status',
    actionHref: '/settings',
  },
  {
    id: 'packages',
    title: 'Add Travel Packages',
    description: 'Create at least 3 travel packages to showcase on the marketplace.',
    icon: Package,
    status: 'upcoming',
    actionLabel: 'Add Packages',
    actionHref: '/packages/new',
  },
  {
    id: 'bank',
    title: 'Add Bank Details',
    description: 'Set up your payment information to receive booking payments.',
    icon: CreditCard,
    status: 'upcoming',
    actionLabel: 'Add Bank Info',
    actionHref: '/settings',
  },
  {
    id: 'launch',
    title: 'Go Live on Marketplace',
    description: 'Once everything is ready, your agency will go live on the marketplace.',
    icon: Rocket,
    status: 'upcoming',
  },
];

const statusConfig = {
  completed: {
    badge: 'Completed',
    variant: 'success' as const,
    lineColor: 'bg-success',
  },
  current: {
    badge: 'In Progress',
    variant: 'warning' as const,
    lineColor: 'bg-warning',
  },
  upcoming: {
    badge: 'Upcoming',
    variant: 'secondary' as const,
    lineColor: 'bg-muted',
  },
};

/* ─── Component ────────────────────────────────────────────────────────────── */

export function OnboardingContent() {
  const completedCount = STEPS.filter((s) => s.status === 'completed').length;
  const progress = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
        <p className="text-muted-foreground">
          Complete these steps to get your agency live on the marketplace
        </p>
      </div>

      {/* Progress Card */}
      <Card className="border-primary/20 from-primary/5 via-background to-accent/5 bg-gradient-to-r">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-bold">{progress}% Complete</h2>
                <Badge variant="info">
                  {completedCount}/{STEPS.length} steps
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                You&apos;re making great progress! Complete the remaining steps to go live.
              </p>
            </div>
            <div className="w-full sm:w-48">
              <div className="bg-muted h-3 overflow-hidden rounded-full">
                <div
                  className="from-primary to-accent h-full rounded-full bg-gradient-to-r transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Timeline */}
      <div className="space-y-0">
        {STEPS.map((step, index) => {
          const config = statusConfig[step.status];
          const isLast = index === STEPS.length - 1;

          return (
            <div
              key={step.id}
              className="animate-fade-in relative flex gap-4"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    step.status === 'completed' &&
                      'border-success bg-success text-success-foreground',
                    step.status === 'current' && 'border-warning bg-warning/10 text-warning',
                    step.status === 'upcoming' && 'border-muted bg-muted text-muted-foreground',
                  )}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {!isLast && <div className={cn('min-h-[2rem] w-0.5 flex-1', config.lineColor)} />}
              </div>

              {/* Content */}
              <Card
                className={cn(
                  'mb-4 flex-1 transition-all',
                  step.status === 'current' && 'border-warning/30 shadow-warning/5 shadow-md',
                  step.status === 'completed' && 'opacity-75',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{step.title}</h3>
                        <Badge variant={config.variant} className="text-[10px]">
                          {config.badge}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">{step.description}</p>
                    </div>
                    {step.actionLabel && step.status !== 'completed' && (
                      <Button
                        variant={step.status === 'current' ? 'default' : 'outline'}
                        size="sm"
                        className="shrink-0"
                      >
                        {step.actionLabel}
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
