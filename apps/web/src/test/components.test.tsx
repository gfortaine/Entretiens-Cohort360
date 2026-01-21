import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrescriptionTable } from '../components/PrescriptionTable';
import { PrescriptionFiltersForm } from '../components/PrescriptionFiltersForm';
import { StatusBadge } from '../components/DataTable';
import type { Prescription } from '../types';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'common.loading': 'Chargement...',
        'prescription.noResults': 'Aucune prescription trouvée',
        'table.patient': 'Patient',
        'table.medication': 'Médicament',
        'table.dates': 'Dates',
        'table.status': 'Statut',
        'table.comment': 'Commentaire',
        'table.actions': 'Actions',
        'table.bornOn': `Né(e) le ${params?.date || ''}`,
        'status.valide': 'Valide',
        'status.en_attente': 'En attente',
        'status.suppr': 'Supprimée',
        'actions.edit': 'Modifier',
        'actions.delete': 'Supprimer',
        'filters.patient': 'Patient',
        'filters.allPatients': 'Tous les patients',
        'filters.medication': 'Médicament',
        'filters.allMedications': 'Tous les médicaments',
        'filters.status': 'Statut',
        'filters.allStatuses': 'Tous les statuts',
        'filters.startDateFrom': 'Début - du',
        'filters.startDateTo': 'Début - au',
        'filters.endDateFrom': 'Fin - du',
        'filters.endDateTo': 'Fin - au',
        'filters.apply': 'Appliquer les filtres',
        'filters.reset': 'Réinitialiser',
        'pagination.showing': `Affichage de ${params?.from || 0} à ${params?.to || 0} sur ${params?.total || 0} résultats`,
        'pagination.previous': 'Précédent',
        'pagination.next': 'Suivant',
        'pagination.pageOf': `Page ${params?.page || 1} sur ${params?.total || 1}`,
      };
      return translations[key] || key;
    },
    i18n: { language: 'fr' },
  }),
}));

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
  {
    id: 3,
    patient: { ...mockPatient, id: 3, last_name: 'Bernard', first_name: 'Sophie' },
    medication: { ...mockMedication, id: 3, code: 'IBUPRO400', label: 'Ibuprofène 400mg' },
    start_date: '2025-03-01',
    end_date: '2025-03-15',
    status: 'suppr',
    comment: 'Annulé par le médecin',
  },
];

// Mock hooks
vi.mock('../hooks/usePrescriptions', () => ({
  usePatients: () => ({
    data: [
      { id: 1, first_name: 'Marie', last_name: 'Dupont' },
      { id: 2, first_name: 'Pierre', last_name: 'Martin' },
    ],
    isLoading: false,
  }),
  useMedications: () => ({
    data: [
      { id: 1, code: 'DOLIPRANE500', label: 'Doliprane 500mg' },
      { id: 2, code: 'AMOX500', label: 'Amoxicilline 500mg' },
    ],
    isLoading: false,
  }),
}));

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

// ========== Tests StatusBadge ==========
describe('StatusBadge', () => {
  it('affiche le badge Valide avec la bonne couleur', () => {
    render(<StatusBadge status="valide" />, { wrapper: createWrapper() });
    const badge = screen.getByText('Valide');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-emerald-500');
  });

  it('affiche le badge En attente avec la bonne couleur', () => {
    render(<StatusBadge status="en_attente" />, { wrapper: createWrapper() });
    const badge = screen.getByText('En attente');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-amber-500');
  });

  it('affiche le badge Supprimée avec la bonne couleur', () => {
    render(<StatusBadge status="suppr" />, { wrapper: createWrapper() });
    const badge = screen.getByText('Supprimée');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-500');
  });
});

// ========== Tests PrescriptionTable ==========
describe('PrescriptionTable', () => {
  describe('Affichage de base', () => {
    it('affiche un état de chargement', () => {
      render(
        <PrescriptionTable prescriptions={[]} isLoading={true} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText(/chargement/i)).toBeInTheDocument();
    });

    it('affiche un message si aucune prescription', () => {
      render(
        <PrescriptionTable prescriptions={[]} isLoading={false} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText(/aucune prescription/i)).toBeInTheDocument();
    });

    it('affiche les en-têtes de colonnes', () => {
      render(
        <PrescriptionTable prescriptions={mockPrescriptions} isLoading={false} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Patient')).toBeInTheDocument();
      expect(screen.getByText('Médicament')).toBeInTheDocument();
      expect(screen.getByText('Dates')).toBeInTheDocument();
      expect(screen.getByText('Statut')).toBeInTheDocument();
      expect(screen.getByText('Commentaire')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('affiche les données des prescriptions', () => {
      render(
        <PrescriptionTable prescriptions={mockPrescriptions} isLoading={false} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText(/Marie Dupont/)).toBeInTheDocument();
      expect(screen.getByText(/Doliprane 500mg/)).toBeInTheDocument();
      expect(screen.getByText(/Pierre Martin/)).toBeInTheDocument();
      expect(screen.getByText(/Amoxicilline 500mg/)).toBeInTheDocument();
    });

    it('affiche les statuts avec les badges colorés', () => {
      render(
        <PrescriptionTable prescriptions={mockPrescriptions} isLoading={false} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Valide')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
      expect(screen.getByText('Supprimée')).toBeInTheDocument();
    });

    it('affiche les commentaires ou un tiret si vide', () => {
      render(
        <PrescriptionTable prescriptions={mockPrescriptions} isLoading={false} />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Traitement initial')).toBeInTheDocument();
      expect(screen.getByText('Annulé par le médecin')).toBeInTheDocument();
      // Les prescriptions sans commentaire affichent "—"
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('affiche le total avec pagination même sur une seule page', () => {
      render(
        <PrescriptionTable 
          prescriptions={mockPrescriptions} 
          isLoading={false}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 3,
            onPageChange: vi.fn(),
          }}
        />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText(/Affichage de 1 à 3 sur 3/)).toBeInTheDocument();
    });

    it('affiche le total correct quand des filtres réduisent les résultats', () => {
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
      
      expect(screen.getByText(/Affichage de 0 à 0 sur 0/)).toBeInTheDocument();
    });

    it('affiche les boutons de navigation quand plusieurs pages', () => {
      render(
        <PrescriptionTable 
          prescriptions={mockPrescriptions} 
          isLoading={false}
          pagination={{
            page: 1,
            pageSize: 2,
            total: 5,
            onPageChange: vi.fn(),
          }}
        />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Précédent')).toBeInTheDocument();
      expect(screen.getByText('Suivant')).toBeInTheDocument();
    });

    it('appelle onPageChange quand on clique sur Suivant', () => {
      const onPageChange = vi.fn();
      render(
        <PrescriptionTable 
          prescriptions={mockPrescriptions} 
          isLoading={false}
          pagination={{
            page: 1,
            pageSize: 2,
            total: 5,
            onPageChange,
          }}
        />,
        { wrapper: createWrapper() }
      );
      
      fireEvent.click(screen.getByText('Suivant'));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('désactive Précédent sur la première page', () => {
      render(
        <PrescriptionTable 
          prescriptions={mockPrescriptions} 
          isLoading={false}
          pagination={{
            page: 1,
            pageSize: 2,
            total: 5,
            onPageChange: vi.fn(),
          }}
        />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Précédent')).toBeDisabled();
    });

    it('désactive Suivant sur la dernière page', () => {
      render(
        <PrescriptionTable 
          prescriptions={mockPrescriptions} 
          isLoading={false}
          pagination={{
            page: 3,
            pageSize: 2,
            total: 5,
            onPageChange: vi.fn(),
          }}
        />,
        { wrapper: createWrapper() }
      );
      
      expect(screen.getByText('Suivant')).toBeDisabled();
    });
  });

  describe('Actions (Edit/Delete)', () => {
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
      
      const editButtons = screen.getAllByTitle('Modifier');
      const deleteButtons = screen.getAllByTitle('Supprimer');
      expect(editButtons.length).toBe(mockPrescriptions.length);
      expect(deleteButtons.length).toBe(mockPrescriptions.length);
    });

    it('appelle onEdit avec la prescription quand on clique sur Modifier', () => {
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

    it('appelle onDelete avec la prescription quand on clique sur Supprimer', () => {
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

    it('désactive le bouton Supprimer pour les prescriptions déjà supprimées', () => {
      const supprimee = mockPrescriptions.find(p => p.status === 'suppr')!;
      render(
        <PrescriptionTable 
          prescriptions={[supprimee]} 
          isLoading={false}
          onDelete={vi.fn()}
        />,
        { wrapper: createWrapper() }
      );
      
      const deleteButton = screen.getByTitle('Supprimer');
      expect(deleteButton).toBeDisabled();
    });

    it('ne désactive pas les boutons Modifier pendant la suppression', () => {
      render(
        <PrescriptionTable 
          prescriptions={mockPrescriptions} 
          isLoading={false}
          onEdit={vi.fn()}
          isDeleting={true}
        />,
        { wrapper: createWrapper() }
      );
      
      const editButtons = screen.getAllByTitle('Modifier');
      editButtons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Interaction avec les lignes', () => {
    it('appelle onRowClick quand on clique sur une ligne', () => {
      const onRowClick = vi.fn();
      
      render(
        <PrescriptionTable 
          prescriptions={mockPrescriptions} 
          isLoading={false}
          onRowClick={onRowClick}
        />,
        { wrapper: createWrapper() }
      );
      
      // Click on a cell in the first row (not on a button)
      const patientCell = screen.getByText(/Marie Dupont/);
      fireEvent.click(patientCell);
      
      expect(onRowClick).toHaveBeenCalledWith(mockPrescriptions[0]);
    });
  });
});

// ========== Tests PrescriptionFiltersForm ==========
describe('PrescriptionFiltersForm', () => {
  it('affiche les champs de filtrage', () => {
    const onFiltersChange = vi.fn();
    
    render(
      <PrescriptionFiltersForm filters={{}} onFiltersChange={onFiltersChange} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText('Patient')).toBeInTheDocument();
    expect(screen.getByText('Médicament')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
  });

  it('affiche les champs de date', () => {
    const onFiltersChange = vi.fn();
    
    render(
      <PrescriptionFiltersForm filters={{}} onFiltersChange={onFiltersChange} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText('Début - du')).toBeInTheDocument();
    expect(screen.getByText('Début - au')).toBeInTheDocument();
    expect(screen.getByText('Fin - du')).toBeInTheDocument();
    expect(screen.getByText('Fin - au')).toBeInTheDocument();
  });

  it('affiche le bouton Effacer quand des filtres sont actifs', () => {
    const onFiltersChange = vi.fn();
    
    render(
      <PrescriptionFiltersForm 
        filters={{ patient: 1 }} 
        onFiltersChange={onFiltersChange} 
      />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.getByText('filters.clear')).toBeInTheDocument();
  });

  it('masque le bouton Effacer quand aucun filtre actif', () => {
    const onFiltersChange = vi.fn();
    
    render(
      <PrescriptionFiltersForm filters={{}} onFiltersChange={onFiltersChange} />,
      { wrapper: createWrapper() }
    );
    
    expect(screen.queryByText('filters.clear')).not.toBeInTheDocument();
  });

  it('appelle onFiltersChange avec un objet vide quand on efface', () => {
    const onFiltersChange = vi.fn();
    
    render(
      <PrescriptionFiltersForm 
        filters={{ patient: 1, status: 'valide' }} 
        onFiltersChange={onFiltersChange} 
      />,
      { wrapper: createWrapper() }
    );
    
    fireEvent.click(screen.getByText('filters.clear'));
    
    expect(onFiltersChange).toHaveBeenCalledWith({});
  });
});
