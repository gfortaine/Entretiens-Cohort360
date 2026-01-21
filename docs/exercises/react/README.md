# 🌐 React Frontend Exercise

> Prescription Management Web Application

## Exercise Specification

Build a React application to manage medical prescriptions with the following features:

### Required Features

1. **List Prescriptions**
   - Display all prescriptions in a table/list
   - Show patient name, medication, dates, status
   - Pagination support

2. **Create Prescription**
   - Form to create new prescriptions
   - Patient and medication selection
   - Date range picker (start/end dates)
   - Status selection
   - Optional comment field

3. **Edit Prescription**
   - Inline editing or modal form
   - Update any prescription field
   - Validation (end date > start date)

4. **Filter Prescriptions**
   - Filter by patient
   - Filter by medication
   - Filter by status
   - Filter by date range

5. **Delete Prescription**
   - Soft delete (change status to 'suppr')

---

## Implementation

### Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript 5.9 | Type safety |
| Vite | Build tool |
| TanStack Query | Server state management |
| React Hook Form | Form handling |
| Zod | Schema validation |
| Axios | HTTP client |
| Vitest | Unit testing |

### Project Structure

```
apps/web/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance
│   │   └── prescriptions.ts   # API functions
│   ├── components/
│   │   ├── PrescriptionForm.tsx
│   │   ├── PrescriptionList.tsx
│   │   └── PrescriptionFilters.tsx
│   ├── hooks/
│   │   └── usePrescriptions.ts # React Query hooks
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── test/
│   │   ├── api.test.ts
│   │   └── components.test.tsx
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### Running the App

```bash
# From monorepo root
cd apps/web
npm install
npm run dev
```

### Testing

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

---

## API Integration

The frontend connects to the Django API at `http://127.0.0.1:8000`.

### Endpoints Used

- `GET /Patient` - List patients
- `GET /Medication` - List medications
- `GET /Prescription` - List prescriptions (with filters)
- `POST /Prescription` - Create prescription
- `PATCH /Prescription/:id` - Update prescription
- `DELETE /Prescription/:id` - Delete prescription

---

## Tests (18 passing)

### API Tests (`api.test.ts`)
- API client configuration
- Prescription CRUD operations
- Error handling

### Component Tests (`components.test.tsx`)
- PrescriptionForm validation
- PrescriptionList rendering
- PrescriptionFilters behavior
