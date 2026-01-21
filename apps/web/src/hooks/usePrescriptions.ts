import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionsApi, patientsApi, medicationsApi } from '../api/prescriptions';
import type { 
  PrescriptionFilters, 
  PrescriptionCreateDTO, 
  PrescriptionUpdateDTO,
  PaginationParams,
  PaginatedResponse,
  Prescription 
} from '../types';

// ========== Clés de cache ==========
export const queryKeys = {
  prescriptions: ['prescriptions'] as const,
  prescription: (id: number) => ['prescriptions', id] as const,
  patients: ['patients'] as const,
  medications: ['medications'] as const,
};

// ========== Hooks pour les prescriptions ==========

export function usePrescriptions(filters?: PrescriptionFilters, pagination?: PaginationParams) {
  return useQuery<PaginatedResponse<Prescription>>({
    queryKey: [...queryKeys.prescriptions, filters, pagination],
    queryFn: () => prescriptionsApi.getAll(filters, pagination),
    staleTime: 30000, // 30 secondes
  });
}

export function usePrescription(id: number) {
  return useQuery({
    queryKey: queryKeys.prescription(id),
    queryFn: () => prescriptionsApi.getById(id),
    enabled: id > 0,
  });
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PrescriptionCreateDTO) => prescriptionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions });
    },
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PrescriptionUpdateDTO }) =>
      prescriptionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions });
    },
  });
}

export function useDeletePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => prescriptionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions });
    },
  });
}

// ========== Hooks pour les données de référence ==========

export function usePatients() {
  return useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => patientsApi.getAll(),
    staleTime: 60000, // 1 minute (données rarement modifiées)
  });
}

export function useMedications() {
  return useQuery({
    queryKey: queryKeys.medications,
    queryFn: () => medicationsApi.getAll(),
    staleTime: 60000,
  });
}
