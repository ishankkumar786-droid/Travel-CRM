'use client';

import { FileText, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';

import type { DocumentDTO } from '@travel/types';

import { useDeleteDocument, useDocuments, useUploadDocument } from '@/hooks/usePhase6';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const DOC_TYPES = [
  'gst',
  'pan',
  'trade_license',
  'company_registration',
  'iata',
  'ministry_registration',
  'brochure',
  'price_list',
  'other',
];
const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'secondary' | 'destructive' | 'default'
> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'destructive',
  expired: 'secondary',
};

export function DocumentsTab({ agencyId }: { agencyId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const { data: docs, isLoading } = useDocuments(agencyId);
  const uploadMutation = useUploadDocument(agencyId);
  const deleteMutation = useDeleteDocument(agencyId);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    const type = typeRef.current?.value;
    if (!file || !type) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    await uploadMutation.mutateAsync(fd);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    );

  const documents = docs ?? [];

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="border-border bg-card flex flex-wrap gap-3 rounded-lg border p-4">
        <select
          ref={typeRef}
          defaultValue="gst"
          className="border-input bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
          aria-label="Document type"
        >
          {DOC_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="border-input bg-background flex-1 rounded-md border px-3 py-1.5 text-sm"
          aria-label="Select document file"
        />
        <Button size="sm" onClick={handleUpload} loading={uploadMutation.isPending}>
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          Upload
        </Button>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <EmptyState
          title="No documents"
          description="Upload verification documents for this agency."
          icon={<FileText className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc: DocumentDTO) => (
            <div
              key={doc.id}
              className="border-border flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-foreground text-sm font-medium capitalize">
                    {doc.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {doc.originalName} · v{doc.version} · {Math.round(doc.sizeBytes / 1024)}KB
                  </p>
                  {doc.expiryDate && (
                    <p className="text-muted-foreground text-xs">
                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[doc.status] ?? 'default'} className="capitalize">
                  {doc.status}
                </Badge>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs hover:underline"
                >
                  View
                </a>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(doc.id)}>
                  <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
