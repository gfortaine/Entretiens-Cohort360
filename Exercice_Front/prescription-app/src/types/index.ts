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
  date_debut: string;
  date_fin: string;
  status: PrescriptionStatus;
  comment?: string | null;
}

export interface PrescriptionUpdateDTO extends Partial<PrescriptionCreateDTO> {}

// ========== Filtres ==========

export interface PrescriptionFilters {
  patient?: number;
  medication?: number;
  status?: PrescriptionStatus;
  date_debut_from?: string;
  date_debut_to?: string;
  date_fin_from?: string;
  date_fin_to?: string;
}
