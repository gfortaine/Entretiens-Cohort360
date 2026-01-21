import { useState } from 'react';
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
import type { PrescriptionCreateDTO, PrescriptionStatus } from '@/types';

interface PrescriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  patient: string;
  medication: string;
  date_debut: string;
  date_fin: string;
  status: PrescriptionStatus;
  comment: string;
}

const initialFormData: FormData = {
  patient: '',
  medication: '',
  date_debut: new Date().toISOString().split('T')[0],
  date_fin: '',
  status: 'valide',
  comment: '',
};

const STATUSES: PrescriptionStatus[] = ['valide', 'en_attente', 'suppr'];

export function PrescriptionFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: PrescriptionFormDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { data: patients = [] } = usePatients();
  const { data: medications = [] } = useMedications();

  const mutation = useMutation({
    mutationFn: (data: PrescriptionCreateDTO) => prescriptionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      setFormData(initialFormData);
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      patient: Number(formData.patient),
      medication: Number(formData.medication),
      date_debut: formData.date_debut,
      date_fin: formData.date_fin,
      status: formData.status,
      comment: formData.comment || null,
    });
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    formData.patient &&
    formData.medication &&
    formData.date_debut &&
    formData.date_fin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('form.title')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Patient */}
            <div className="space-y-2">
              <Label htmlFor="form-patient">{t('form.patient')} *</Label>
              <Select
                value={formData.patient}
                onValueChange={(value) => updateField('patient', value)}
              >
                <SelectTrigger id="form-patient">
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
                value={formData.date_debut}
                onChange={(e) => updateField('date_debut', e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="form-end-date">{t('form.endDate')} *</Label>
              <Input
                id="form-end-date"
                type="date"
                value={formData.date_fin}
                onChange={(e) => updateField('date_fin', e.target.value)}
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
              {t('form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
