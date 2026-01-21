# 📚 Cohort360 Exercises Documentation

This folder contains all documentation for the Cohort360 technical exercises.

## 📁 Structure

```
docs/
├── exercises/                    # Original exercise specifications
│   ├── README.original.md        # Main exercise overview
│   ├── django/                   # Django REST API exercise
│   │   └── README.md             # Full Django exercise spec
│   ├── react/                    # React frontend exercise  
│   │   └── README.md             # Full React exercise spec
│   └── scala/                    # Scala/Spark exercise
│       └── README.md             # Full Scala exercise spec
└── README.md                     # This file
```

## 🎯 Exercise Overview

| Exercise | Description | Status |
|----------|-------------|--------|
| **Django REST API** | Create Prescription model and CRUD endpoints | ✅ Complete |
| **React Frontend** | Build prescription management UI | ✅ Complete |
| **Scala/Spark** | Implement cohort search engine | ✅ Complete |

## 📖 Quick Links

- [Main Exercise Specification](exercises/README.original.md)
- [Django Exercise](exercises/django/README.md)
- [React Exercise](exercises/react/README.md)
- [Scala/Spark Exercise](exercises/scala/README.md)

## 🏗️ Implementation Notes

### Django API (`apps/api`)

- **Framework**: Django 5.2 LTS + Django REST Framework
- **Models**: Patient, Medication, Prescription
- **Features**: Full CRUD, advanced filtering, nested serializers
- **Tests**: 29 unit tests passing

### React Frontend (`apps/web`)

- **Framework**: React 19 + TypeScript + Vite
- **State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Tests**: 18 unit tests passing

### Scala/Spark (`apps/spark`)

- **Framework**: Scala 2.12 + Spark 3.5
- **Purpose**: FHIR cohort search engine
- **Integration**: Solr for patient/resource indexing

### E2E Tests (`e2e/`)

- **Framework**: Playwright
- **Pattern**: Page Object Model
- **Coverage**: API integration + UI flows
- **Tests**: 24 E2E tests passing
