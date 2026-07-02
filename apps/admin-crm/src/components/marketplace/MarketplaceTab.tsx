'use client';

import { CheckCircle, Globe, TrendingUp, XCircle } from 'lucide-react';

import {
  useMarketplaceProfile,
  useMarketplaceReadiness,
  useUpdateOnboardingStage,
  useOnboarding,
} from '@/hooks/useMarketplace';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const STAGE_LABELS: Record<string, string> = {
  invited: 'Invited',
  applied: 'Applied',
  documents_submitted: 'Docs Submitted',
  verification_pending: 'Verification Pending',
  verified: 'Verified',
  marketplace_approved: 'Marketplace Approved',
  live: 'Live',
  suspended: 'Suspended',
  rejected: 'Rejected',
};

const STAGE_VARIANT: Record<
  string,
  'success' | 'warning' | 'info' | 'secondary' | 'destructive' | 'default'
> = {
  live: 'success',
  marketplace_approved: 'success',
  verified: 'info',
  verification_pending: 'warning',
  suspended: 'destructive',
  rejected: 'destructive',
};

const NEXT_STAGES: Record<string, string[]> = {
  invited: ['applied'],
  applied: ['documents_submitted', 'rejected'],
  documents_submitted: ['verification_pending', 'rejected'],
  verification_pending: ['verified', 'rejected'],
  verified: ['marketplace_approved', 'rejected'],
  marketplace_approved: ['live', 'suspended'],
  live: ['suspended'],
  suspended: ['live', 'rejected'],
};

export function MarketplaceTab({ agencyId }: { agencyId: string }) {
  const { data: onboarding, isLoading: loadingOb } = useOnboarding(agencyId);
  const { data: profile, isLoading: loadingProfile } = useMarketplaceProfile(agencyId);
  const { data: readiness, isLoading: loadingReadiness } = useMarketplaceReadiness(agencyId);
  const stageMutation = useUpdateOnboardingStage(agencyId);

  if (loadingOb || loadingProfile || loadingReadiness)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );

  const currentStage = onboarding?.stage ?? 'invited';
  const nextStages = NEXT_STAGES[currentStage] ?? [];

  return (
    <div className="space-y-6">
      {/* Onboarding stage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Onboarding Stage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              variant={STAGE_VARIANT[currentStage] ?? 'default'}
              className="px-3 py-1 text-sm capitalize"
            >
              {STAGE_LABELS[currentStage] ?? currentStage}
            </Badge>
            {onboarding?.marketplaceEligible && (
              <Badge variant="success">Marketplace Eligible</Badge>
            )}
          </div>

          {nextStages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {nextStages.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === 'rejected' || s === 'suspended' ? 'destructive' : 'outline'}
                  loading={stageMutation.isPending}
                  onClick={() => stageMutation.mutate({ stage: s })}
                >
                  {s === 'live' ? '🚀 Go Live' : (STAGE_LABELS[s] ?? s)}
                </Button>
              ))}
            </div>
          )}

          {/* History */}
          {(onboarding?.history?.length ?? 0) > 0 && (
            <div className="border-border space-y-1.5 border-t pt-2">
              <p className="text-muted-foreground text-xs font-medium">Stage History</p>
              {[...(onboarding?.history ?? [])]
                .reverse()
                .slice(0, 5)
                .map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-foreground capitalize">
                      {STAGE_LABELS[h.stage] ?? h.stage}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(h.changedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Readiness score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Marketplace Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Overall Score</span>
                <span className="text-foreground font-bold">
                  {readiness?.overallScore ?? 0}/100
                </span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${readiness?.readinessPercent ?? 0}%` }}
                />
              </div>
            </div>
            {readiness?.isEligible ? (
              <Badge variant="success">Eligible</Badge>
            ) : (
              <Badge variant="warning">Not Eligible</Badge>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: 'Verification', score: readiness?.verificationScore ?? 0 },
              { label: 'Profile', score: readiness?.profileScore ?? 0 },
              { label: 'Trust', score: readiness?.trustScore ?? 0 },
            ].map(({ label, score }) => (
              <div key={label} className="border-border rounded-lg border p-3 text-center">
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="text-foreground text-xl font-bold">{score}</p>
              </div>
            ))}
          </div>

          {(readiness?.missingItems?.length ?? 0) > 0 && (
            <div className="space-y-1.5">
              <p className="text-destructive text-xs font-medium">Missing</p>
              {readiness?.missingItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <XCircle className="text-destructive h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          )}

          {(readiness?.recommendations?.length ?? 0) > 0 && (
            <div className="space-y-1.5">
              <p className="text-primary text-xs font-medium">Recommendations</p>
              {readiness?.recommendations.map((r) => (
                <div key={r} className="flex items-start gap-2 text-sm">
                  <CheckCircle
                    className="text-primary mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{r}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Public profile */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Public Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Public Slug</span>
              <code className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                {profile.publicSlug}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Visible to public</span>
              <Badge variant={profile.isPublic ? 'success' : 'secondary'}>
                {profile.isPublic ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
