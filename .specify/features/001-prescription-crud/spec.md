# Feature Specification: Prescription CRUD

## Overview

Build a complete prescription management system with CRUD operations across Django REST API and React frontend.

## User Stories

### US-001: View Prescriptions

**As a** medical staff member  
**I want to** see a list of all prescriptions  
**So that** I can review patient medication schedules

**Acceptance Criteria:**
- Display prescriptions in a table with columns: Patient, Medication, Start Date, End Date, Status, Comment
- Show pagination when results exceed page size (10 per page)
- Display total count of prescriptions
- Show empty state when no prescriptions exist

### US-002: Create Prescription

**As a** medical staff member  
**I want to** create a new prescription  
**So that** I can record medication for a patient

**Acceptance Criteria:**
- Form with fields: Patient (select), Medication (select), Start Date, End Date, Status (select), Comment (optional)
- Patient and Medication are required fields
- End Date must be >= Start Date
- Status options: valide, en_attente
- On success: close dialog, refresh list, show success message
- On error: show validation errors

### US-003: Edit Prescription

**As a** medical staff member  
**I want to** modify an existing prescription  
**So that** I can correct or update medication details

**Acceptance Criteria:**
- Edit button on each prescription row
- Opens dialog with pre-filled values
- All fields editable except Patient (read-only after creation)
- Same validation rules as create
- On success: close dialog, refresh list

### US-004: Delete Prescription (Soft Delete)

**As a** medical staff member  
**I want to** delete a prescription  
**So that** cancelled prescriptions are removed from the active list

**Acceptance Criteria:**
- Delete button on each prescription row
- **CRITICAL: Soft delete only** - changes status to 'suppr', does NOT delete from database
- API call: `PATCH /Prescription/{id}` with `{ "status": "suppr" }`
- ❌ NOT `DELETE /Prescription/{id}`
- Deleted prescriptions hidden from default view but accessible via status filter

### US-005: Filter Prescriptions

**As a** medical staff member  
**I want to** filter prescriptions by various criteria  
**So that** I can find specific prescriptions quickly

**Acceptance Criteria:**
- Filter by Patient (dropdown)
- Filter by Medication (dropdown)
- Filter by Status (dropdown: all, valide, en_attente, suppr)
- Filter by Start Date range (from/to)
- Filter by End Date range (from/to)
- Filters persist in URL (shareable links)
- Clear filters button resets all

## API Specification

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /Prescription | List with filters |
| POST | /Prescription | Create new |
| PATCH | /Prescription/{id} | Update (including soft delete) |

### Query Parameters (GET)

| Param | Type | Description |
|-------|------|-------------|
| patient | int | Filter by patient ID |
| medication | int | Filter by medication ID |
| status | string | Filter by status (valide, en_attente, suppr) |
| start_date_from | date | Start date >= this value |
| start_date_to | date | Start date <= this value |
| end_date_from | date | End date >= this value |
| end_date_to | date | End date <= this value |
| page | int | Page number (default: 1) |

### Request Body (POST/PATCH)

```json
{
  "patient": 1,
  "medication": 1,
  "start_date": "2025-03-01",
  "end_date": "2025-04-01",
  "status": "valide",
  "comment": "Optional notes"
}
```

### Response Format

```json
{
  "count": 100,
  "next": "http://.../Prescription?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "patient": 1,
      "patient_name": "Jean Dupont",
      "medication": 1,
      "medication_label": "Paracétamol 500mg",
      "start_date": "2025-03-01",
      "end_date": "2025-04-01",
      "status": "valide",
      "comment": "Notes"
    }
  ]
}
```

## UI Specification

### Components

1. **PrescriptionList** - Main table with data
2. **PrescriptionFilters** - Filter panel
3. **PrescriptionForm** - Create/Edit form (in dialog)
4. **PrescriptionFormDialog** - Dialog wrapper

### URL State

Filters sync to URL using nuqs:
- `?patient=1&status=valide&startDateFrom=2025-01-01&page=2`

## Testing Requirements

### E2E Tests Required

- [ ] Page loads with table visible
- [ ] Create prescription flow
- [ ] Edit prescription flow  
- [ ] **Soft delete changes status to 'suppr'** (critical)
- [ ] Filter by each criterion
- [ ] Pagination navigation
- [ ] URL state persistence

### Unit Tests Required

- [ ] API client functions
- [ ] Form validation
- [ ] React Query hooks
