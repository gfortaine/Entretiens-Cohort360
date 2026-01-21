# Project Constitution

## Project Overview

**Name:** Cohort360 Prescription Management  
**Domain:** Healthcare / Medical Prescriptions  
**Context:** AP-HP Hospital System (Assistance Publique - Hôpitaux de Paris)

## Governing Principles

### 1. Patient Safety First

All operations involving patient data must prioritize data integrity and safety.

- **Soft Delete Only**: Never hard-delete medical records. Use status changes (`suppr`) to mark records as deleted while preserving audit trail.
- **Data Validation**: All date ranges must be validated (end_date >= start_date)
- **Required Fields**: Patient and medication references are always mandatory

### 2. Specification Compliance

Implementation must strictly follow the documented specifications in `docs/exercises/`.

- API field names may differ between frontend and backend, but functionality must match spec
- When specs conflict, the **Django API spec** is the source of truth for data model
- When specs conflict, the **React spec** is the source of truth for UI behavior

### 3. Consistency & Naming Conventions

- **API Fields**: Use English naming (`start_date`, `end_date`, `status`)
- **URL Parameters**: Use snake_case (`start_date_from`, `patient_id`)
- **TypeScript**: Use camelCase for variables, PascalCase for types
- **Status Values**: Exact strings - `valide`, `en_attente`, `suppr`

### 4. Testing Requirements

- **Unit Tests**: Required for all API endpoints and React hooks
- **E2E Tests**: Required for all CRUD operations
- **Coverage Targets**: 
  - API: All endpoints tested
  - Frontend: All user interactions tested
  - E2E: Happy path + error handling

### 5. Technology Constraints

| Layer | Required Technology |
|-------|---------------------|
| Backend | Django 5.2 LTS + Django REST Framework |
| Frontend | React 19 + TypeScript + Vite |
| UI Components | shadcn/ui |
| URL State | nuqs |
| E2E Testing | Playwright with Page Object Model |
| Monorepo | Turborepo |

## Critical Implementation Rules

### Soft Delete Behavior

```
❌ WRONG: HTTP DELETE → Remove record from database
✅ RIGHT: HTTP PATCH → Set status to 'suppr'
```

### API Response Format

```json
{
  "count": 100,
  "next": "...",
  "previous": "...",
  "results": [...]
}
```

### Date Format

- API: `YYYY-MM-DD` (ISO 8601)
- Display: Localized per user preference

## Quality Gates

Before any feature is considered complete:

1. [ ] All unit tests pass
2. [ ] All E2E tests pass
3. [ ] No TypeScript errors
4. [ ] No ESLint warnings
5. [ ] Soft delete is PATCH, not DELETE
6. [ ] Date validation enforced (end >= start)
