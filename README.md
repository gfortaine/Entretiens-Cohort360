# 🏗️ Fullstack Turborepo Boilerplate

[![Turborepo](https://img.shields.io/badge/Turborepo-2.7-blueviolet.svg)](https://turbo.build/)
[![Django 5.2 LTS](https://img.shields.io/badge/Django-5.2%20LTS-green.svg)](https://docs.djangoproject.com/en/5.2/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57-orange.svg)](https://playwright.dev/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black.svg)](https://ui.shadcn.com/)

> **Production-ready monorepo boilerplate** combining Django REST API + React 19 + Playwright E2E testing.
> 
> Originally built for AP-HP/Cohort360 technical exercises.

---

## 📁 Project Structure

```
├── apps/
│   ├── api/                     # 🐍 Django 5.2 LTS REST API
│   │   ├── config/              # Django settings, URLs
│   │   ├── medical/             # Example CRUD app (Patient, Prescription)
│   │   └── pyproject.toml       # Python deps (uv)
│   │
│   └── web/                     # ⚛️ React 19 + Vite + TypeScript
│       ├── src/
│       │   ├── components/      # UI components (shadcn/ui)
│       │   ├── hooks/           # Custom React hooks
│       │   ├── api/             # API client (Axios)
│       │   └── types/           # TypeScript definitions
│       └── package.json
│
├── packages/                    # 📦 Shared Packages
│   ├── eslint-config/           # ESLint configuration
│   ├── typescript-config/       # TSConfig presets
│   ├── types/                   # Shared TypeScript types
│   └── ui/                      # Shared UI components
│
├── e2e/                         # 🧪 Playwright E2E Tests
│   ├── fixtures/                # Test fixtures
│   ├── pages/                   # Page Object Models
│   └── prescriptions/           # Feature tests
│
├── docs/                        # 📚 Documentation & Specs
│   └── exercises/               # Original exercise specifications
│
├── turbo.json                   # Turborepo pipeline
├── playwright.config.ts         # E2E configuration
└── package.json                 # Workspace root
```

---

## ✨ Features

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Monorepo** | Turborepo | 2.7 |
| **Backend** | Django + DRF | 5.2 LTS |
| **Frontend** | React + Vite | 19 |
| **UI Components** | shadcn/ui | Latest |
| **URL State** | nuqs | 2.x |
| **E2E Testing** | Playwright | 1.57 |
| **Python Tooling** | uv | Latest |

### Key Patterns

- ✅ **CRUD API** with soft delete (status change, not hard delete)
- ✅ **URL State Sync** with nuqs for filters/pagination
- ✅ **Page Object Model** for E2E tests
- ✅ **Shared packages** for types, configs, UI
- ✅ **Turborepo caching** for fast builds

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+ with [uv](https://docs.astral.sh/uv/)

### Setup

```bash
# 1. Clone and install
git clone <your-repo>
cd <project>
npm install

# 2. Setup Django API
cd apps/api
uv sync
uv run python manage.py migrate
uv run python manage.py seed_demo  # Optional: seed demo data

# 3. Return to root
cd ../..

# 4. Start development (all apps)
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start all apps in parallel
npm run build        # Build all apps
npm run lint         # Lint all packages
npm run test         # Run all tests

# Individual apps
npm run dev --filter=web     # Frontend only
npm run dev --filter=api     # API only

# E2E Testing
npm run e2e          # Run Playwright tests
npm run e2e:ui       # Playwright UI mode
```

---

## 📋 Test Coverage

| Suite | Tests | Framework |
|-------|-------|-----------|
| Django API | 29 | pytest |
| Frontend | 18 | Vitest |
| E2E | 89 | Playwright |
| **Total** | **136** | - |

---

## 🔧 Customization

### Adding a New Django App

```bash
cd apps/api
uv run python manage.py startapp myapp
```

### Adding a New React Route

1. Create component in `apps/web/src/pages/`
2. Add route in `apps/web/src/App.tsx`
3. Create E2E page object in `e2e/pages/`

### Adding shadcn/ui Components

```bash
cd apps/web
npx shadcn@latest add button
```

---

## 🌱 Spec-Kit Integration

This boilerplate includes [GitHub Spec-Kit](https://github.com/github/spec-kit) for **Spec-Driven Development**.

### What is Spec-Driven Development?

Instead of coding first and documenting later, you:
1. Define **what & why** in specifications
2. AI agents interpret specs to generate implementations
3. Checklists validate spec compliance

### Spec-Kit Files

```
.specify/
├── constitution.md              # Project principles & rules
├── templates/                   # Spec-kit templates
├── memory/                      # Agent memory (gitignored)
└── features/
    └── 001-prescription-crud/
        ├── spec.md              # Feature specification
        └── checklist.md         # Quality checklist

.github/
├── prompts/                     # Slash command definitions
│   ├── speckit.constitution.prompt.md
│   ├── speckit.specify.prompt.md
│   ├── speckit.plan.prompt.md
│   ├── speckit.tasks.prompt.md
│   └── speckit.implement.prompt.md
└── agents/                      # Agent configurations
```

### Using Spec-Kit Workflow

```bash
# 1. Install specify CLI (one-time)
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 2. Use slash commands in your AI agent (Copilot, Claude, etc.)
/speckit.constitution    # Review/update project principles
/speckit.specify         # Create feature specification
/speckit.plan           # Create implementation plan
/speckit.tasks          # Generate task breakdown
/speckit.implement      # Execute implementation
```

### Example: Adding a New Feature

```bash
# In your AI agent chat:
/speckit.specify Create a medication inventory tracking feature that shows 
stock levels and alerts when medications are running low.

# Then:
/speckit.plan Use React Query for real-time updates, add inventory 
table to Django, create alert component with shadcn/ui.

# Generate tasks:
/speckit.tasks

# Implement:
/speckit.implement
```

### Why This Matters

The soft delete bug we caught (using DELETE instead of PATCH) would have been **prevented** by:
1. Reading `.specify/constitution.md` - states "Soft Delete Only"
2. Checking `.specify/features/001-prescription-crud/checklist.md` - explicit check for PATCH vs DELETE

---

## 📚 Documentation

See [docs/exercises/](docs/exercises/) for the original exercise specifications that this boilerplate was built to solve.

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Built as part of technical exercises for AP-HP/Cohort360.
