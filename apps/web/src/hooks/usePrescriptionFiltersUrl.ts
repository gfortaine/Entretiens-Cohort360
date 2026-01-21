import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from 'nuqs';
import { useMemo, useCallback } from 'react';
import type { PrescriptionFilters, PrescriptionStatus } from '@/types';

const statusValues: PrescriptionStatus[] = ['valide', 'en_attente', 'suppr'];

/**
 * Custom hook to sync prescription filters with URL query params.
 * Uses nuqs for type-safe URL state management.
 */
export function usePrescriptionFiltersUrl() {
  // Patient ID
  const [patient, setPatient] = useQueryState(
    'patient',
    parseAsInteger.withOptions({ shallow: false })
  );

  // Medication ID
  const [medication, setMedication] = useQueryState(
    'medication',
    parseAsInteger.withOptions({ shallow: false })
  );

  // Status
  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringEnum(statusValues).withOptions({ shallow: false })
  );

  // Date filters (YYYY-MM-DD format)
  const [startDateFrom, setStartDateFrom] = useQueryState(
    'start_date_from',
    parseAsString.withOptions({ shallow: false })
  );

  const [startDateTo, setStartDateTo] = useQueryState(
    'start_date_to',
    parseAsString.withOptions({ shallow: false })
  );

  const [endDateFrom, setEndDateFrom] = useQueryState(
    'end_date_from',
    parseAsString.withOptions({ shallow: false })
  );

  const [endDateTo, setEndDateTo] = useQueryState(
    'end_date_to',
    parseAsString.withOptions({ shallow: false })
  );

  // Page number
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  // Build filters object from URL params
  const filters: PrescriptionFilters = useMemo(() => {
    const f: PrescriptionFilters = {};
    if (patient !== null) f.patient = patient;
    if (medication !== null) f.medication = medication;
    if (status !== null) f.status = status;
    if (startDateFrom) f.start_date_from = startDateFrom;
    if (startDateTo) f.start_date_to = startDateTo;
    if (endDateFrom) f.end_date_from = endDateFrom;
    if (endDateTo) f.end_date_to = endDateTo;
    return f;
  }, [patient, medication, status, startDateFrom, startDateTo, endDateFrom, endDateTo]);

  // Update filters and reset page to 1
  const setFilters = useCallback(
    async (newFilters: PrescriptionFilters) => {
      // Update all filter params atomically
      await Promise.all([
        setPatient(newFilters.patient ?? null),
        setMedication(newFilters.medication ?? null),
        setStatus(newFilters.status ?? null),
        setStartDateFrom(newFilters.start_date_from ?? null),
        setStartDateTo(newFilters.start_date_to ?? null),
        setEndDateFrom(newFilters.end_date_from ?? null),
        setEndDateTo(newFilters.end_date_to ?? null),
        setPage(1), // Reset to page 1 when filters change
      ]);
    },
    [
      setPatient,
      setMedication,
      setStatus,
      setStartDateFrom,
      setStartDateTo,
      setEndDateFrom,
      setEndDateTo,
      setPage,
    ]
  );

  return {
    filters,
    setFilters,
    page,
    setPage,
  };
}
