/**
 * PrescriptionTable Component
 *
 * Displays prescriptions using TanStack Table via the DataTable component.
 * Supports sorting, pagination, and row actions.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User, Pill } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, StatusBadge } from '@/components/DataTable';
import type { Prescription } from '@/types';

interface PrescriptionTableProps {
  prescriptions: Prescription[];
  isLoading: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (prescription: Prescription) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function PrescriptionTable({
  prescriptions,
  isLoading,
  pagination,
  onRowClick,
}: PrescriptionTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<Prescription>[]>(
    () => [
      {
        id: 'patient',
        accessorFn: (row) => `${row.patient.last_name} ${row.patient.first_name}`,
        header: () => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {t('table.patient')}
          </div>
        ),
        cell: ({ row }) => {
          const patient = row.original.patient;
          return (
            <div>
              <span className="font-medium">
                {patient.first_name} {patient.last_name}
              </span>
              {patient.birth_date && (
                <div className="text-xs text-muted-foreground">
                  {t('table.bornOn', { date: formatDate(patient.birth_date) })}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: 'medication',
        accessorFn: (row) => row.medication.label,
        header: () => (
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            {t('table.medication')}
          </div>
        ),
        cell: ({ row }) => {
          const medication = row.original.medication;
          return (
            <div>
              <span className="text-[#0063AF] font-medium">
                {medication.label}
              </span>
              <div className="text-xs text-muted-foreground">
                {medication.code}
              </div>
            </div>
          );
        },
      },
      {
        id: 'dates',
        accessorKey: 'start_date',
        header: () => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('table.dates')}
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{formatDate(row.original.start_date)}</div>
            {row.original.end_date && (
              <div className="text-muted-foreground">
                → {formatDate(row.original.end_date)}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('table.status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'comment',
        header: t('table.comment'),
        cell: ({ row }) => (
          <span className="max-w-[200px] truncate block">
            {row.original.comment || '—'}
          </span>
        ),
      },
    ],
    [t]
  );

  return (
    <DataTable
      data={prescriptions}
      columns={columns}
      isLoading={isLoading}
      pagination={pagination}
      onRowClick={onRowClick}
    />
  );
}
