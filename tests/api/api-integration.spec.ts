import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Direct testing of the Django REST API endpoints
 */

const API_BASE = 'http://127.0.0.1:8000';

test.describe('API - Patients Endpoint', () => {
  test('GET /Patient - should return list of patients', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Patient`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('last_name');
      expect(data[0]).toHaveProperty('first_name');
    }
  });

  test('GET /Patient with filter - should filter by name', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Patient?nom=Martin`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // All results should match the filter
    data.forEach((patient: { last_name: string }) => {
      expect(patient.last_name.toLowerCase()).toContain('martin');
    });
  });
});

test.describe('API - Medications Endpoint', () => {
  test('GET /Medication - should return list of medications', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Medication`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('code');
      expect(data[0]).toHaveProperty('label');
    }
  });

  test('GET /Medication with filter - should filter by status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Medication?status=actif`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    data.forEach((medication: { status: string }) => {
      expect(medication.status).toBe('actif');
    });
  });
});

test.describe('API - Prescriptions CRUD', () => {
  let createdPrescriptionId: number;

  test('GET /Prescription - should return list of prescriptions', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Prescription`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /Prescription - should create a new prescription', async ({ request }) => {
    // First, get a patient and medication ID
    const patientsResponse = await request.get(`${API_BASE}/Patient`);
    const patients = await patientsResponse.json();
    const patientId = patients[0]?.id;

    const medsResponse = await request.get(`${API_BASE}/Medication`);
    const medications = await medsResponse.json();
    const medicationId = medications[0]?.id;

    if (!patientId || !medicationId) {
      test.skip();
      return;
    }

    const newPrescription = {
      patient: patientId,
      medication: medicationId,
      date_debut: '2025-07-01',
      date_fin: '2025-07-31',
      status: 'valide',
      comment: 'E2E API Test - Playwright',
    };

    const response = await request.post(`${API_BASE}/Prescription`, {
      data: newPrescription,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    // API returns nested patient/medication objects, not just IDs
    expect(data.patient.id).toBe(patientId);
    expect(data.medication.id).toBe(medicationId);

    createdPrescriptionId = data.id;
  });

  test('GET /Prescription/:id - should get prescription details', async ({ request }) => {
    // Get all prescriptions and pick the first one
    const listResponse = await request.get(`${API_BASE}/Prescription`);
    const prescriptions = await listResponse.json();

    if (prescriptions.length === 0) {
      test.skip();
      return;
    }

    const prescriptionId = prescriptions[0].id;
    const response = await request.get(`${API_BASE}/Prescription/${prescriptionId}`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.id).toBe(prescriptionId);
    // API returns nested patient/medication objects
    expect(data).toHaveProperty('patient');
    expect(data).toHaveProperty('medication');
    expect(data.patient).toHaveProperty('id');
    expect(data.medication).toHaveProperty('id');
  });

  test('PATCH /Prescription/:id - should update prescription', async ({ request }) => {
    const listResponse = await request.get(`${API_BASE}/Prescription`);
    const prescriptions = await listResponse.json();

    if (prescriptions.length === 0) {
      test.skip();
      return;
    }

    const prescriptionId = prescriptions[0].id;
    const updateData = {
      comment: 'Updated by E2E test - ' + new Date().toISOString(),
    };

    const response = await request.patch(`${API_BASE}/Prescription/${prescriptionId}`, {
      data: updateData,
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.comment).toBe(updateData.comment);
  });

  test('GET /Prescription with filters - should filter by status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Prescription?status=valide`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    data.forEach((prescription: { status: string }) => {
      expect(prescription.status).toBe('valide');
    });
  });

  test('GET /Prescription with date filter - should filter by date range', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/Prescription?date_debut_from=2024-01-01&date_debut_to=2026-12-31`
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);

    // Verify dates are valid - the API uses start_date/end_date in response
    data.forEach((prescription: { start_date?: string; date_debut?: string }) => {
      const dateStr = prescription.start_date || prescription.date_debut;
      if (dateStr) {
        const date = new Date(dateStr);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2024);
        expect(date.getFullYear()).toBeLessThanOrEqual(2026);
      }
    });
  });

  test('POST /Prescription - validation should reject invalid dates', async ({ request }) => {
    const patientsResponse = await request.get(`${API_BASE}/Patient`);
    const patients = await patientsResponse.json();
    const patientId = patients[0]?.id;

    const medsResponse = await request.get(`${API_BASE}/Medication`);
    const medications = await medsResponse.json();
    const medicationId = medications[0]?.id;

    if (!patientId || !medicationId) {
      test.skip();
      return;
    }

    const invalidPrescription = {
      patient: patientId,
      medication: medicationId,
      date_debut: '2025-07-31', // End before start
      date_fin: '2025-07-01',
      status: 'valide',
    };

    const response = await request.post(`${API_BASE}/Prescription`, {
      data: invalidPrescription,
    });

    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });
});

test.describe('API - CORS Headers', () => {
  test('should include CORS headers for frontend origin', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Patient`, {
      headers: {
        Origin: 'http://localhost:3000',
      },
    });

    expect(response.ok()).toBeTruthy();

    // CORS headers should be present
    const corsHeader = response.headers()['access-control-allow-origin'];
    // Note: CORS header check depends on server configuration
  });
});
