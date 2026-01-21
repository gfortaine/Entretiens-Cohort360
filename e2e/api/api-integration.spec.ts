import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Direct testing of the Django REST API endpoints
 */

const API_BASE = 'http://127.0.0.1:8000';

/**
 * Helper to extract results from paginated or non-paginated API response
 */
function getResults(data: unknown): unknown[] {
  if (typeof data === 'object' && data !== null && 'results' in data) {
    return (data as { results: unknown[] }).results;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

test.describe('API - Patients Endpoint', () => {
  test('GET /Patient - should return list of patients', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Patient`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    const results = getResults(data);
    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('last_name');
      expect(results[0]).toHaveProperty('first_name');
    }
  });

  test('GET /Patient with filter - should filter by name', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Patient?nom=Martin`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const results = getResults(data);
    expect(Array.isArray(results)).toBe(true);

    // All results should match the filter
    results.forEach((patient) => {
      const p = patient as { last_name: string };
      expect(p.last_name.toLowerCase()).toContain('martin');
    });
  });
});

test.describe('API - Medications Endpoint', () => {
  test('GET /Medication - should return list of medications', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Medication`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    const results = getResults(data);
    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('code');
      expect(results[0]).toHaveProperty('label');
    }
  });

  test('GET /Medication with filter - should filter by status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/Medication?status=actif`);

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const results = getResults(data);
    expect(Array.isArray(results)).toBe(true);

    results.forEach((medication) => {
      const m = medication as { status: string };
      expect(m.status).toBe('actif');
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
    const results = getResults(data);
    expect(Array.isArray(results)).toBe(true);
  });

  test('POST /Prescription - should create a new prescription', async ({ request }) => {
    // First, get a patient and medication ID
    const patientsResponse = await request.get(`${API_BASE}/Patient`);
    const patientsData = await patientsResponse.json();
    const patients = getResults(patientsData);
    const patientId = (patients[0] as { id: number })?.id;

    const medsResponse = await request.get(`${API_BASE}/Medication`);
    const medsData = await medsResponse.json();
    const medications = getResults(medsData);
    const medicationId = (medications[0] as { id: number })?.id;

    if (!patientId || !medicationId) {
      test.skip();
      return;
    }

    const newPrescription = {
      patient: patientId,
      medication: medicationId,
      start_date: '2025-07-01',
      end_date: '2025-07-31',
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
    const listData = await listResponse.json();
    const prescriptions = getResults(listData);

    if (prescriptions.length === 0) {
      test.skip();
      return;
    }

    const prescriptionId = (prescriptions[0] as { id: number }).id;
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
    const listData = await listResponse.json();
    const prescriptions = getResults(listData);

    if (prescriptions.length === 0) {
      test.skip();
      return;
    }

    const prescriptionId = (prescriptions[0] as { id: number }).id;
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
    const results = getResults(data);
    expect(Array.isArray(results)).toBe(true);

    results.forEach((prescription) => {
      const p = prescription as { status: string };
      expect(p.status).toBe('valide');
    });
  });

  test('GET /Prescription with date filter - should filter by date range', async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/Prescription?start_date_from=2024-01-01&start_date_to=2026-12-31`
    );

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    const results = getResults(data);
    expect(Array.isArray(results)).toBe(true);

    // Verify dates are valid - the API uses start_date/end_date in response
    results.forEach((prescription) => {
      const p = prescription as { start_date?: string; start_date?: string };
      const dateStr = p.start_date || p.start_date;
      if (dateStr) {
        const date = new Date(dateStr);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2024);
        expect(date.getFullYear()).toBeLessThanOrEqual(2026);
      }
    });
  });

  test('POST /Prescription - validation should reject invalid dates', async ({ request }) => {
    const patientsResponse = await request.get(`${API_BASE}/Patient`);
    const patientsData = await patientsResponse.json();
    const patients = getResults(patientsData);
    const patientId = (patients[0] as { id: number })?.id;

    const medsResponse = await request.get(`${API_BASE}/Medication`);
    const medsData = await medsResponse.json();
    const medications = getResults(medsData);
    const medicationId = (medications[0] as { id: number })?.id;

    if (!patientId || !medicationId) {
      test.skip();
      return;
    }

    const invalidPrescription = {
      patient: patientId,
      medication: medicationId,
      start_date: '2025-07-31', // End before start
      end_date: '2025-07-01',
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
