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
  const [dateDebutFrom, setDateDebutFrom] = useQueryState(
    'date_debut_from',
    parseAsString.withOptions({ shallow: false })
  );

  const [dateDebutTo, setDateDebutTo] = useQueryState(
    'date_debut_to',
    parseAsString.withOptions({ shallow: false })
  );

  const [dateFinFrom, setDateFinFrom] = useQueryState(
    'date_fin_from',
    parseAsString.withOptions({ shallow: false })
  );

  const [dateFinTo, setDateFinTo] = useQueryState(
    'date_fin_to',
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
    if (dateDebutFrom) f.date_debut_from = dateDebutFrom;
    if (dateDebutTo) f.date_debut_to = dateDebutTo;
    if (dateFinFrom) f.date_fin_from = dateFinFrom;
    if (dateFinTo) f.date_fin_to = dateFinTo;
    return f;
  }, [patient, medication, status, dateDebutFrom, dateDebutTo, dateFinFrom, dateFinTo]);

  // Update filters and reset page to 1
  const setFilters = useCallback(
    async (newFilters: PrescriptionFilters) => {
      // Update all filter params atomically
      await Promise.all([
        setPatient(newFilters.patient ?? null),
        setMedication(newFilters.medication ?? null),
        setStatus(newFilters.status ?? null),
        setDateDebutFrom(newFilters.date_debut_from ?? null),
        setDateDebutTo(newFilters.date_debut_to ?? null),
        setDateFinFrom(newFilters.date_fin_from ?? null),
        setDateFinTo(newFilters.date_fin_to ?? null),
        setPage(1), // Reset to page 1 when filters change
      ]);
    },
    [
      setPatient,
      setMedication,
      setStatus,
      setDateDebutFrom,
      setDateDebutTo,
      setDateFinFrom,
      setDateFinTo,
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
