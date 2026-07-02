'use client';

import { Building2, Download, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';

import type { AgencyListQuery } from '@travel/types';

import {
  useAgencies,
  useArchiveAgency,
  useBulkAgencyOperation,
  useDeleteAgency,
} from '@/hooks/useAgencies';
import { agencyApi } from '@/services/agency.api';
import { AgencyTable } from './AgencyTable';
import { AgencyFilters } from './AgencyFilters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function AgencyListPage() {
  const [query, setQuery] = useState<Partial<AgencyListQuery>>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading, isError } = useAgencies(query);
  const archiveMutation = useArchiveAgency();
  const deleteMutation = useDeleteAgency();
  const bulkMutation = useBulkAgencyOperation();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setQuery((q) => ({ ...q, search: value || undefined, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((filters: Partial<AgencyListQuery>) => {
    setQuery((q) => ({ ...q, ...filters, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setQuery((q) => ({ ...q, page }));
  }, []);

  const handleBulkAction = useCallback(
    (action: 'delete' | 'archive' | 'restore' | 'activate' | 'deactivate') => {
      if (!selectedIds.length) return;
      bulkMutation.mutate({ ids: selectedIds, action });
      setSelectedIds([]);
    },
    [selectedIds, bulkMutation],
  );

  const activeFilters = Object.entries(query).filter(
    ([k, v]) => !['page', 'limit', 'sortBy', 'sortOrder'].includes(k) && v !== undefined,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Agencies</h1>
          <p className="text-muted-foreground text-sm">
            {data?.pagination.total ?? 0} total agencies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => agencyApi.exportCsv(query)}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/agencies/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add Agency
            </Link>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search
            className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            placeholder="Search agencies…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
            aria-label="Search agencies"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
          Filters
          {activeFilters.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">
              {activeFilters.length}
            </Badge>
          )}
        </Button>
        {activeFilters.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' })}
          >
            <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <AgencyFilters
          current={query}
          onChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="border-border bg-muted/50 flex items-center gap-3 rounded-lg border px-4 py-2.5">
          <span className="text-muted-foreground text-sm">{selectedIds.length} selected</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
              Archive
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
              Activate
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
              Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" label="Loading agencies…" />
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load agencies"
          description="There was an error fetching the agencies. Please try again."
          icon={<Building2 className="h-6 w-6" />}
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      ) : !data?.items.length ? (
        <EmptyState
          title="No agencies found"
          description={
            search ? 'No agencies match your search.' : 'Get started by adding your first agency.'
          }
          icon={<Building2 className="h-6 w-6" />}
          action={
            <Button asChild>
              <Link href="/dashboard/agencies/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Add Agency
              </Link>
            </Button>
          }
        />
      ) : (
        <AgencyTable
          agencies={data.items}
          pagination={data.pagination}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onPageChange={handlePageChange}
          onSort={(col, dir) => setQuery((q) => ({ ...q, sortBy: col, sortOrder: dir }))}
          onArchive={(id) => archiveMutation.mutate(id)}
          onDelete={(id) => deleteMutation.mutate(id)}
          sortBy={query.sortBy ?? 'createdAt'}
          sortOrder={query.sortOrder ?? 'desc'}
        />
      )}
    </div>
  );
}
