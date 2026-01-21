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
├── apps/                        # Deployable Applications
│   ├── web/                     # 🌐 React Frontend (Patient Portal)
│   │   ├── src/
│   │   │   ├── components/      # PrescriptionForm, List, Filters
│   │   │   ├── hooks/           # React Query hooks
│   │   │   ├── api/             # Client Axios
│   │   │   └── test/            # 18 tests Vitest
│   │   └── package.json
│   │
│   ├── api/                     # 🐍 Django REST API
│   │   ├── config/              # Django 5.2 LTS settings
│   │   ├── medical/             # App: Patient, Medication, Prescription
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── tests/           # 29 tests unitaires
│   │   ├── pyproject.toml       # uv + dev tools
│   │   └── package.json         # Turbo proxy for Python
│   │
│   └── spark/                   # ⚡ Scala/Spark Data Engine
│       ├── src/main/scala/
│       │   └── com/exercise/
│       │       ├── Main.scala
│       │       └── engine/      # CohortSearchEngine
│       ├── build.sbt
│       └── package.json         # Turbo proxy for Scala
│
├── packages/                    # Shared Packages
│   ├── types/                   # 📦 @cohort360/types
│   ├── ui/                      # 🎨 @cohort360/ui
│   ├── eslint-config/           # 🔧 @cohort360/eslint-config
│   └── typescript-config/       # 🔧 @cohort360/typescript-config
│
├── docs/                        # 📚 Documentation
│   ├── exercises/               # Original exercise specifications
│   │   ├── django/
│   │   ├── react/
│   │   └── scala/
│   └── README.md
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
cd apps/api
uv sync --all-extras
uv run python manage.py migrate
uv run python manage.py seed_demo
cd ../..

# 3. Run development servers
turbo dev --filter=@cohort360/api   # Django on http://127.0.0.1:8000
turbo dev --filter=@cohort360/web   # React on http://127.0.0.1:3000
# Or run all at once:
turbo dev
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

# Targeted commands (Turbo filters)
turbo dev --filter=@cohort360/api     # Django only
turbo dev --filter=@cohort360/web     # React only
turbo test --filter=@cohort360/api    # Django tests only
turbo test --filter=@cohort360/web    # React tests only

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

# Django (apps/api)
cd apps/api
npm run dev              # Django server (via proxy package.json)
npm run test             # Pytest tests
npm run migrate          # Run migrations
npm run seed             # Seed demo data

# Spark (apps/spark)
cd apps/spark
npm run build            # sbt compile
npm run dev              # sbt run
```

---

## 🧪 Testing

### Run All Tests

```bash
# All tests via Turborepo
turbo test

# Django (29 tests)
turbo test --filter=@cohort360/api

# React/Vitest (18 tests)
turbo test --filter=@cohort360/web

# E2E (24 tests) - requires servers running
turbo dev --filter=@cohort360/api &
npm run test:e2e
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

### Why all apps in `apps/`?

Per [Turborepo best practices](https://turbo.build/repo/docs), **all deployable units belong in `apps/`**:

- `apps/web` = React frontend
- `apps/api` = Django REST API
- `apps/spark` = Scala/Spark data engine

This differs from some patterns that use `services/` for backends, but the official Turborepo convention is to use `apps/` for anything that's deployed, and `packages/` for shared libraries.

### Python/Scala in Turborepo

Non-JavaScript apps (Django, Spark) have **proxy `package.json` files** that expose their scripts to Turborepo:

```json
// apps/api/package.json
{
  "name": "@cohort360/api",
  "scripts": {
    "dev": "uv run python manage.py runserver",
    "test": "uv run pytest"
  }
}
```

This allows `turbo dev` to start all servers in parallel!

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
