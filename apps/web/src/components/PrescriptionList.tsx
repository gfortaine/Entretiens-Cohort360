import { useMemo } from 'react';
import type { Prescription, PrescriptionStatus } from '../types';
import { useDeletePrescription, useUpdatePrescription } from '../hooks/usePrescriptions';

interface PrescriptionListProps {
  prescriptions: Prescription[];
  isLoading: boolean;
}

const statusLabels: Record<PrescriptionStatus, string> = {
  valide: 'Valide',
  en_attente: 'En attente',
  suppr: 'Supprimée',
};

const statusColors: Record<PrescriptionStatus, string> = {
  valide: '#22c55e',
  en_attente: '#f59e0b',
  suppr: '#ef4444',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export function PrescriptionList({ prescriptions, isLoading }: PrescriptionListProps) {
  const deleteMutation = useDeletePrescription();
  const updateMutation = useUpdatePrescription();

  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => 
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );
  }, [prescriptions]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette prescription ?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: PrescriptionStatus) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: newStatus } });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading" role="status" aria-label="Chargement">
        <div className="spinner"></div>
        <p>Chargement des prescriptions...</p>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucune prescription trouvée.</p>
      </div>
    );
  }

  return (
    <div className="prescription-list">
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Médicament</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Statut</th>
            <th>Commentaire</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedPrescriptions.map((prescription) => (
            <tr key={prescription.id} data-testid={`prescription-row-${prescription.id}`}>
              <td>
                <strong>{prescription.patient.last_name}</strong> {prescription.patient.first_name}
                {prescription.patient.birth_date && (
                  <br />
                )}
                {prescription.patient.birth_date && (
                  <small className="text-muted">
                    Né(e) le {formatDate(prescription.patient.birth_date)}
                  </small>
                )}
              </td>
              <td>
                <strong>{prescription.medication.label}</strong>
                <br />
                <small className="text-muted">{prescription.medication.code}</small>
              </td>
              <td>{formatDate(prescription.start_date)}</td>
              <td>{formatDate(prescription.end_date)}</td>
              <td>
                <select
                  value={prescription.status}
                  onChange={(e) => handleStatusChange(prescription.id, e.target.value as PrescriptionStatus)}
                  style={{
                    backgroundColor: statusColors[prescription.status],
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                  disabled={updateMutation.isPending}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="comment-cell">
                {prescription.comment || <span className="text-muted">—</span>}
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(prescription.id)}
                  disabled={deleteMutation.isPending}
                  aria-label={`Supprimer la prescription ${prescription.id}`}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="prescription-count">
        {prescriptions.length} prescription{prescriptions.length > 1 ? 's' : ''} affichée{prescriptions.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}
