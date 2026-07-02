'use client';

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Archive, ArrowDown, ArrowUp, ArrowUpDown, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { AgencyListItem, PaginationMeta } from '@travel/types';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'secondary' | 'destructive' | 'default'
> = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary',
  archived: 'secondary',
  suspended: 'destructive',
};

const VERIFICATION_VARIANT: Record<
  string,
  'success' | 'info' | 'secondary' | 'destructive' | 'default'
> = {
  verified: 'success',
  pending: 'info',
  unverified: 'secondary',
  rejected: 'destructive',
};

interface AgencyTableProps {
  agencies: AgencyListItem[];
  pagination: PaginationMeta;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onPageChange: (page: number) => void;
  onSort: (col: string, dir: 'asc' | 'desc') => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function AgencyTable({
  agencies,
  pagination,
  selectedIds,
  onSelectionChange,
  onPageChange,
  onSort,
  onArchive,
  onDelete,
  sortBy,
  sortOrder,
}: AgencyTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns: ColumnDef<AgencyListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => {
            table.toggleAllPageRowsSelected(e.target.checked);
            if (e.target.checked) {
              onSelectionChange(agencies.map((a) => a.id));
            } else {
              onSelectionChange([]);
            }
          }}
          aria-label="Select all"
          className="border-border h-4 w-4 rounded"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => {
            row.toggleSelected(e.target.checked);
            if (e.target.checked) {
              onSelectionChange([...selectedIds, row.original.id]);
            } else {
              onSelectionChange(selectedIds.filter((id) => id !== row.original.id));
            }
          }}
          aria-label={`Select ${row.original.name}`}
          className="border-border h-4 w-4 rounded"
        />
      ),
      size: 40,
    },
    {
      accessorKey: 'agencyCode',
      header: 'Code',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground font-mono text-xs">{String(getValue())}</span>
      ),
      size: 90,
    },
    {
      accessorKey: 'name',
      header: () => (
        <SortButton label="Name" col="name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <div>
          <Link
            href={`/dashboard/agencies/${row.original.id}`}
            className="text-foreground hover:text-primary font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          <p className="text-muted-foreground text-xs">{row.original.ownerName}</p>
        </div>
      ),
    },
    {
      id: 'location',
      header: () => (
        <SortButton label="City" col="city" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.city}, {row.original.state}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const v = String(getValue());
        return (
          <Badge variant={STATUS_VARIANT[v] ?? 'default'} className="capitalize">
            {v}
          </Badge>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'verificationStatus',
      header: 'Verified',
      cell: ({ getValue }) => {
        const v = String(getValue());
        return (
          <Badge variant={VERIFICATION_VARIANT[v] ?? 'default'} className="capitalize">
            {v.replace('_', ' ')}
          </Badge>
        );
      },
      size: 110,
    },
    {
      accessorKey: 'profileCompletion',
      header: 'Profile',
      cell: ({ getValue }) => {
        const pct = Number(getValue());
        return (
          <div className="flex items-center gap-2">
            <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
              <div
                className={cn(
                  'h-full rounded-full',
                  pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-muted-foreground text-xs">{pct}%</span>
          </div>
        );
      },
      size: 130,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="View agency">
            <Link href={`/dashboard/agencies/${row.original.id}`}>
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Archive agency"
            onClick={() => onArchive(row.original.id)}
          >
            <Archive className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete agency"
            onClick={() => {
              if (window.confirm('Delete this agency?')) onDelete(row.original.id);
            }}
          >
            <Trash2 className="text-destructive h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ),
      size: 110,
    },
  ];

  const table = useReactTable({
    data: agencies,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
  });

  return (
    <div className="space-y-4">
      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-sm" role="grid">
          <thead className="bg-muted/50 sticky top-0">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-border text-muted-foreground border-b px-4 py-3 text-left text-xs font-medium"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-border hover:bg-muted/30 border-b transition-colors last:border-0',
                  row.getIsSelected() && 'bg-muted/50',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPreviousPage}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function SortButton({
  label,
  col,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  col: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (col: string, dir: 'asc' | 'desc') => void;
}) {
  const isActive = sortBy === col;
  const toggle = () => onSort(col, isActive && sortOrder === 'asc' ? 'desc' : 'asc');

  return (
    <button
      onClick={toggle}
      className="hover:text-foreground flex items-center gap-1"
      type="button"
    >
      {label}
      {isActive ? (
        sortOrder === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
      )}
    </button>
  );
}
