import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatients, useMedications, useCreatePrescription } from '../hooks/usePrescriptions';
import type { PrescriptionStatus } from '../types';

const prescriptionSchema = z.object({
  patient: z.coerce.number().min(1, 'Le patient est requis'),
  medication: z.coerce.number().min(1, 'Le médicament est requis'),
  date_debut: z.string().min(1, 'La date de début est requise'),
  date_fin: z.string().min(1, 'La date de fin est requise'),
  status: z.enum(['valide', 'en_attente', 'suppr'] as const),
  comment: z.string().optional().nullable(),
}).refine((data) => {
  const startDate = new Date(data.date_debut);
  const endDate = new Date(data.date_fin);
  return endDate >= startDate;
}, {
  message: 'La date de fin doit être supérieure ou égale à la date de début',
  path: ['date_fin'],
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

interface PrescriptionFormProps {
  onSuccess?: () => void;
}

const statusOptions: { value: PrescriptionStatus; label: string }[] = [
  { value: 'valide', label: 'Valide' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'suppr', label: 'Supprimée' },
];

export function PrescriptionForm({ onSuccess }: PrescriptionFormProps) {
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const { data: medications = [], isLoading: medicationsLoading } = useMedications();
  const createMutation = useCreatePrescription();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patient: 0,
      medication: 0,
      date_debut: '',
      date_fin: '',
      status: 'valide' as const,
      comment: '',
    },
  });

  const onSubmit = async (data: unknown) => {
    try {
      await createMutation.mutateAsync(data as PrescriptionFormData);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const isLoading = patientsLoading || medicationsLoading;

  return (
    <form className="prescription-form" onSubmit={handleSubmit(onSubmit)}>
      <h3>➕ Nouvelle Prescription</h3>

      {createMutation.isError && (
        <div className="error-banner" role="alert">
          Une erreur est survenue lors de la création de la prescription.
        </div>
      )}

      {createMutation.isSuccess && (
        <div className="success-banner" role="status">
          ✅ Prescription créée avec succès !
        </div>
      )}

      <div className="form-grid">
        {/* Patient */}
        <div className="form-group">
          <label htmlFor="form-patient">Patient *</label>
          <select
            id="form-patient"
            {...register('patient')}
            disabled={isLoading}
            aria-invalid={!!errors.patient}
          >
            <option value="">Sélectionner un patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.last_name} {p.first_name}
                {p.birth_date && ` (${new Date(p.birth_date).toLocaleDateString('fr-FR')})`}
              </option>
            ))}
          </select>
          {errors.patient && (
            <span className="error-message">{errors.patient.message}</span>
          )}
        </div>

        {/* Médicament */}
        <div className="form-group">
          <label htmlFor="form-medication">Médicament *</label>
          <select
            id="form-medication"
            {...register('medication')}
            disabled={isLoading}
            aria-invalid={!!errors.medication}
          >
            <option value="">Sélectionner un médicament</option>
            {medications
              .filter((m) => m.status === 'actif')
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.code})
                </option>
              ))}
          </select>
          {errors.medication && (
            <span className="error-message">{errors.medication.message}</span>
          )}
        </div>

        {/* Date de début */}
        <div className="form-group">
          <label htmlFor="form-date-debut">Date de début *</label>
          <input
            type="date"
            id="form-date-debut"
            {...register('date_debut')}
            aria-invalid={!!errors.date_debut}
          />
          {errors.date_debut && (
            <span className="error-message">{errors.date_debut.message}</span>
          )}
        </div>

        {/* Date de fin */}
        <div className="form-group">
          <label htmlFor="form-date-fin">Date de fin *</label>
          <input
            type="date"
            id="form-date-fin"
            {...register('date_fin')}
            aria-invalid={!!errors.date_fin}
          />
          {errors.date_fin && (
            <span className="error-message">{errors.date_fin.message}</span>
          )}
        </div>

        {/* Statut */}
        <div className="form-group">
          <label htmlFor="form-status">Statut *</label>
          <select
            id="form-status"
            {...register('status')}
            aria-invalid={!!errors.status}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <span className="error-message">{errors.status.message}</span>
          )}
        </div>

        {/* Commentaire */}
        <div className="form-group form-group-full">
          <label htmlFor="form-comment">Commentaire</label>
          <textarea
            id="form-comment"
            {...register('comment')}
            rows={3}
            placeholder="Ajouter un commentaire (optionnel)"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-success"
          disabled={isSubmitting || createMutation.isPending}
        >
          {createMutation.isPending ? 'Création en cours...' : 'Créer la prescription'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Réinitialiser
        </button>
      </div>
    </form>
  );
}
