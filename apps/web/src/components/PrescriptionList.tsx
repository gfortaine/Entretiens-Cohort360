import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Prescription, PrescriptionStatus } from '../types';
import { useDeletePrescription, useUpdatePrescription } from '../hooks/usePrescriptions';

interface PrescriptionListProps {
  prescriptions: Prescription[];
  isLoading: boolean;
}

const statusColors: Record<PrescriptionStatus, string> = {
  valide: '#22c55e',
  en_attente: '#f59e0b',
  suppr: '#ef4444',
};

export function PrescriptionList({ prescriptions, isLoading }: PrescriptionListProps) {
  const { t, i18n } = useTranslation();
  const deleteMutation = useDeletePrescription();
  const updateMutation = useUpdatePrescription();

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US');
  };

  const statusLabels: Record<PrescriptionStatus, string> = {
    valide: t('status.valide'),
    en_attente: t('status.en_attente'),
    suppr: t('status.suppr'),
  };

  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => 
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );
  }, [prescriptions]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('table.confirmDelete'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: PrescriptionStatus) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status: newStatus } });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading" role="status" aria-label={t('common.loading')}>
        <div className="spinner"></div>
        <p>{t('table.loading')}</p>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="empty-state">
        <p>{t('prescription.empty')}</p>
      </div>
    );
  }

  return (
    <div className="prescription-list">
      <table>
        <thead>
          <tr>
            <th>{t('table.patient')}</th>
            <th>{t('table.medication')}</th>
            <th>{t('table.startDate')}</th>
            <th>{t('table.endDate')}</th>
            <th>{t('table.status')}</th>
            <th>{t('table.comment')}</th>
            <th>{t('table.actions')}</th>
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
                    {t('table.bornOn', { date: formatDate(prescription.patient.birth_date) })}
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
                  aria-label={t('table.deletePrescription', { id: prescription.id })}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="prescription-count">
        {t('table.displayedCount', { count: prescriptions.length })}
      </div>
    </div>
  );
}
