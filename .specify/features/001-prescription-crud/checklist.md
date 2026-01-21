# Quality Checklist: Prescription CRUD

## Pre-Implementation Checks

- [ ] Read and understand `docs/exercises/django/README.md`
- [ ] Read and understand `docs/exercises/react/README.md`
- [ ] Identify any conflicts between specs and document resolution

## Data Model Checks

- [ ] Patient foreign key is required and validated
- [ ] Medication foreign key is required and validated
- [ ] Date fields use ISO 8601 format (YYYY-MM-DD)
- [ ] end_date >= start_date validation exists
- [ ] Status uses exact values: `valide`, `en_attente`, `suppr`

## API Implementation Checks

- [ ] GET /Prescription returns paginated results
- [ ] All filter parameters work correctly
- [ ] POST /Prescription creates with validation
- [ ] PATCH /Prescription/{id} updates partial fields
- [ ] **No DELETE endpoint exists** (soft delete only!)

## Frontend Implementation Checks

### Create/Edit Form
- [ ] Patient selector populated from API
- [ ] Medication selector populated from API
- [ ] Date pickers with proper validation
- [ ] Status dropdown with correct options
- [ ] Form validation matches API requirements

### List View
- [ ] Table displays all required columns
- [ ] Pagination works and syncs to URL
- [ ] Empty state displays correctly
- [ ] Loading state displays correctly

### Delete Operation
- [ ] ✅ Delete button calls `PATCH /Prescription/{id}` with `{ status: "suppr" }`
- [ ] ❌ Delete button does NOT call `DELETE /Prescription/{id}`
- [ ] After delete, row disappears from default filtered view
- [ ] Deleted items visible when filtering by status=suppr

### Filters
- [ ] All filters sync to URL parameters
- [ ] Filters can be cleared
- [ ] Page resets to 1 when filters change
- [ ] Deep links with filters work on page load

## Testing Checks

### Unit Tests
- [ ] API client functions tested
- [ ] Soft delete uses PATCH, not DELETE
- [ ] Form validation tested
- [ ] Error handling tested

### E2E Tests
- [ ] Full CRUD workflow tested
- [ ] Soft delete verified (status changes, not removed)
- [ ] All filters tested
- [ ] Pagination tested
- [ ] URL state persistence tested

## Common Pitfalls to Avoid

| ❌ Wrong | ✅ Right | Why |
|----------|----------|-----|
| `apiClient.delete()` | `apiClient.patch({ status: 'suppr' })` | Medical records must be preserved |
| `date_debut` / `date_fin` | `start_date` / `end_date` | English naming convention |
| Hard-coded status strings | Use constants/enums | Type safety |
| Skip E2E tests | Write E2E tests first | Catch integration issues early |
