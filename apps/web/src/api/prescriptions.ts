import { apiClient } from './client';
import type { 
  Prescription, 
  PrescriptionCreateDTO, 
  PrescriptionUpdateDTO,
  PrescriptionFilters,
  Patient,
  Medication 
} from '../types';

/**
 * API pour les prescriptions.
 */
export const prescriptionsApi = {
  /**
   * Récupère la liste des prescriptions avec filtres optionnels.
   */
  async getAll(filters?: PrescriptionFilters): Promise<Prescription[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await apiClient.get<Prescription[]>('/Prescription', { params });
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
 */
export const patientsApi = {
  async getAll(): Promise<Patient[]> {
    const response = await apiClient.get<Patient[]>('/Patient');
    return response.data;
  },
};

/**
 * API pour les médicaments.
 */
export const medicationsApi = {
  async getAll(): Promise<Medication[]> {
    const response = await apiClient.get<Medication[]>('/Medication');
    return response.data;
  },
};
