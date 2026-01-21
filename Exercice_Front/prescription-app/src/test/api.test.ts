import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prescriptionsApi, patientsApi, medicationsApi } from '../api/prescriptions';
import { apiClient } from '../api/client';

// Mock axios
vi.mock('../api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockPrescriptions = [
  {
    id: 1,
    patient: { id: 1, last_name: 'Dupont', first_name: 'Marie', birth_date: '1985-06-15' },
    medication: { id: 1, code: 'DOL500', label: 'Doliprane 500mg', status: 'actif' },
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    status: 'valide',
    comment: 'Test',
  },
];

describe('API Prescriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('récupère toutes les prescriptions', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockPrescriptions });
      
      const result = await prescriptionsApi.getAll();
      
      expect(apiClient.get).toHaveBeenCalledWith('/Prescription', { params: expect.any(URLSearchParams) });
      expect(result).toEqual(mockPrescriptions);
    });

    it('applique les filtres correctement', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockPrescriptions });
      
      await prescriptionsApi.getAll({ patient: 1, status: 'valide' });
      
      expect(apiClient.get).toHaveBeenCalled();
      const callParams = (apiClient.get as ReturnType<typeof vi.fn>).mock.calls[0][1].params;
      expect(callParams.get('patient')).toBe('1');
      expect(callParams.get('status')).toBe('valide');
    });

    it('ignore les filtres vides', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockPrescriptions });
      
      await prescriptionsApi.getAll({ patient: undefined, status: '' as any });
      
      expect(apiClient.get).toHaveBeenCalled();
      const callParams = (apiClient.get as ReturnType<typeof vi.fn>).mock.calls[0][1].params;
      expect(callParams.has('patient')).toBe(false);
      expect(callParams.has('status')).toBe(false);
    });
  });

  describe('getById', () => {
    it('récupère une prescription par ID', async () => {
      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockPrescriptions[0] });
      
      const result = await prescriptionsApi.getById(1);
      
      expect(apiClient.get).toHaveBeenCalledWith('/Prescription/1');
      expect(result).toEqual(mockPrescriptions[0]);
    });
  });

  describe('create', () => {
    it('crée une nouvelle prescription', async () => {
      const newPrescription = {
        patient: 1,
        medication: 1,
        date_debut: '2025-03-01',
        date_fin: '2025-04-01',
        status: 'valide' as const,
        comment: 'Nouveau',
      };
      
      const createdPrescription = { ...mockPrescriptions[0], id: 2 };
      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: createdPrescription });
      
      const result = await prescriptionsApi.create(newPrescription);
      
      expect(apiClient.post).toHaveBeenCalledWith('/Prescription', newPrescription);
      expect(result).toHaveProperty('id');
    });
  });

  describe('update', () => {
    it('met à jour une prescription existante', async () => {
      const updateData = { status: 'suppr' as const };
      
      (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue({ 
        data: { ...mockPrescriptions[0], status: 'suppr' } 
      });
      
      const result = await prescriptionsApi.update(1, updateData);
      
      expect(apiClient.patch).toHaveBeenCalledWith('/Prescription/1', updateData);
      expect(result.status).toBe('suppr');
    });
  });

  describe('delete', () => {
    it('supprime une prescription', async () => {
      (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
      
      await prescriptionsApi.delete(1);
      
      expect(apiClient.delete).toHaveBeenCalledWith('/Prescription/1');
    });
  });
});

describe('API Patients', () => {
  it('récupère tous les patients', async () => {
    const mockPatients = [{ id: 1, last_name: 'Dupont', first_name: 'Marie', birth_date: '1985-06-15' }];
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockPatients });
    
    const result = await patientsApi.getAll();
    
    expect(apiClient.get).toHaveBeenCalledWith('/Patient');
    expect(result).toEqual(mockPatients);
  });
});

describe('API Medications', () => {
  it('récupère tous les médicaments', async () => {
    const mockMedications = [{ id: 1, code: 'DOL500', label: 'Doliprane 500mg', status: 'actif' }];
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockMedications });
    
    const result = await medicationsApi.getAll();
    
    expect(apiClient.get).toHaveBeenCalledWith('/Medication');
    expect(result).toEqual(mockMedications);
  });
});
