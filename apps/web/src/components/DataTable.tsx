/**
 * DataTable Component
 *
 * A reusable table component built with TanStack Table.
 * Pre-configured with sorting, pagination, and styling.
 *
 * Usage:
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'status', header: 'Status' },
 * ];
 *
 * <DataTable
 *   data={prescriptions}
 *   columns={columns}
 *   isLoading={isLoading}
 *   pagination={{ page, pageSize, total, onPageChange }}
 * />
 * ```
 */

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  isLoading?: boolean;
  pagination?: PaginationProps;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold cursor-pointer hover:bg-muted/70 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === 'asc' && (
                        <ChevronUp className="h-4 w-4" />
                      )}
                      {header.column.getIsSorted() === 'desc' && (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('common.loading')}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t('prescription.noResults')}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    onRowClick
                      ? 'hover:bg-muted/30 cursor-pointer transition-colors'
                      : 'hover:bg-muted/30 transition-colors'
                  }
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-card border rounded-lg">
          <div className="text-sm text-muted-foreground">
            {t('pagination.showing', {
              from: pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1,
              to: Math.min(pagination.page * pagination.pageSize, pagination.total),
              total: pagination.total,
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                {t('pagination.previous')}
              </Button>
              <span className="flex items-center px-3 text-sm text-muted-foreground">
                {t('pagination.pageOf', { page: pagination.page, total: totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                {t('pagination.next')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * StatusBadge - Display-only status badge
 */
const statusColors: Record<string, string> = {
  valide: 'bg-emerald-500 hover:bg-emerald-600',
  en_attente: 'bg-amber-500 hover:bg-amber-600',
  suppr: 'bg-red-500 hover:bg-red-600',
};

const statusSelectColors: Record<string, string> = {
  valide: '#22c55e',
  en_attente: '#f59e0b',
  suppr: '#ef4444',
};

export function StatusBadge({
  status,
}: {
  status: 'valide' | 'en_attente' | 'suppr';
}) {
  const { t } = useTranslation();
  
  return (
    <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
      {t(`status.${status}`)}
    </Badge>
  );
}

/**
 * StatusSelect - Editable status selector for prescriptions
 */
export function StatusSelect({
  status,
  onStatusChange,
  disabled = false,
}: {
  status: 'valide' | 'en_attente' | 'suppr';
  onStatusChange: (newStatus: 'valide' | 'en_attente' | 'suppr') => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation(); // Prevent row click
    onStatusChange(e.target.value as 'valide' | 'en_attente' | 'suppr');
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking select
  };
  
  return (
    <select
      value={status}
      onChange={handleChange}
      onClick={handleClick}
      disabled={disabled}
      className="rounded px-2 py-1 text-white text-sm font-medium cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-offset-1"
      style={{ backgroundColor: statusSelectColors[status] }}
      aria-label={t('table.status')}
    >
      <option value="valide">{t('status.valide')}</option>
      <option value="en_attente">{t('status.en_attente')}</option>
      <option value="suppr">{t('status.suppr')}</option>
    </select>
  );
}
