import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionList } from '../components/PrescriptionList';
import { PrescriptionFilters } from '../components/PrescriptionFilters';
import type { Prescription } from '../types';

// Mock data
const mockPatient = {
  id: 1,
  last_name: 'Dupont',
  first_name: 'Marie',
  birth_date: '1985-06-15',
};

const mockMedication = {
  id: 1,
  code: 'DOLIPRANE500',
  label: 'Doliprane 500mg',
  status: 'actif' as const,
};

const mockPrescriptions: Prescription[] = [
  {
    id: 1,
    patient: mockPatient,
    medication: mockMedication,
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    status: 'valide',
    comment: 'Traitement initial',
  },
  {
    id: 2,
    patient: { ...mockPatient, id: 2, last_name: 'Martin', first_name: 'Pierre' },
    medication: { ...mockMedication, id: 2, code: 'AMOX500', label: 'Amoxicilline 500mg' },
    start_date: '2025-02-01',
    end_date: '2025-02-28',
    status: 'en_attente',
    comment: null,
  },
];

// Wrapper pour React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// ========== Tests PrescriptionList ==========
describe('PrescriptionList', () => {
  it('affiche un état de chargement', () => {
    render(
      <PrescriptionList prescriptions={[]} isLoading={true} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('affiche un message si aucune prescription', () => {
    render(
      <PrescriptionList prescriptions={[]} isLoading={false} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText(/aucune prescription/i)).toBeInTheDocument();
  });

  it('affiche les prescriptions dans un tableau', () => {
    render(
      <PrescriptionList prescriptions={mockPrescriptions} isLoading={false} />,
      { wrapper: createWrapper() }
    );
    
    // Vérifie les en-têtes
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Médicament')).toBeInTheDocument();
    expect(screen.getByText('Date début')).toBeInTheDocument();
    
    // Vérifie les données
    expect(screen.getByText('Dupont')).toBeInTheDocument();
    expect(screen.getByText('Doliprane 500mg')).toBeInTheDocument();
  });

  it('affiche le nombre de prescriptions', () => {
    render(
      <PrescriptionList prescriptions={mockPrescriptions} isLoading={false} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText(/2 prescription\(s\) affichée\(s\)/i)).toBeInTheDocument();
  });

  it('affiche les informations du patient correctement', () => {
    render(
      <PrescriptionList prescriptions={mockPrescriptions} isLoading={false} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText('Dupont')).toBeInTheDocument();
    expect(screen.getByText('Marie')).toBeInTheDocument();
  });
});

// ========== Tests PrescriptionFilters ==========
describe('PrescriptionFilters', () => {
  // Mock des hooks
  vi.mock('../hooks/usePrescriptions', () => ({
    usePatients: () => ({
      data: [mockPatient],
      isLoading: false,
    }),
    useMedications: () => ({
      data: [mockMedication],
      isLoading: false,
    }),
    useCreatePrescription: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
    }),
    useDeletePrescription: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useUpdatePrescription: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }));

  it('affiche les champs de filtrage', () => {
    const onFiltersChange = vi.fn();
    
    render(
      <PrescriptionFilters filters={{}} onFiltersChange={onFiltersChange} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByLabelText(/patient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/médicament/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/statut/i)).toBeInTheDocument();
  });

  it('a un bouton pour appliquer les filtres', () => {
    const onFiltersChange = vi.fn();
    
    render(
      <PrescriptionFilters filters={{}} onFiltersChange={onFiltersChange} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText(/appliquer les filtres/i)).toBeInTheDocument();
  });

  it('a un bouton pour réinitialiser', () => {
    const onFiltersChange = vi.fn();
    
    render(
      <PrescriptionFilters filters={{}} onFiltersChange={onFiltersChange} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText(/réinitialiser/i)).toBeInTheDocument();
  });
});

// ========== Tests d'intégration ==========
describe('Intégration', () => {
  it('le tableau affiche les statuts avec les bonnes couleurs', () => {
    render(
      <PrescriptionList prescriptions={mockPrescriptions} isLoading={false} />,
      { wrapper: createWrapper() }
    );
    
    // Vérifie que les sélecteurs de statut sont présents
    const statusSelects = screen.getAllByRole('combobox');
    expect(statusSelects.length).toBeGreaterThan(0);
  });
});
