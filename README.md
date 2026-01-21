# 🏥 Cohort360 Exercises - Turborepo Monorepo

[![Turborepo](https://img.shields.io/badge/Turborepo-2.7-blueviolet.svg)](https://turbo.build/)
[![Django 5.2 LTS](https://img.shields.io/badge/Django-5.2%20LTS-green.svg)](https://docs.djangoproject.com/en/5.2/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57-orange.svg)](https://playwright.dev/)
[![Tests: 71 passing](https://img.shields.io/badge/tests-71%20passing-brightgreen.svg)](#tests)

> **Candidature Développeur Fullstack Senior - AP-HP/Cohort360**
> 
> Exercices techniques avec architecture monorepo moderne (Turborepo).

---

## 📁 Monorepo Structure

```
cohort360-exercises/
├── apps/                        # Applications
│   ├── web/                     # 🌐 Frontend React (Patient Portal)
│   │   ├── src/
│   │   │   ├── components/      # PrescriptionForm, List, Filters
│   │   │   ├── hooks/           # React Query hooks
│   │   │   ├── api/             # Client Axios
│   │   │   └── test/            # 18 tests Vitest
│   │   └── package.json
│   └── docs/                    # 📚 Documentation (placeholder)
│
├── services/                    # Backend Services
│   ├── api/                     # 🐍 Django REST API
│   │   ├── config/              # Django 5.2 LTS settings
│   │   ├── medical/             # App: Patient, Medication, Prescription
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── tests/           # 29 tests unitaires
│   │   └── pyproject.toml       # uv + dev tools
│   │
│   └── spark/                   # ⚡ Scala/Spark Data Engine
│       ├── src/main/scala/
│       │   └── com/exercise/
│       │       ├── Main.scala
│       │       └── engine/      # CohortSearchEngine
│       └── build.sbt
│
├── packages/                    # Shared Packages
│   ├── types/                   # 📦 @cohort360/types
│   ├── ui/                      # 🎨 @cohort360/ui
│   ├── eslint-config/           # 🔧 @cohort360/eslint-config
│   └── typescript-config/       # 🔧 @cohort360/typescript-config
│
├── e2e/                         # 🧪 Playwright E2E Tests
│   ├── api/                     # API integration tests
│   ├── prescriptions/           # UI tests
│   └── pages/                   # Page Object Models
│
├── turbo.json                   # Turborepo pipeline config
├── package.json                 # Workspace root
└── playwright.config.ts         # E2E test config
```

---

## ✅ Exercise Status

| Exercise | Status | Tests | Stack |
|----------|--------|-------|-------|
| **Backend Django** | ✅ Complete | 29/29 | Django 5.2 LTS, DRF, uv |
| **Frontend React** | ✅ Complete | 18/18 | React 19, TypeScript, Vite |
| **Scala/Spark** | ✅ Complete | Compile | Scala 2.12, Spark 3.5 |
| **E2E Tests** | ✅ Added | 24/24 | Playwright, Page Object Model |

**Total: 71 tests passing**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+ with [uv](https://docs.astral.sh/uv/)
- Scala 2.12 + sbt (for Spark exercise)

### Setup

```bash
# 1. Install root dependencies (includes Turborepo)
npm install

# 2. Setup Django API
cd services/api
uv sync --all-extras
uv run python manage.py migrate
uv run python manage.py seed_demo
cd ../..

# 3. Run development servers
npm run api:dev      # Django on http://127.0.0.1:8000
npm run dev          # React on http://127.0.0.1:3000 (via Turbo)
```

---

## 📜 Available Scripts

### Root Commands (Turborepo)

```bash
# Development
npm run dev              # Start all dev servers (parallel)
npm run build            # Build all packages
npm run lint             # Lint all code
npm run test             # Run all tests
npm run typecheck        # TypeScript type checking

# API (Django)
npm run api:dev          # Start Django server
npm run api:test         # Run Django tests
npm run api:migrate      # Run migrations
npm run api:seed         # Seed demo data

# Spark
npm run spark:build      # Compile Scala
npm run spark:test       # Run Spark tests
npm run spark:run        # Run Spark job

# E2E (Playwright)
npm run test:e2e         # Run all E2E tests
npm run test:e2e:ui      # Interactive UI mode
npm run test:api         # API integration tests only
```

### Package-specific Commands

```bash
# Frontend (apps/web)
cd apps/web
npm run dev              # Vite dev server
npm run build            # Production build
npm test                 # Vitest tests

# Django (services/api)
cd services/api
uv run pytest            # Unit tests
uv run python manage.py shell  # Django shell
```

---

## 🧪 Testing

### Run All Tests

```bash
# Django (29 tests)
npm run api:test

# React/Vitest (18 tests)
cd apps/web && npm test

# E2E (24 tests) - requires servers running
npm run api:dev &        # Start Django
npm run test:e2e         # Run Playwright
```

### Test Coverage

| Suite | Tests | Time | Coverage |
|-------|-------|------|----------|
| Django API | 29 | ~0.7s | Models, Views, Filters |
| React Components | 18 | ~0.9s | Components, Hooks, API |
| E2E Playwright | 24 | ~1.4s | Full user flows |

---

## 📦 Shared Packages

### @cohort360/types

Shared TypeScript types for the healthcare domain:

```typescript
import { Patient, Medication, Prescription, PrescriptionStatus } from '@cohort360/types';
```

### @cohort360/ui

Shared React UI components (future):

```typescript
import { Button, Card } from '@cohort360/ui';
```

### @cohort360/typescript-config

Shared TypeScript configurations:

```json
{
  "extends": "@cohort360/typescript-config/vite.json"
}
```

---

## 🔧 Turborepo Features

### Pipeline Caching

Turborepo caches build outputs for faster rebuilds:

```bash
turbo run build --dry-run   # See what would be built
turbo run build             # Cached builds
```

### Task Dependencies

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## 🏗️ Architecture Decisions

### Why Turborepo?

1. **Incremental builds**: Only rebuild what changed
2. **Parallel execution**: Run tasks in parallel when possible
3. **Shared packages**: Common types and UI components
4. **Consistent tooling**: Shared configs across apps

### Why services/ instead of apps/?

- `apps/` = User-facing applications (web, mobile, docs)
- `services/` = Backend services (api, spark, workers)
- Clear separation of concerns and deployment targets

### Scala/Spark Placement

The Spark service is in `services/spark/` but managed by sbt, not npm workspaces. Turborepo orchestrates it via shell scripts.

---

## 📝 License

MIT © Guillaume FORTAINE

---

## 🔗 Links

- [Original Exercise Instructions](README.original.md)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React 19 Docs](https://react.dev/)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [Playwright Docs](https://playwright.dev/)
