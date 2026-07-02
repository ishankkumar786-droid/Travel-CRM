'use client';

import { Upload, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';

import type { ImportJobDTO } from '@travel/types';

import { useImportJobs, useImportPreview, useStartImport } from '@/hooks/usePhase6';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'secondary' | 'destructive' | 'info' | 'default'
> = {
  completed: 'success',
  processing: 'info',
  pending: 'warning',
  failed: 'destructive',
  rolled_back: 'secondary',
};

export function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{
    jobId: string;
    preview: unknown[];
    totalRows: number;
  } | null>(null);
  const [format, setFormat] = useState('csv');
  const [conflictStrategy, setConflictStrategy] = useState('skip');
  const { data: jobs, isLoading: jobsLoading, refetch } = useImportJobs();
  const previewMutation = useImportPreview();
  const startMutation = useStartImport();

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', file.name);
    fd.append('format', format);
    fd.append('conflictStrategy', conflictStrategy);
    const result = await previewMutation.mutateAsync(fd);
    setPreview(result);
  };

  const handleProcess = async () => {
    if (!preview) return;
    await startMutation.mutateAsync(preview.jobId);
    setPreview(null);
    void refetch();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-foreground text-2xl font-bold">Import Agencies</h1>

      {/* Upload zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              >
                {['csv', 'xlsx', 'json'].map((f) => (
                  <option key={f} value={f}>
                    {f.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Conflict Strategy</label>
              <select
                value={conflictStrategy}
                onChange={(e) => setConflictStrategy(e.target.value)}
                className="border-input bg-background focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
              >
                {['skip', 'merge', 'overwrite'].map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">File</label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.json"
                className="border-input bg-background w-full rounded-md border px-3 py-1.5 text-sm"
                aria-label="Select import file"
              />
            </div>
          </div>
          <Button
            onClick={handleUpload}
            loading={previewMutation.isPending}
            disabled={previewMutation.isPending}
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            Preview Import
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview — {preview.totalRows} rows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-border overflow-x-auto rounded border">
              <table className="w-full text-xs">
                <tbody>
                  {(preview.preview as Record<string, unknown>[]).map((row, i) => (
                    <tr key={i} className="border-border border-b last:border-0">
                      {Object.entries(row)
                        .slice(0, 6)
                        .map(([k, v]) => (
                          <td key={k} className="text-muted-foreground px-3 py-2">
                            <span className="text-foreground font-medium">{k}:</span>{' '}
                            {String(v ?? '')}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleProcess} loading={startMutation.isPending}>
                Start Import ({preview.totalRows} rows)
              </Button>
              <Button variant="outline" onClick={() => setPreview(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job history */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Import History</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => void refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : !jobs?.length ? (
            <EmptyState
              title="No imports yet"
              description="Upload a file to get started."
              icon={<Upload className="h-6 w-6" />}
            />
          ) : (
            <div className="space-y-3">
              {jobs.map((job: ImportJobDTO) => (
                <div
                  key={job.id}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="text-foreground font-medium">{job.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {job.format.toUpperCase()} · {job.successRows}/{job.totalRows} rows ·{' '}
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[job.status] ?? 'default'} className="capitalize">
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
