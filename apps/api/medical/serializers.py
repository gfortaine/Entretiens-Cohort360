from rest_framework import serializers
from .models import Patient, Medication, Prescription


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "last_name", "first_name", "birth_date"]


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "code", "label", "status"]


class PrescriptionReadSerializer(serializers.ModelSerializer):
    """Serializer pour lecture - inclut les détails patient et médicament."""
    
    patient = PatientSerializer(read_only=True)
    medication = MedicationSerializer(read_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            "id",
            "patient",
            "medication", 
            "start_date",
            "end_date",
            "status",
            "comment",
        ]


class PrescriptionWriteSerializer(serializers.ModelSerializer):
    """Serializer pour création/mise à jour - accepte les IDs."""
    
    class Meta:
        model = Prescription
        fields = [
            "id",
            "patient",
            "medication",
            "start_date",
            "end_date",
            "status",
            "comment",
        ]
        extra_kwargs = {
            'patient': {'required': True},
            'medication': {'required': True},
        }
    
    def validate(self, data):
        """
        Validation métier: end_date >= start_date.
        Gère à la fois création et mise à jour (PATCH).
        """
        start_date = data.get('start_date') or (self.instance.start_date if self.instance else None)
        end_date = data.get('end_date') or (self.instance.end_date if self.instance else None)
        
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({
                "end_date": "La date de fin doit être supérieure ou égale à la date de début."
            })
        return data
    
    def to_representation(self, instance):
        """Utilise le serializer de lecture pour la réponse."""
        return PrescriptionReadSerializer(instance).data
