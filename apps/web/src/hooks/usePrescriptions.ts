import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionsApi, patientsApi, medicationsApi } from '../api/prescriptions';
import { toast } from '@/core/toast';
import { logger } from '@/core/logger';
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
    queryFn: async () => {
      const endTiming = logger.time('Fetch prescriptions', { filters, pagination });
      try {
        const result = await prescriptionsApi.getAll(filters, pagination);
        endTiming();
        return result;
      } catch (error) {
        logger.error('Failed to fetch prescriptions', error, { filters, pagination });
        throw error;
      }
    },
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
    onMutate: async () => {
      logger.info('Creating prescription', { component: 'usePrescriptions' });
    },
    onSuccess: (newPrescription) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions });
      toast.success('toast.prescriptionCreated', {
        description: `Prescription #${newPrescription.id}`,
      });
      logger.info('Prescription created', { prescriptionId: newPrescription.id });
    },
    onError: (error) => {
      toast.error('errors.saveFailed');
      logger.error('Failed to create prescription', error);
    },
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PrescriptionUpdateDTO }) =>
      prescriptionsApi.update(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      logger.info('Updating prescription', { prescriptionId: id, data });
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.prescriptions });
      
      // Snapshot previous value for rollback
      const previousData = queryClient.getQueriesData<PaginatedResponse<Prescription>>({ 
        queryKey: queryKeys.prescriptions 
      });
      
      // Optimistically update the cache
      queryClient.setQueriesData<PaginatedResponse<Prescription>>(
        { queryKey: queryKeys.prescriptions },
        (old): PaginatedResponse<Prescription> | undefined => {
          if (!old) return old;
          return {
            ...old,
            results: old.results.map((p): Prescription =>
              p.id === id ? { ...p, status: data.status ?? p.status } : p
            ),
          };
        }
      );
      
      return { previousData };
    },
    
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions });
      toast.success('toast.prescriptionUpdated');
      logger.info('Prescription updated', { prescriptionId: id });
    },
    
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('errors.saveFailed');
      logger.error('Failed to update prescription', error, { prescriptionId: id });
    },
  });
}

/**
 * Soft delete: marks prescription as 'suppr' status.
 * Per React spec: "Soft delete (change status to 'suppr')"
 * 
 * Uses optimistic updates for instant UI feedback
 */
export function useDeletePrescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => prescriptionsApi.delete(id),
    
    // Optimistic delete
    onMutate: async (id) => {
      logger.info('Deleting prescription (soft)', { prescriptionId: id });
      
      await queryClient.cancelQueries({ queryKey: queryKeys.prescriptions });
      
      const previousData = queryClient.getQueriesData({ queryKey: queryKeys.prescriptions });
      
      // Optimistically remove from cache
      queryClient.setQueriesData<PaginatedResponse<Prescription>>(
        { queryKey: queryKeys.prescriptions },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            count: old.count - 1,
            results: old.results.filter((p) => p.id !== id),
          };
        }
      );
      
      return { previousData };
    },
    
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions });
      toast.success('toast.prescriptionDeleted');
      logger.info('Prescription deleted', { prescriptionId: id });
    },
    
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('errors.deleteFailed');
      logger.error('Failed to delete prescription', error, { prescriptionId: id });
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
