import { apiClient } from './client';
import type { 
  Prescription, 
  PrescriptionCreateDTO, 
  PrescriptionUpdateDTO,
  PrescriptionFilters,
  PaginatedResponse,
  PaginationParams,
  Patient,
  Medication 
} from '../types';

/**
 * API pour les prescriptions avec pagination.
 */
export const prescriptionsApi = {
  /**
   * Récupère la liste paginée des prescriptions avec filtres optionnels.
   */
  async getAll(
    filters?: PrescriptionFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Prescription>> {
    const params = new URLSearchParams();
    
    // Pagination params
    if (pagination?.page) {
      params.append('page', String(pagination.page));
    }
    if (pagination?.page_size) {
      params.append('page_size', String(pagination.page_size));
    }
    
    // Filter params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await apiClient.get<PaginatedResponse<Prescription>>('/Prescription', { params });
    return response.data;
  },

  /**
   * Récupère une prescription par son ID.
   */
  async getById(id: number): Promise<Prescription> {
    const response = await apiClient.get<Prescription>(`/Prescription/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle prescription.
   */
  async create(data: PrescriptionCreateDTO): Promise<Prescription> {
    const response = await apiClient.post<Prescription>('/Prescription', data);
    return response.data;
  },

  /**
   * Met à jour une prescription existante.
   */
  async update(id: number, data: PrescriptionUpdateDTO): Promise<Prescription> {
    const response = await apiClient.patch<Prescription>(`/Prescription/${id}`, data);
    return response.data;
  },

  /**
   * Supprime une prescription.
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/Prescription/${id}`);
  },
};

/**
 * API pour les patients.
 * Note: L'API retourne une réponse paginée, on extrait les résultats.
 */
export const patientsApi = {
  async getAll(): Promise<Patient[]> {
    const response = await apiClient.get<PaginatedResponse<Patient> | Patient[]>('/Patient');
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results;
  },
};

/**
 * API pour les médicaments.
 * Note: L'API retourne une réponse paginée, on extrait les résultats.
 */
export const medicationsApi = {
  async getAll(): Promise<Medication[]> {
    const response = await apiClient.get<PaginatedResponse<Medication> | Medication[]>('/Medication');
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results;
  },
};

/**
 * Helper function to create a prescription (convenience export).
 */
export const createPrescription = prescriptionsApi.create;
