'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

import type { VerificationDTO } from '@travel/types';

import { useUpdateVerificationStage, useVerification, useVerifyField } from '@/hooks/usePhase6';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const STAGE_ORDER = [
  'pending',
  'researching',
  'documents_requested',
  'documents_received',
  'under_review',
  'verified',
  'rejected',
  'expired',
];

const FIELDS: Array<{ key: string; label: string }> = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'website', label: 'Website' },
  { key: 'gst', label: 'GST Number' },
  { key: 'pan', label: 'PAN Number' },
  { key: 'govtReg', label: 'Govt Registration' },
  { key: 'association', label: 'Association' },
];

export function VerificationTab({ agencyId }: { agencyId: string }) {
  const { data: v, isLoading } = useVerification(agencyId);
  const stageMutation = useUpdateVerificationStage(agencyId);
  const fieldMutation = useVerifyField(agencyId);

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );
  if (!v) return null;

  const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(v.stage) + 1];
  const fields = v.fields as Record<string, { status: string } | undefined>;

  return (
    <div className="space-y-5">
      {/* Stage progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Stage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STAGE_ORDER.map((s) => (
              <Badge
                key={s}
                variant={
                  s === v.stage
                    ? 'info'
                    : STAGE_ORDER.indexOf(s) < STAGE_ORDER.indexOf(v.stage)
                      ? 'success'
                      : 'secondary'
                }
                className="text-xs capitalize"
              >
                {s.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
          <div className="flex gap-3">
            <p className="text-muted-foreground text-sm">
              Score: <strong>{v.verificationScore}/100</strong>
            </p>
            {nextStage && nextStage !== 'rejected' && nextStage !== 'expired' && (
              <Button
                size="sm"
                variant="outline"
                loading={stageMutation.isPending}
                onClick={() => stageMutation.mutate({ stage: nextStage })}
              >
                Advance to {nextStage.replace(/_/g, ' ')}
              </Button>
            )}
            {v.stage !== 'verified' && v.stage !== 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-600"
                onClick={() => stageMutation.mutate({ stage: 'verified' })}
              >
                Mark Verified
              </Button>
            )}
            {v.stage !== 'rejected' && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => stageMutation.mutate({ stage: 'rejected' })}
              >
                Reject
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map(({ key, label }) => {
              const fv = fields[key];
              const isVerified = fv?.status === 'verified';
              const isFailed = fv?.status === 'failed';
              return (
                <div
                  key={key}
                  className="border-border flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    {isVerified ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                    ) : isFailed ? (
                      <XCircle className="text-destructive h-4 w-4" aria-hidden="true" />
                    ) : (
                      <div
                        className="border-muted h-4 w-4 rounded-full border-2"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-foreground text-sm">{label}</span>
                  </div>
                  <div className="flex gap-1">
                    {!isVerified && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-green-600"
                        loading={fieldMutation.isPending}
                        onClick={() => fieldMutation.mutate({ field: key, status: 'verified' })}
                      >
                        Verify
                      </Button>
                    )}
                    {!isFailed && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive h-7 px-2 text-xs"
                        onClick={() => fieldMutation.mutate({ field: key, status: 'failed' })}
                      >
                        Fail
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {v.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stage History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...v.history].reverse().map((h: VerificationDTO['history'][0], i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground capitalize">{h.stage.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(h.changedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
