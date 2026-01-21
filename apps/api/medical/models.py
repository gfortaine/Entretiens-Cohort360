from django.db import models
from django.core.exceptions import ValidationError


class Patient(models.Model):
    """Représente un patient."""

    last_name = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150)
    birth_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["last_name", "first_name", "id"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.last_name} {self.first_name}"


class Medication(models.Model):
    """Représente un médicament."""

    STATUS_ACTIF = "actif"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_ACTIF, "actif"),
        (STATUS_SUPPR, "suppr"),
    )

    code = models.CharField(max_length=64, unique=True)
    label = models.CharField(max_length=255)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIF)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.code} - {self.label} ({self.status})"


class Prescription(models.Model):
    """
    Représente une prescription médicamenteuse.
    Lie un Patient à un Médicament avec des dates de validité et un statut.
    """

    STATUS_VALIDE = "valide"
    STATUS_EN_ATTENTE = "en_attente"
    STATUS_SUPPR = "suppr"
    STATUS_CHOICES = (
        (STATUS_VALIDE, "valide"),
        (STATUS_EN_ATTENTE, "en_attente"),
        (STATUS_SUPPR, "suppr"),
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="prescriptions",
        help_text="Patient associé à cette prescription"
    )
    medication = models.ForeignKey(
        Medication,
        on_delete=models.CASCADE,
        related_name="prescriptions",
        help_text="Médicament prescrit"
    )
    start_date = models.DateField(
        help_text="Date de début de la prescription (format YYYY-MM-DD)"
    )
    end_date = models.DateField(
        help_text="Date de fin de la prescription (format YYYY-MM-DD)"
    )
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_VALIDE,
        help_text="Statut de la prescription"
    )
    comment = models.TextField(
        null=True,
        blank=True,
        help_text="Commentaire libre sur la prescription"
    )

    class Meta:
        ordering = ["-start_date", "patient", "id"]
        verbose_name = "Prescription"
        verbose_name_plural = "Prescriptions"

    def clean(self) -> None:
        """Validation métier : end_date doit être >= start_date."""
        super().clean()
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValidationError({
                "end_date": "La date de fin doit être supérieure ou égale à la date de début."
            })

    def save(self, *args, **kwargs):
        """Appelle clean() avant chaque sauvegarde pour garantir la cohérence."""
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"Prescription #{self.id}: {self.patient} - {self.medication.label} ({self.status})"
