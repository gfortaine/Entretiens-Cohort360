from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from medical.models import Patient, Medication, Prescription


class ApiListTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Patients
        Patient.objects.create(last_name="Martin", first_name="Jeanne", birth_date="1992-03-10")
        Patient.objects.create(last_name="Durand", first_name="Jean", birth_date="1980-05-20")
        Patient.objects.create(last_name="Bernard", first_name="Paul")

        # Medications
        Medication.objects.create(code="PARA500", label="Paracétamol 500mg", status=Medication.STATUS_ACTIF)
        Medication.objects.create(code="IBU200", label="Ibuprofène 200mg", status=Medication.STATUS_SUPPR)

    def test_patient_list(self):
        url = reverse("patient-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 3)

    def test_patient_filter_nom(self):
        url = reverse("patient-list")
        r = self.client.get(url, {"nom": "mart"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all("mart" in p["last_name"].lower() for p in data))

    def test_patient_filter_date(self):
        url = reverse("patient-list")
        r = self.client.get(url, {"date_naissance": "1980-05-20"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all(p["birth_date"] == "1980-05-20" for p in data))

    def test_medication_list(self):
        url = reverse("medication-list")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertGreaterEqual(len(r.json()), 2)

    def test_medication_filter_status(self):
        url = reverse("medication-list")
        r = self.client.get(url, {"status": "actif"})
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertTrue(all(m["status"] == "actif" for m in data))


class PrescriptionAPITests(TestCase):
    """Tests complets pour l'API Prescription."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Création des données de test
        self.patient1 = Patient.objects.create(
            last_name="Dupont", 
            first_name="Marie",
            birth_date="1985-06-15"
        )
        self.patient2 = Patient.objects.create(
            last_name="Martin", 
            first_name="Pierre",
            birth_date="1970-01-20"
        )
        
        self.medication1 = Medication.objects.create(
            code="DOLIPRANE500",
            label="Doliprane 500mg",
            status=Medication.STATUS_ACTIF
        )
        self.medication2 = Medication.objects.create(
            code="AMOX500",
            label="Amoxicilline 500mg",
            status=Medication.STATUS_ACTIF
        )
        
        # Prescription de référence
        self.prescription1 = Prescription.objects.create(
            patient=self.patient1,
            medication=self.medication1,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 31),
            status=Prescription.STATUS_VALIDE,
            comment="Traitement initial"
        )
        self.prescription2 = Prescription.objects.create(
            patient=self.patient2,
            medication=self.medication2,
            start_date=date(2025, 2, 1),
            end_date=date(2025, 2, 28),
            status=Prescription.STATUS_EN_ATTENTE,
            comment="En attente de validation"
        )
    
    # ========== TESTS GET (Liste) ==========
    
    def test_prescription_list(self):
        """Test: GET /Prescription retourne toutes les prescriptions."""
        url = reverse("prescription-list")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertGreaterEqual(len(data), 2)
    
    def test_prescription_list_includes_nested_patient_medication(self):
        """Test: La réponse inclut les détails patient et médicament."""
        url = reverse("prescription-list")
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        first = data[0]
        
        # Vérifie la structure imbriquée
        self.assertIn("patient", first)
        self.assertIn("medication", first)
        self.assertIn("last_name", first["patient"])
        self.assertIn("code", first["medication"])
    
    def test_prescription_filter_by_patient(self):
        """Test: Filtre par patient ID."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"patient": self.patient1.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(all(p["patient"]["id"] == self.patient1.id for p in data))
    
    def test_prescription_filter_by_medication(self):
        """Test: Filtre par medication ID."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"medication": self.medication1.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(all(p["medication"]["id"] == self.medication1.id for p in data))
    
    def test_prescription_filter_by_status(self):
        """Test: Filtre par statut."""
        url = reverse("prescription-list")
        response = self.client.get(url, {"status": "en_attente"})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertTrue(all(p["status"] == "en_attente" for p in data))
    
    def test_prescription_filter_by_date_debut_range(self):
        """Test: Filtre par intervalle de date de début."""
        url = reverse("prescription-list")
        response = self.client.get(url, {
            "date_debut_from": "2025-01-01",
            "date_debut_to": "2025-01-31"
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        # Seule prescription1 a une date de début dans cet intervalle
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], self.prescription1.id)
    
    def test_prescription_filter_by_date_fin_range(self):
        """Test: Filtre par intervalle de date de fin."""
        url = reverse("prescription-list")
        response = self.client.get(url, {
            "date_fin_from": "2025-02-01",
            "date_fin_to": "2025-02-28"
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        # Seule prescription2 a une date de fin dans cet intervalle
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], self.prescription2.id)
    
    def test_prescription_combined_filters(self):
        """Test: Combinaison de plusieurs filtres."""
        url = reverse("prescription-list")
        response = self.client.get(url, {
            "patient": self.patient1.id,
            "status": "valide"
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["patient"]["id"], self.patient1.id)
        self.assertEqual(data[0]["status"], "valide")
    
    # ========== TESTS POST (Création) ==========
    
    def test_prescription_create_success(self):
        """Test: Création d'une prescription valide."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient1.id,
            "medication": self.medication2.id,
            "date_debut": "2025-03-01",
            "date_fin": "2025-04-01",
            "status": "valide",
            "comment": "Nouvelle prescription"
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data["patient"]["id"], self.patient1.id)
        self.assertEqual(data["medication"]["id"], self.medication2.id)
        self.assertEqual(data["start_date"], "2025-03-01")
        self.assertEqual(data["end_date"], "2025-04-01")
        self.assertEqual(data["status"], "valide")
    
    def test_prescription_create_same_start_end_date(self):
        """Test: Création avec date_debut = date_fin (valide)."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient1.id,
            "medication": self.medication1.id,
            "date_debut": "2025-05-01",
            "date_fin": "2025-05-01",
            "status": "valide"
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_prescription_create_fails_end_before_start(self):
        """Test: Erreur si date_fin < date_debut."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient1.id,
            "medication": self.medication1.id,
            "date_debut": "2025-03-15",
            "date_fin": "2025-03-01",  # Avant date_debut
            "status": "valide"
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date_fin", response.json())
    
    def test_prescription_create_fails_missing_patient(self):
        """Test: Erreur si patient manquant."""
        url = reverse("prescription-list")
        payload = {
            "medication": self.medication1.id,
            "date_debut": "2025-03-01",
            "date_fin": "2025-04-01",
            "status": "valide"
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("patient", response.json())
    
    def test_prescription_create_fails_missing_medication(self):
        """Test: Erreur si medication manquant."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient1.id,
            "date_debut": "2025-03-01",
            "date_fin": "2025-04-01",
            "status": "valide"
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("medication", response.json())
    
    def test_prescription_create_fails_invalid_patient_id(self):
        """Test: Erreur si patient ID invalide."""
        url = reverse("prescription-list")
        payload = {
            "patient": 99999,  # ID inexistant
            "medication": self.medication1.id,
            "date_debut": "2025-03-01",
            "date_fin": "2025-04-01",
            "status": "valide"
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_prescription_create_without_comment(self):
        """Test: Création sans commentaire (nullable)."""
        url = reverse("prescription-list")
        payload = {
            "patient": self.patient1.id,
            "medication": self.medication1.id,
            "date_debut": "2025-06-01",
            "date_fin": "2025-06-30",
            "status": "en_attente"
        }
        
        response = self.client.post(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.json()["comment"])
    
    # ========== TESTS PUT/PATCH (Mise à jour) ==========
    
    def test_prescription_update_full(self):
        """Test: Mise à jour complète (PUT)."""
        url = reverse("prescription-detail", args=[self.prescription1.id])
        payload = {
            "patient": self.patient2.id,
            "medication": self.medication2.id,
            "date_debut": "2025-07-01",
            "date_fin": "2025-08-01",
            "status": "suppr",
            "comment": "Prescription mise à jour"
        }
        
        response = self.client.put(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["patient"]["id"], self.patient2.id)
        self.assertEqual(data["status"], "suppr")
    
    def test_prescription_update_partial(self):
        """Test: Mise à jour partielle (PATCH)."""
        url = reverse("prescription-detail", args=[self.prescription1.id])
        payload = {
            "status": "suppr"
        }
        
        response = self.client.patch(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["status"], "suppr")
        # Les autres champs restent inchangés
        self.assertEqual(data["patient"]["id"], self.patient1.id)
    
    def test_prescription_update_fails_end_before_start(self):
        """Test: Erreur de mise à jour si date_fin < date_debut."""
        url = reverse("prescription-detail", args=[self.prescription1.id])
        payload = {
            "date_fin": "2024-12-01"  # Avant la date de début existante (2025-01-01)
        }
        
        response = self.client.patch(url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    # ========== TESTS DELETE ==========
    
    def test_prescription_delete(self):
        """Test: Suppression d'une prescription."""
        url = reverse("prescription-detail", args=[self.prescription1.id])
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Prescription.objects.filter(id=self.prescription1.id).exists())
    
    # ========== TESTS GET (Détail) ==========
    
    def test_prescription_detail(self):
        """Test: GET /Prescription/<id> retourne le détail."""
        url = reverse("prescription-detail", args=[self.prescription1.id])
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["id"], self.prescription1.id)
    
    def test_prescription_detail_not_found(self):
        """Test: 404 si prescription inexistante."""
        url = reverse("prescription-detail", args=[99999])
        
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class PrescriptionModelTests(TestCase):
    """Tests unitaires pour le modèle Prescription."""
    
    def setUp(self):
        self.patient = Patient.objects.create(
            last_name="Test", 
            first_name="Patient"
        )
        self.medication = Medication.objects.create(
            code="TEST001",
            label="Test Medication"
        )
    
    def test_prescription_str(self):
        """Test: Représentation string du modèle."""
        prescription = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            status=Prescription.STATUS_VALIDE
        )
        
        str_repr = str(prescription)
        self.assertIn("Prescription", str_repr)
        self.assertIn(self.medication.label, str_repr)
    
    def test_prescription_validation_end_before_start(self):
        """Test: ValidationError si end_date < start_date."""
        from django.core.exceptions import ValidationError
        
        prescription = Prescription(
            patient=self.patient,
            medication=self.medication,
            start_date=date(2025, 6, 15),
            end_date=date(2025, 6, 1),  # Avant start_date
            status=Prescription.STATUS_VALIDE
        )
        
        with self.assertRaises(ValidationError) as context:
            prescription.full_clean()
        
        self.assertIn("end_date", context.exception.message_dict)
    
    def test_prescription_default_ordering(self):
        """Test: Les prescriptions sont triées par date de début décroissante."""
        p1 = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 1, 31),
            status=Prescription.STATUS_VALIDE
        )
        p2 = Prescription.objects.create(
            patient=self.patient,
            medication=self.medication,
            start_date=date(2025, 3, 1),
            end_date=date(2025, 3, 31),
            status=Prescription.STATUS_VALIDE
        )
        
        prescriptions = list(Prescription.objects.all())
        self.assertEqual(prescriptions[0].id, p2.id)  # Plus récente en premier
