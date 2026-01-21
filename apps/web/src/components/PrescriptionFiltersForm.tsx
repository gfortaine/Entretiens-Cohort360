import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatients, useMedications } from '@/hooks/usePrescriptions';
import type { PrescriptionFilters, PrescriptionStatus } from '@/types';

interface PrescriptionFiltersFormProps {
  filters: PrescriptionFilters;
  onFiltersChange: (filters: PrescriptionFilters) => void;
}

const STATUSES: PrescriptionStatus[] = ['valide', 'en_attente', 'suppr'];

export function PrescriptionFiltersForm({
  filters,
  onFiltersChange,
}: PrescriptionFiltersFormProps) {
  const { t } = useTranslation();
  const { data: patients = [] } = usePatients();
  const { data: medications = [] } = useMedications();

  const updateFilter = <K extends keyof PrescriptionFilters>(
    key: K,
    value: PrescriptionFilters[K]
  ) => {
    const newFilters = { ...filters };
    if (value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Patient Filter */}
        <div className="space-y-2">
          <Label htmlFor="patient">{t('filters.patient')}</Label>
          <Select
            value={filters.patient?.toString() ?? 'all'}
            onValueChange={(value) => updateFilter('patient', value === 'all' ? undefined : Number(value))}
          >
            <SelectTrigger id="patient">
              <SelectValue placeholder={t('filters.allPatients')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allPatients')}</SelectItem>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id.toString()}>
                  {patient.first_name} {patient.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Medication Filter */}
        <div className="space-y-2">
          <Label htmlFor="medication">{t('filters.medication')}</Label>
          <Select
            value={filters.medication?.toString() ?? 'all'}
            onValueChange={(value) => updateFilter('medication', value === 'all' ? undefined : Number(value))}
          >
            <SelectTrigger id="medication">
              <SelectValue placeholder={t('filters.allMedications')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allMedications')}</SelectItem>
              {medications.map((med) => (
                <SelectItem key={med.id} value={med.id.toString()}>
                  {med.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">{t('filters.status')}</Label>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value as PrescriptionStatus)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder={t('filters.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            {t('filters.clear')}
          </Button>
        </div>
      )}
    </div>
  );
}
