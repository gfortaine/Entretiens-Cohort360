import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatients, useMedications } from '@/hooks/usePrescriptions';
import { prescriptionsApi } from '@/api/prescriptions';
import type { Prescription, PrescriptionCreateDTO, PrescriptionStatus } from '@/types';

interface PrescriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  prescription?: Prescription; // If provided, dialog is in edit mode
}

interface FormData {
  patient: string;
  medication: string;
  start_date: string;
  end_date: string;
  status: PrescriptionStatus;
  comment: string;
}

const initialFormData: FormData = {
  patient: '',
  medication: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  status: 'valide',
  comment: '',
};

const STATUSES: PrescriptionStatus[] = ['valide', 'en_attente', 'suppr'];

export function PrescriptionFormDialog({
  open,
  onOpenChange,
  onSuccess,
  prescription,
}: PrescriptionFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  const isEditMode = !!prescription;

  const { data: patients = [] } = usePatients();
  const { data: medications = [] } = useMedications();

  // Populate form when editing
  useEffect(() => {
    if (prescription && open) {
      setFormData({
        patient: prescription.patient.id.toString(),
        medication: prescription.medication.id.toString(),
        start_date: prescription.start_date,
        end_date: prescription.end_date || '',
        status: prescription.status,
        comment: prescription.comment || '',
      });
    } else if (!open) {
      setFormData(initialFormData);
    }
  }, [prescription, open]);

  const createMutation = useMutation({
    mutationFn: (data: PrescriptionCreateDTO) => prescriptionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setFormData(initialFormData);
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; payload: Partial<PrescriptionCreateDTO> }) => 
      prescriptionsApi.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setFormData(initialFormData);
      onSuccess();
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      patient: Number(formData.patient),
      medication: Number(formData.medication),
      start_date: formData.start_date,
      end_date: formData.end_date,
      status: formData.status,
      comment: formData.comment || null,
    };
    
    if (isEditMode && prescription) {
      updateMutation.mutate({ id: prescription.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    formData.patient &&
    formData.medication &&
    formData.start_date &&
    formData.end_date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('form.editTitle') : t('form.title')}</DialogTitle>
          <DialogDescription>{isEditMode ? t('form.editDescription') : t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Patient - Read-only in edit mode as per spec */}
            <div className="space-y-2">
              <Label htmlFor="form-patient">{t('form.patient')} *</Label>
              <Select
                value={formData.patient}
                onValueChange={(value) => updateField('patient', value)}
                disabled={isEditMode}
              >
                <SelectTrigger id="form-patient" className={isEditMode ? 'opacity-60' : ''}>
                  <SelectValue placeholder={t('form.selectPatient')} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Medication */}
            <div className="space-y-2">
              <Label htmlFor="form-medication">{t('form.medication')} *</Label>
              <Select
                value={formData.medication}
                onValueChange={(value) => updateField('medication', value)}
              >
                <SelectTrigger id="form-medication">
                  <SelectValue placeholder={t('form.selectMedication')} />
                </SelectTrigger>
                <SelectContent>
                  {medications.map((med) => (
                    <SelectItem key={med.id} value={med.id.toString()}>
                      {med.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="form-start-date">{t('form.startDate')} *</Label>
              <Input
                id="form-start-date"
                type="date"
                value={formData.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="form-end-date">{t('form.endDate')} *</Label>
              <Input
                id="form-end-date"
                type="date"
                value={formData.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="form-status">{t('form.status')}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateField('status', value as PrescriptionStatus)}
            >
              <SelectTrigger id="form-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mutation.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {t('form.error')}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!isValid || mutation.isPending}
              className="bg-[#0063AF] hover:bg-[#004d8a]"
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? t('form.update') : t('form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
