/**
 * Types partagés pour l'application de gestion des prescriptions.
 */

// ========== Entités de base ==========

export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  birth_date: string | null;
}

export interface Medication {
  id: number;
  code: string;
  label: string;
  status: 'actif' | 'suppr';
}

export type PrescriptionStatus = 'valide' | 'en_attente' | 'suppr';

export interface Prescription {
  id: number;
  patient: Patient;
  medication: Medication;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment: string | null;
}

// ========== DTOs pour les formulaires ==========

export interface PrescriptionCreateDTO {
  patient: number;
  medication: number;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment?: string | null;
}

export interface PrescriptionUpdateDTO extends Partial<PrescriptionCreateDTO> {}

// ========== Filtres ==========

export interface PrescriptionFilters {
  patient?: number;
  medication?: number;
  status?: PrescriptionStatus;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
}

// ========== Pagination (OpenAI-style, 20 per page) ==========

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export const DEFAULT_PAGE_SIZE = 20;
