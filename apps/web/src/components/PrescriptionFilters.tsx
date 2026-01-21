import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { PrescriptionFilters as Filters, PrescriptionStatus } from '../types';
import { usePatients, useMedications } from '../hooks/usePrescriptions';

interface PrescriptionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function PrescriptionFilters({ filters, onFiltersChange }: PrescriptionFiltersProps) {
  const { t } = useTranslation();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const { data: medications = [], isLoading: medicationsLoading } = useMedications();
  
  const { register, handleSubmit, reset } = useForm<Filters>({
    defaultValues: filters,
  });

  const statusOptions: { value: PrescriptionStatus | ''; label: string }[] = [
    { value: '', label: t('status.all') },
    { value: 'valide', label: t('status.valide') },
    { value: 'en_attente', label: t('status.en_attente') },
    { value: 'suppr', label: t('status.suppr') },
  ];

  const onSubmit = (data: Filters) => {
    // Nettoyer les valeurs vides
    const cleanedFilters: Filters = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        (cleanedFilters as Record<string, unknown>)[key] = value;
      }
    });
    onFiltersChange(cleanedFilters);
  };

  const handleReset = () => {
    reset({});
    onFiltersChange({});
  };

  return (
    <form className="filters-form" onSubmit={handleSubmit(onSubmit)}>
      <h3>🔍 {t('filters.title')}</h3>
      
      <div className="filters-grid">
        {/* Filtre Patient */}
        <div className="form-group">
          <label htmlFor="patient">{t('filters.patient')}</label>
          <select 
            id="patient" 
            {...register('patient')}
            disabled={patientsLoading}
          >
            <option value="">{t('filters.allPatients')}</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.last_name} {p.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Médicament */}
        <div className="form-group">
          <label htmlFor="medication">{t('filters.medication')}</label>
          <select 
            id="medication" 
            {...register('medication')}
            disabled={medicationsLoading}
          >
            <option value="">{t('filters.allMedications')}</option>
            {medications.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.code})
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Statut */}
        <div className="form-group">
          <label htmlFor="status">{t('filters.status')}</label>
          <select id="status" {...register('status')}>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Date de début - From */}
        <div className="form-group">
          <label htmlFor="date_debut_from">{t('filters.startDate')} (≥)</label>
          <input 
            type="date" 
            id="date_debut_from" 
            {...register('date_debut_from')} 
          />
        </div>

        {/* Filtre Date de début - To */}
        <div className="form-group">
          <label htmlFor="date_debut_to">{t('filters.startDate')} (≤)</label>
          <input 
            type="date" 
            id="date_debut_to" 
            {...register('date_debut_to')} 
          />
        </div>

        {/* Filtre Date de fin - From */}
        <div className="form-group">
          <label htmlFor="date_fin_from">{t('filters.endDate')} (≥)</label>
          <input 
            type="date" 
            id="date_fin_from" 
            {...register('date_fin_from')} 
          />
        </div>

        {/* Filtre Date de fin - To */}
        <div className="form-group">
          <label htmlFor="date_fin_to">{t('filters.endDate')} (≤)</label>
          <input 
            type="date" 
            id="date_fin_to" 
            {...register('date_fin_to')} 
          />
        </div>
      </div>

      <div className="filters-actions">
        <button type="submit" className="btn btn-primary">
          {t('filters.apply')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          {t('filters.reset')}
        </button>
      </div>
    </form>
  );
}
