/**
 * @cohort360/types
 * Types partagés pour l'écosystème Cohort360 - Gestion des prescriptions médicales.
 */

// ========== Entités de base ==========

/**
 * Représente un patient dans le système de santé.
 */
export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  birth_date: string | null;
}

/**
 * Représente un médicament du référentiel.
 */
export interface Medication {
  id: number;
  code: string;
  label: string;
  status: MedicationStatus;
}

export type MedicationStatus = 'actif' | 'suppr';

/**
 * Statut d'une prescription médicale.
 * - valide: Prescription active et valide
 * - en_attente: En attente de validation
 * - suppr: Supprimée/Annulée
 */
export type PrescriptionStatus = 'valide' | 'en_attente' | 'suppr';

/**
 * Représente une prescription médicale complète.
 */
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

/**
 * DTO pour la création d'une prescription.
 */
export interface PrescriptionCreateDTO {
  patient: number;
  medication: number;
  date_debut: string;
  date_fin: string;
  status: PrescriptionStatus;
  comment?: string | null;
}

/**
 * DTO pour la mise à jour d'une prescription.
 */
export interface PrescriptionUpdateDTO extends Partial<PrescriptionCreateDTO> {}

// ========== Filtres ==========

/**
 * Filtres disponibles pour la recherche de prescriptions.
 */
export interface PrescriptionFilters {
  patient?: number;
  medication?: number;
  status?: PrescriptionStatus;
  date_debut_from?: string;
  date_debut_to?: string;
  date_fin_from?: string;
  date_fin_to?: string;
}

// ========== Réponses API ==========

/**
 * Réponse paginée de l'API.
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Réponse d'erreur de l'API.
 */
export interface APIError {
  detail?: string;
  [field: string]: string | string[] | undefined;
}
