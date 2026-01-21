import { useTranslation } from 'react-i18next';
import { Calendar, User, Pill, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Prescription } from '@/types';

interface PrescriptionTableProps {
  prescriptions: Prescription[];
  isLoading: boolean;
}

const statusColors: Record<string, string> = {
  valide: 'bg-emerald-500 hover:bg-emerald-600',
  en_attente: 'bg-amber-500 hover:bg-amber-600',
  suppr: 'bg-red-500 hover:bg-red-600',
};

export function PrescriptionTable({ prescriptions, isLoading }: PrescriptionTableProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">{t('prescription.noResults')}</p>
        <p className="text-sm">{t('prescription.tryAdjustFilters')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('table.patient')}
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                {t('table.medication')}
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('table.dates')}
              </div>
            </TableHead>
            <TableHead className="font-semibold">{t('table.status')}</TableHead>
            <TableHead className="font-semibold">{t('table.comment')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((prescription) => (
            <TableRow key={prescription.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">
                {prescription.patient.first_name} {prescription.patient.last_name}
                {prescription.patient.birth_date && (
                  <div className="text-xs text-muted-foreground">
                    {t('table.bornOn', { date: formatDate(prescription.patient.birth_date) })}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <span className="text-[#0063AF] font-medium">
                  {prescription.medication.label}
                </span>
                <div className="text-xs text-muted-foreground">
                  {prescription.medication.code}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{formatDate(prescription.start_date)}</div>
                  {prescription.end_date && (
                    <div className="text-muted-foreground">
                      → {formatDate(prescription.end_date)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  className={`${statusColors[prescription.status] || 'bg-gray-500'} text-white`}
                >
                  {t(`status.${prescription.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {prescription.comment || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
