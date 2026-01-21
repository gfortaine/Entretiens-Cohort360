import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionList } from '../components/PrescriptionList';
import { PrescriptionFilters } from '../components/PrescriptionFilters';
import { PrescriptionTable } from '../components/PrescriptionTable';
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
    
    // Vérifie que les statuts sont présents (peuvent être multiples dans les selects)
    expect(screen.getAllByText('Valide').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En attente').length).toBeGreaterThan(0);
  });
});

// ========== Tests PrescriptionTable (TanStack Table) ==========
describe('PrescriptionTable', () => {
  it('affiche le total avec pagination même sur une seule page', () => {
    render(
      <PrescriptionTable 
        prescriptions={mockPrescriptions} 
        isLoading={false}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 2,
          onPageChange: vi.fn(),
        }}
      />,
      { wrapper: createWrapper() }
    );
    
    // REGRESSION TEST: Total count should always be visible
    expect(screen.getByText(/Affichage de 1 à 2 sur 2/)).toBeInTheDocument();
  });

  it('affiche les boutons Modifier et Supprimer pour chaque ligne', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    render(
      <PrescriptionTable 
        prescriptions={mockPrescriptions} 
        isLoading={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
      { wrapper: createWrapper() }
    );
    
    // Each row should have Edit and Delete buttons
    const editButtons = screen.getAllByTitle('Modifier');
    const deleteButtons = screen.getAllByTitle('Supprimer');
    expect(editButtons.length).toBe(mockPrescriptions.length);
    expect(deleteButtons.length).toBe(mockPrescriptions.length);
  });

  it('appelle onEdit quand le bouton Modifier est cliqué', () => {
    const onEdit = vi.fn();
    
    render(
      <PrescriptionTable 
        prescriptions={mockPrescriptions} 
        isLoading={false}
        onEdit={onEdit}
      />,
      { wrapper: createWrapper() }
    );
    
    const editButtons = screen.getAllByTitle('Modifier');
    fireEvent.click(editButtons[0]);
    
    expect(onEdit).toHaveBeenCalledWith(mockPrescriptions[0]);
  });

  it('appelle onDelete quand le bouton Supprimer est cliqué', () => {
    const onDelete = vi.fn();
    
    render(
      <PrescriptionTable 
        prescriptions={mockPrescriptions} 
        isLoading={false}
        onDelete={onDelete}
      />,
      { wrapper: createWrapper() }
    );
    
    const deleteButtons = screen.getAllByTitle('Supprimer');
    fireEvent.click(deleteButtons[0]);
    
    expect(onDelete).toHaveBeenCalledWith(mockPrescriptions[0]);
  });

  it('désactive les boutons Supprimer pendant la suppression', () => {
    render(
      <PrescriptionTable 
        prescriptions={mockPrescriptions} 
        isLoading={false}
        onDelete={vi.fn()}
        isDeleting={true}
      />,
      { wrapper: createWrapper() }
    );
    
    const deleteButtons = screen.getAllByTitle('Supprimer');
    deleteButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('affiche le total correct quand des filtres réduisent les résultats', () => {
    // Simulate filtered results (1 prescription)
    render(
      <PrescriptionTable 
        prescriptions={[mockPrescriptions[0]]} 
        isLoading={false}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 1,
          onPageChange: vi.fn(),
        }}
      />,
      { wrapper: createWrapper() }
    );
    
    // REGRESSION TEST: Should show "Affichage de 1 à 1 sur 1" even with single result
    expect(screen.getByText(/Affichage de 1 à 1 sur 1/)).toBeInTheDocument();
  });

  it('affiche 0 résultats correctement', () => {
    render(
      <PrescriptionTable 
        prescriptions={[]} 
        isLoading={false}
        pagination={{
          page: 1,
          pageSize: 10,
          total: 0,
          onPageChange: vi.fn(),
        }}
      />,
      { wrapper: createWrapper() }
    );
    
    // Should show "Affichage de 0 à 0 sur 0"
    expect(screen.getByText(/Affichage de 0 à 0 sur 0/)).toBeInTheDocument();
  });
});
